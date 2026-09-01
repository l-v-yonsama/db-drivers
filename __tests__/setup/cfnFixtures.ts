import * as fs from 'fs';
import * as path from 'path';

// Recovered from a 2025-06 prototype (see git-notebook local history, never committed - hence no git blame to point to) and ported onto today's types/naming.
export const FIXTURES_DIR = path.join(__dirname, '../data/cfn');

export const readYamlFixture = (relativePath: string): string =>
  fs.readFileSync(path.join(FIXTURES_DIR, relativePath), 'utf-8');
