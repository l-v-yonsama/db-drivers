import {
  AuxiliaryResourceTreatment,
  DiagramFile,
  DiagramViewpoint,
  GenerateDiagramParams,
} from '../../types';
import { parseDiagramFiles } from './diagramFileModel';
import {
  escapeMermaidLabel,
  mermaidCompactLegendLabel,
  mermaidTextCardLabel,
} from './mermaidFlowchart';
import { shortResourceTypeName } from './naming';
import { isFocusParameterOrOutput, isFocusResourceType } from './viewpoints';

type RenderOptions = {
  includeOutputs: boolean;
  includeParameters: boolean;
  viewpoint: DiagramViewpoint;
  auxiliaryTreatment: AuxiliaryResourceTreatment;
};

type DependencyKind = NonNullable<
  DiagramFile['dependencies'][number]['to']['via']
>;

const dependencyStyle: Record<
  DependencyKind,
  {
    color: string;
    width: number;
    dashed: boolean;
  }
> = {
  Ref: { color: '#2563eb', width: 2, dashed: false },
  GetAtt: { color: '#059669', width: 2, dashed: true },
  DependsOn: { color: '#6b7280', width: 2, dashed: true },
  ImportValue: { color: '#7c3aed', width: 3, dashed: false },
};

type ResourceClassification = {
  auxiliaryIds: ReadonlySet<string>;
  mergedAnnotationsByFocusId: ReadonlyMap<string, string[]>;
};

/** Renders CloudFormation dependencies as a styled flowchart. */
export const generateDiagramCfnDependencyGraph = (
  params: GenerateDiagramParams,
): string => {
  const diagramFiles = parseDiagramFiles(params);
  const options: RenderOptions = {
    includeOutputs: params.options?.includeOutputs ?? false,
    includeParameters: params.options?.includeParameters ?? false,
    viewpoint: params.viewpoint ?? 'ApplicationView',
    auxiliaryTreatment: params.auxiliaryTreatment ?? 'MergeIntoLabel',
  };
  const classifications = new Map(
    diagramFiles.map((file) => [
      file.fileIndex,
      classifyDiagramFile(file, options),
    ]),
  );
  const contents = ['```mermaid', 'flowchart TB'];

  diagramFiles.forEach((diagramFile) => {
    renderDiagramFileGroup(
      contents,
      diagramFile,
      options,
      classifications.get(diagramFile.fileIndex) as ResourceClassification,
    );
  });

  const edgeStyles: string[] = [];
  diagramFiles.forEach((diagramFile) => {
    renderDependencyEdges(
      contents,
      edgeStyles,
      diagramFile,
      diagramFiles,
      options,
      classifications,
    );
  });
  contents.push(...edgeStyles);

  if (params.options?.includeLegend !== false && edgeStyles.length > 0) {
    contents.push('  subgraph dependency_legend["Dependency types"]');
    contents.push(
      `    dependency_legend_card["${mermaidCompactLegendLabel('Edge styles', [
        'Blue: Ref',
        'Green dashed: GetAtt',
        'Gray dashed: DependsOn',
        'Purple thick: ImportValue',
      ])}"]:::legendNode`,
    );
    contents.push('  end');
    contents.push(
      '  style dependency_legend fill:#f8fafc,stroke:#94a3b8,stroke-dasharray:4 3',
    );
  }

  contents.push(
    '  classDef resourceNode fill:#ffffff,stroke:#2563eb,color:#0f172a,stroke-width:1px',
  );
  contents.push(
    '  classDef supportingNode fill:#f8fafc,stroke:#64748b,color:#334155,stroke-dasharray:4 3',
  );
  contents.push(
    '  classDef parameterNode fill:#fff7ed,stroke:#ea580c,color:#7c2d12',
  );
  contents.push(
    '  classDef outputNode fill:#f0fdf4,stroke:#16a34a,color:#14532d',
  );
  contents.push(
    '  classDef legendNode fill:#ffffff,stroke:#94a3b8,color:#334155,font-size:11px',
  );
  contents.push('```');
  return contents.join('\n');
};

