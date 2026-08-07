import {
  DiagramDependencyTo,
  DiagramFile,
  GenerateDiagramParams,
} from '../../types';
import { parseRefValue, walkIntrinsicRefs } from './intrinsics';
import { sanitizeLogicalId } from './naming';
import { parseCfnJsonTemplate } from './templateParsing';

const findDiagramResource = (
  diagramFile: DiagramFile,
  logicalId: string,
): DiagramDependencyTo | null => {
  if (diagramFile.resouces.includes(logicalId)) {
    return { kind: 'Resources', logicalId };
  }
  if (diagramFile.parameters.includes(logicalId)) {
    return { kind: 'Parameters', logicalId };
  }
  return null;
};

/**
 * Builds the per-template working model both diagram renderers (cfnDependencyGraphDiagram.ts
 * / architectureDiagram.ts) share: one `DiagramFile` per `params.list` entry - parsed
 * template, its resource/parameter names listed out - and then, in a second pass (once every
 * file's resource/parameter names are known, so a same-template `Ref` always resolves), its
 * dependency edges and Outputs filled in.
 */
export const parseDiagramFiles = (params: GenerateDiagramParams): DiagramFile[] => {
  const diagramFiles = buildBaseDiagramFiles(params);

  const includeOutputs = params.options?.includeOutputs ?? false;
  diagramFiles.forEach((diagramFile) => {
    populateResourceDependencies(diagramFile);
    if (includeOutputs) {
      populateOutputs(diagramFile);
    }
  });

  return diagramFiles;
};

/** Pass 1: one `DiagramFile` per template, with its resource/parameter names listed out but
 * `dependencies`/`outputs` still empty - resolving those requires every file's names to be
 * known first (see parseDiagramFiles). */
const buildBaseDiagramFiles = (params: GenerateDiagramParams): DiagramFile[] => {
  const includeParameters = params.options?.includeParameters ?? false;

  return params.list.map(({ fileName, templateJSONString }, fileIndex) => {
    const groupName = fileName.replace(/\.[^/.]+$/, ''); // strip extension
    const cfnTemplate = parseCfnJsonTemplate(templateJSONString);

    return {
      fileIndex,
      fileName,
      groupName,
      groupId: sanitizeLogicalId(groupName),
      cfnTemplate,
      resouces: Object.keys(cfnTemplate.Resources),
      parameters: includeParameters
        ? Object.keys(cfnTemplate.Parameters ?? {})
        : [],
      dependencies: [],
      outputs: [],
    };
  });
};

/** Pass 2a: for every resource in this file, one dependency edge per `DependsOn` entry plus
 * every `Ref`/`!Ref`/`Fn::GetAtt`/`!GetAtt`/`Fn::ImportValue` intrinsic found in its
 * `Properties` that resolves to another resource or parameter *in this same file* (anything
 * that doesn't - a cross-template reference, typically - is silently dropped by
 * findDiagramResource returning null). */
const populateResourceDependencies = (diagramFile: DiagramFile): void => {
  diagramFile.resouces.forEach((logicalId) => {
    const resource = diagramFile.cfnTemplate.Resources[logicalId];
    const refs: DiagramDependencyTo[] = [];

    const dependsOn = resource.DependsOn;
    const dependsOnIds = Array.isArray(dependsOn)
      ? dependsOn
      : dependsOn
        ? [dependsOn]
        : [];
    dependsOnIds.forEach((dep) => {
      const to = findDiagramResource(diagramFile, dep);
      if (to) {
        refs.push({ ...to, via: 'DependsOn' });
      }
    });

    if (resource.Properties) {
      walkIntrinsicRefs(resource.Properties, (via, targetId) => {
        const to = findDiagramResource(diagramFile, targetId);
        if (to) {
          refs.push({ ...to, via });
        }
      });
    }

    const viaPriority: Record<string, number> = {
      DependsOn: 1,
      Ref: 2,
      GetAtt: 3,
      ImportValue: 4,
    };
    const uniqueRefsByTarget = new Map<string, DiagramDependencyTo>();
    refs.forEach((ref) => {
      const existing = uniqueRefsByTarget.get(ref.logicalId);
      if (!existing || (viaPriority[ref.via ?? 'Ref'] > viaPriority[existing.via ?? 'Ref'])) {
        uniqueRefsByTarget.set(ref.logicalId, ref);
      }
    });
    const uniqueRefs = Array.from(uniqueRefsByTarget.values());
    uniqueRefs.forEach((to) => {
      diagramFile.dependencies.push({ from: logicalId, to });
    });
  });
};

/** Pass 2b: one `DiagramOutput` (plus a matching dependency edge, so it renders as an arrow
 * the same way a resource-to-resource reference does) per template Output that points back at
 * a resource this file actually has - an Output whose `Value` doesn't resolve to a known
 * resource is skipped rather than guessed at. */
const populateOutputs = (diagramFile: DiagramFile): void => {
  if (!diagramFile.cfnTemplate.Outputs) {
    return;
  }

  Object.entries(diagramFile.cfnTemplate.Outputs).forEach(
    ([outputId, output]) => {
      const outputRef = parseRefValue(output.Value);
      const logicalId = outputRef.value;
      const res = findDiagramResource(diagramFile, logicalId);
      if (!res) {
        return;
      }

      diagramFile.outputs.push({
        id: `out__${outputId}`,
        value: { logicalId },
        export: {
          name: output.Export?.Name
            ? sanitizeLogicalId(JSON.stringify(output.Export.Name))
            : '',
        },
      });
      diagramFile.dependencies.push({
        from: `out__${outputId}`,
        to: {
          kind: 'Outputs',
          logicalId,
          via: outputRef.type === 'plain'
            ? undefined
            : outputRef.type,
        },
      });
    },
  );
};
