import { spawn } from 'child_process';

export type MermaidParseResult = { ok: true } | { ok: false; message: string };

// @mermaid-js/parser ships ESM-only (its package.json "exports" defines only
// an "import" condition - no "require"/"main"). This project's Jest config
// has module: 'commonjs' (see tsconfig.json/jest.config.js), so an in-process
// `await import('@mermaid-js/parser')` can't resolve it: jest-resolve throws
// "Cannot find module" before a transform even runs, and even bypassing
// TypeScript's import-to-require downleveling via `new Function(...)` still
// hits Jest's own vm sandbox ("You need to run with a version of node that
// supports ES Modules in the VM API") unless the whole suite is switched to
// --experimental-vm-modules - too invasive a change to a shared config just
// for one syntax check. Spawning a plain `node --input-type=module` child
// process sidesteps Jest's module system entirely and lets Node's own,
// unmodified ESM loader resolve the package normally.
const WORKER_SCRIPT = `
import { parse } from '@mermaid-js/parser';
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', async () => {
  const { diagramType, bodies } = JSON.parse(input);
  const results = [];
  for (const body of bodies) {
    try {
      if (/^flowchart\\s+(?:TB|TD|BT|RL|LR)\\s*$/m.test(body.split('\\n')[0])) {
        const subgraphs = (body.match(/^\\s*subgraph\\s+/gm) || []).length;
        const ends = (body.match(/^\\s*end\\s*$/gm) || []).length;
        if (subgraphs !== ends) throw new Error('Unbalanced flowchart subgraphs');
        if ((body.match(/"/g) || []).length % 2 !== 0) throw new Error('Unbalanced flowchart quotes');
      } else {
        await parse(diagramType, body);
      }
      results.push({ ok: true });
    } catch (e) {
      results.push({ ok: false, message: String((e && e.message) || e) });
    }
  }
  process.stdout.write(JSON.stringify(results));
});
`;

/**
 * Confirms generated Mermaid bodies have a supported root and balanced flowchart structure.
 * The installed parser package validates architecture-beta bodies; flowchart output receives
 * deterministic structural checks here and is additionally rendered in the browser QA step.
 */
export const verifyMermaidArchitectureSyntax = (
  bodies: string[],
): Promise<MermaidParseResult[]> => {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--input-type=module', '-e', WORKER_SCRIPT],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `mermaid syntax check process exited with ${code}: ${stderr}`,
          ),
        );
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(
          new Error(
            `Failed to parse mermaid syntax check output: ${stdout}\n${stderr}`,
          ),
        );
      }
    });
    child.stdin.write(JSON.stringify({ diagramType: 'architecture', bodies }));
    child.stdin.end();
  });
};

/** Strips generateDiagram()'s ```mermaid fence, leaving the raw diagram
 * source @mermaid-js/parser expects. */
export const stripMermaidFence = (diagram: string): string =>
  diagram.replace(/^```mermaid\n/, '').replace(/```\s*$/, '');