const classifyDiagramFile = (
  diagramFile: DiagramFile,
  options: RenderOptions,
): ResourceClassification => {
  const auxiliaryIds = new Set<string>();

  if (options.viewpoint !== 'CloudFormationView') {
    diagramFile.resouces.forEach((logicalId) => {
      const { Type } = diagramFile.cfnTemplate.Resources[logicalId];
      if (!isFocusResourceType(options.viewpoint, Type))
        auxiliaryIds.add(logicalId);
    });
    if (!isFocusParameterOrOutput(options.viewpoint)) {
      diagramFile.parameters.forEach((logicalId) =>
        auxiliaryIds.add(logicalId),
      );
      if (options.includeOutputs) {
        diagramFile.outputs.forEach((output) => auxiliaryIds.add(output.id));
      }
    }
  }

  const mergedAnnotationsByFocusId = new Map<string, string[]>();
  if (options.auxiliaryTreatment === 'MergeIntoLabel') {
    diagramFile.dependencies.forEach(({ from, to }) => {
      if (to.fileIndex !== undefined && to.fileIndex !== diagramFile.fileIndex)
        return;
      const fromIsAuxiliary = auxiliaryIds.has(from);
      const toIsAuxiliary = auxiliaryIds.has(to.logicalId);
      if (fromIsAuxiliary === toIsAuxiliary) return;
      const focusId = fromIsAuxiliary ? to.logicalId : from;
      const auxiliaryId = fromIsAuxiliary ? from : to.logicalId;
      const annotations = mergedAnnotationsByFocusId.get(focusId) ?? [];
      annotations.push(auxiliaryId);
      mergedAnnotationsByFocusId.set(focusId, annotations);
    });
  }
  return { auxiliaryIds, mergedAnnotationsByFocusId };
};

const renderDiagramFileGroup = (
  contents: string[],
  diagramFile: DiagramFile,
  options: RenderOptions,
  classification: ResourceClassification,
): void => {
  const prefix = `f${diagramFile.fileIndex}`;
  const keepsAuxiliaryAsOwnNode =
    options.auxiliaryTreatment === 'SeparateGroup';
  const parametersAndOutputsAreAuxiliary =
    options.viewpoint !== 'CloudFormationView';
  const hasParameters =
    options.includeParameters &&
    diagramFile.parameters.length > 0 &&
    (!parametersAndOutputsAreAuxiliary || keepsAuxiliaryAsOwnNode);
  const hasOutputs =
    options.includeOutputs &&
    diagramFile.outputs.length > 0 &&
    (!parametersAndOutputsAreAuxiliary || keepsAuxiliaryAsOwnNode);
  const hasSupporting =
    keepsAuxiliaryAsOwnNode &&
    diagramFile.resouces.some((logicalId) =>
      classification.auxiliaryIds.has(logicalId),
    );

  contents.push(
    `  subgraph ${diagramFile.groupId}["${escapeMermaidLabel(
      diagramFile.fileName,
    )}"]`,
  );
  contents.push('    direction TB');
  renderResourceGroup(contents, diagramFile, prefix, classification);
  if (hasSupporting)
    renderSupportingGroup(contents, diagramFile, prefix, classification);
  if (hasParameters) renderParameterGroup(contents, diagramFile, prefix);
  if (hasOutputs) renderOutputGroup(contents, diagramFile, prefix);
  contents.push('  end');
  contents.push(
    `  style ${diagramFile.groupId} fill:#eff6ff,stroke:#2563eb,stroke-width:2px`,
  );
};

const renderResourceGroup = (
  contents: string[],
  diagramFile: DiagramFile,
  prefix: string,
  classification: ResourceClassification,
): void => {
  const groupId = `${prefix}_resources`;
  contents.push(`    subgraph ${groupId}["Resources"]`);
  diagramFile.resouces.forEach((logicalId) => {
    if (classification.auxiliaryIds.has(logicalId)) return;
    renderResourceNode(
      contents,
      diagramFile,
      prefix,
      logicalId,
      classification,
      'resourceNode',
    );
  });
  contents.push('    end');
  contents.push(`    style ${groupId} fill:#ffffff,stroke:#93c5fd`);
};

const renderSupportingGroup = (
  contents: string[],
  diagramFile: DiagramFile,
  prefix: string,
  classification: ResourceClassification,
): void => {
  const groupId = `${prefix}_supporting`;
  contents.push(`    subgraph ${groupId}["Supporting"]`);
  diagramFile.resouces.forEach((logicalId) => {
    if (!classification.auxiliaryIds.has(logicalId)) return;
    renderResourceNode(
      contents,
      diagramFile,
      prefix,
      logicalId,
      classification,
      'supportingNode',
    );
  });
  contents.push('    end');
  contents.push(
    `    style ${groupId} fill:#f8fafc,stroke:#64748b,stroke-dasharray:4 3`,
  );
};

const renderResourceNode = (
  contents: string[],
  diagramFile: DiagramFile,
  prefix: string,
  logicalId: string,
  classification: ResourceClassification,
  className: 'resourceNode' | 'supportingNode',
): void => {
  const resource = diagramFile.cfnTemplate.Resources[logicalId];
  const annotations =
    classification.mergedAnnotationsByFocusId.get(logicalId) ?? [];
  const detail = [
    shortResourceTypeName(resource.Type),
    annotations.length > 0 ? `with ${annotations.join(', ')}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
  contents.push(
    `      ${prefix}_${logicalId}["${mermaidTextCardLabel(
      logicalId,
      detail,
    )}"]:::${className}`,
  );
};

const renderParameterGroup = (
  contents: string[],
  diagramFile: DiagramFile,
  prefix: string,
): void => {
  const groupId = `${prefix}_parameters`;
  contents.push(`    subgraph ${groupId}["Parameters"]`);
  diagramFile.parameters.forEach((logicalId) => {
    const parameter = diagramFile.cfnTemplate.Parameters[logicalId];
    contents.push(
      `      ${prefix}_${logicalId}["${mermaidTextCardLabel(
        logicalId,
        shortResourceTypeName(parameter.Type),
      )}"]:::parameterNode`,
    );
  });
  contents.push('    end');
  contents.push(`    style ${groupId} fill:#fff7ed,stroke:#ea580c`);
};

const renderOutputGroup = (
  contents: string[],
  diagramFile: DiagramFile,
  prefix: string,
): void => {
  const groupId = `${prefix}_outputs`;
  contents.push(`    subgraph ${groupId}["Outputs"]`);
  diagramFile.outputs.forEach((output) => {
    contents.push(
      `      ${prefix}_${output.id}["${mermaidTextCardLabel(
        output.id,
        `Export: ${output.export.name}`,
      )}"]:::outputNode`,
    );
  });
  contents.push('    end');
  contents.push(`    style ${groupId} fill:#f0fdf4,stroke:#16a34a`);
};

const renderDependencyEdges = (
  contents: string[],
  edgeStyles: string[],
  diagramFile: DiagramFile,
  allDiagramFiles: DiagramFile[],
  options: RenderOptions,
  classifications: ReadonlyMap<number, ResourceClassification>,
): void => {
  diagramFile.dependencies.forEach(({ from, to }) => {
    const targetFileIndex = to.fileIndex ?? diagramFile.fileIndex;
    const targetFile = allDiagramFiles.find(
      (file) => file.fileIndex === targetFileIndex,
    );
    const sourceClassification = classifications.get(diagramFile.fileIndex);
    const targetClassification = classifications.get(targetFileIndex);
    if (
      !sourceClassification ||
      !targetClassification ||
      !targetFile ||
      sourceClassification.auxiliaryIds.has(from) ||
      targetClassification.auxiliaryIds.has(to.logicalId)
    )
      return;

    if (
      (to.kind === 'Parameters' && !options.includeParameters) ||
      (to.kind === 'Outputs' && !options.includeOutputs)
    )
      return;
    if (!['Resources', 'Parameters', 'Outputs'].includes(to.kind)) {
      console.warn(`Unknown dependency kind: ${to.kind}`);
      return;
    }

    const dependencyKind = to.via ?? 'Ref';
    const style = dependencyStyle[dependencyKind];
    const edge = style.dashed
      ? '-.->'
      : dependencyKind === 'ImportValue'
      ? '==>'
      : '-->';
    contents.push(
      `  f${diagramFile.fileIndex}_${from} ${edge}|"${dependencyKind}"| f${targetFileIndex}_${to.logicalId}`,
    );
    edgeStyles.push(
      `  linkStyle ${edgeStyles.length} stroke:${style.color},stroke-width:${
        style.width
      }px${style.dashed ? ',stroke-dasharray:5 5' : ''}`,
    );
  });
};
