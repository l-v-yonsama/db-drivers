import {
  AuxiliaryResourceTreatment,
  DiagramFile,
  DiagramViewpoint,
  GenerateDiagramParams,
} from '../../types';
import { parseDiagramFiles } from './diagramFileModel';
import { getCfnIconString } from './icons';
import { getCidrBlock, resourceServiceLabel } from './naming';
import { isFocusParameterOrOutput, isFocusResourceType } from './viewpoints';

type RenderOptions = {
  includeOutputs: boolean;
  includeParameters: boolean;
  viewpoint: DiagramViewpoint;
  auxiliaryTreatment: AuxiliaryResourceTreatment;
};

/** Which logical/pseudo ids (resources, and - unless viewpoint is CloudFormationView -
 * every Parameter/Output id) count as "auxiliary" for this file under the active viewpoint,
 * plus (only when auxiliaryTreatment is 'MergeIntoLabel') what to fold onto each focus
 * resource's label on their behalf. See classifyDiagramFile(). */
type ResourceClassification = {
  auxiliaryIds: ReadonlySet<string>;
  mergedAnnotationsByFocusId: ReadonlyMap<string, string[]>;
};

/**
 * Renders `CfnDependencyGraph` mode: every template becomes its own group, every *focus*
 * resource in it (see viewpoints.ts) becomes a `service` node (icon + label chosen by
 * resource Type - see getCfnIconString / resourceServiceLabel), and every dependency edge
 * parseDiagramFiles found between two focus resources becomes an arrow. Anything classified
 * *auxiliary* for the active viewpoint is folded in, set aside, or dropped instead, per
 * `auxiliaryTreatment` - see classifyDiagramFile() and AuxiliaryResourceTreatment. With
 * viewpoint 'CloudFormationView' there is no focus/auxiliary distinction at all, so this is
 * "list what's here and how it points at itself" with nothing left out - see
 * architectureDiagram.ts for the VPC-aware alternative that instead places resources inside
 * the network topology they actually belong to.
 */
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

  const contents: string[] = [];
  contents.push('```mermaid');
  contents.push('architecture-beta');

  diagramFiles.forEach((diagramFile) => {
    renderDiagramFileGroup(contents, diagramFile, options);
  });

  contents.push('```');
  return contents.join('\n');
};

/** Classifies every resource/parameter/output in this file as focus-or-auxiliary for
 * `options.viewpoint` (everything is focus under 'CloudFormationView' - see
 * isFocusResourceType/isFocusParameterOrOutput), then - only when `auxiliaryTreatment` is
 * 'MergeIntoLabel' - walks every dependency edge once to work out what each auxiliary id
 * should be folded onto: an edge with exactly one auxiliary endpoint donates that endpoint's
 * id as an annotation on the *other* (focus) endpoint's label; an edge where both ends are
 * focus needs no folding (it renders as a normal arrow instead - see renderDependencyEdges),
 * and one where both ends are auxiliary has no focus endpoint to fold onto, so it - and both
 * resources, if they have no other edge to a focus resource either - simply don't appear
 * anywhere. That last case is a known, accepted gap: an auxiliary resource with no relationship
 * recorded to anything focus-worthy has nowhere to surface at all under MergeIntoLabel
 * (switching to 'SeparateGroup' or picking 'CloudFormationView' are the ways to still see it). */
const classifyDiagramFile = (
  diagramFile: DiagramFile,
  options: RenderOptions,
): ResourceClassification => {
  const auxiliaryIds = new Set<string>();

  if (options.viewpoint !== 'CloudFormationView') {
    diagramFile.resouces.forEach((logicalId) => {
      const { Type } = diagramFile.cfnTemplate.Resources[logicalId];
      if (!isFocusResourceType(options.viewpoint, Type)) {
        auxiliaryIds.add(logicalId);
      }
    });
    if (!isFocusParameterOrOutput(options.viewpoint)) {
      diagramFile.parameters.forEach((logicalId) => auxiliaryIds.add(logicalId));
      diagramFile.outputs.forEach((output) => auxiliaryIds.add(output.id));
    }
  }

  const mergedAnnotationsByFocusId = new Map<string, string[]>();
  if (options.auxiliaryTreatment === 'MergeIntoLabel') {
    diagramFile.dependencies.forEach(({ from, to }) => {
      const fromIsAuxiliary = auxiliaryIds.has(from);
      const toIsAuxiliary = auxiliaryIds.has(to.logicalId);
      if (fromIsAuxiliary === toIsAuxiliary) {
        return; // both focus (renders as a normal arrow) or both auxiliary (nowhere to fold onto)
      }
      const focusId = fromIsAuxiliary ? to.logicalId : from;
      const auxiliaryId = fromIsAuxiliary ? from : to.logicalId;
      const annotations = mergedAnnotationsByFocusId.get(focusId) ?? [];
      annotations.push(`with_${auxiliaryId}`);
      mergedAnnotationsByFocusId.set(focusId, annotations);
    });
  }

  return { auxiliaryIds, mergedAnnotationsByFocusId };
};

/** One template's whole group section: its header, resource/supporting/parameter/output
 * nodes, and its dependency edges. */
const renderDiagramFileGroup = (
  contents: string[],
  diagramFile: DiagramFile,
  options: RenderOptions,
): void => {
  const fileIndexName = `f${diagramFile.fileIndex}`;
  const resourcesGroupId = `${fileIndexName}_resources`;
  const parametersGroupId = `${fileIndexName}_parameters`;
  const outputsGroupId = `${fileIndexName}_outputs`;
  const supportingGroupId = `${fileIndexName}_supporting`;

  const classification = classifyDiagramFile(diagramFile, options);
  // Parameters/Outputs are all-or-nothing per viewpoint (see classifyDiagramFile) - unlike
  // resources, there's no per-item focus/auxiliary split to check.
  const parametersAndOutputsAreAuxiliary = options.viewpoint !== 'CloudFormationView';
  const keepsAuxiliaryAsOwnNode = options.auxiliaryTreatment === 'SeparateGroup';

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
    diagramFile.resouces.some((logicalId) => classification.auxiliaryIds.has(logicalId));

  contents.push(`  %% --- ${diagramFile.fileName} ---`);
  contents.push('');

  contents.push(
    // The label ([...]) turned out to be just as unsafe as the id for a
    // raw hyphenated stack name - architecture-beta's parser chokes on a
    // bare "-" there too (its tokenizer reserves "-" for arrow syntax like
    // "--" / "-->", it isn't free-form quoted text). So groupId
    // (sanitizeLogicalId'd - hyphens become underscores) is used for both,
    // same convention already used for CIDR blocks elsewhere in this file.
    // The original, unsanitized name survives in the `%% ---` comment
    // above (comments aren't tokenized, so hyphens are fine there).
    `  group ${diagramFile.groupId}(logos:aws-cloudformation)[${diagramFile.groupId}]`,
  );
  contents.push(
    `  group ${resourcesGroupId}[Resources] in ${diagramFile.groupId}`,
  );
  if (hasParameters) {
    contents.push(
      `  group ${parametersGroupId}[Parameters] in ${diagramFile.groupId}`,
    );
  }
  if (hasOutputs) {
    contents.push(
      `  group ${outputsGroupId}[Outputs] in ${diagramFile.groupId}`,
    );
  }
  if (hasSupporting) {
    contents.push(
      `  group ${supportingGroupId}[Supporting] in ${diagramFile.groupId}`,
    );
  }
  contents.push('');

  renderResourceNodes(contents, diagramFile, fileIndexName, resourcesGroupId, classification);

  if (hasSupporting) {
    renderSupportingResourceNodes(
      contents,
      diagramFile,
      fileIndexName,
      supportingGroupId,
      classification,
    );
  }

  if (hasParameters) {
    renderParameterNodes(contents, diagramFile, fileIndexName, parametersGroupId);
  }

  if (hasOutputs) {
    renderOutputNodes(contents, diagramFile, fileIndexName, outputsGroupId);
  }

  renderDependencyEdges(contents, diagramFile, fileIndexName, options, classification);

  contents.push('');
};

/** Every *focus* resource, in template order, under the Resources group - an auxiliary one
 * is skipped here regardless of treatment (MergeIntoLabel/Omit: it never gets a node of its
 * own at all; SeparateGroup: it gets one via renderSupportingResourceNodes instead). */
const renderResourceNodes = (
  contents: string[],
  diagramFile: DiagramFile,
  fileIndexName: string,
  resourcesGroupId: string,
  classification: ResourceClassification,
): void => {
  contents.push('  %% Resources');
  diagramFile.resouces.forEach((logicalId) => {
    if (classification.auxiliaryIds.has(logicalId)) {
      return;
    }
    renderResourceNode(
      contents,
      diagramFile,
      fileIndexName,
      resourcesGroupId,
      logicalId,
      classification,
    );
  });
  contents.push('');
};

/** Every *auxiliary* resource, relocated into its own "Supporting" group instead of being
 * folded into a focus label or dropped - only called when auxiliaryTreatment is
 * 'SeparateGroup'. Its node looks exactly like a normal resource node (same icon/label
 * logic); only which group it's placed `in` differs. */
const renderSupportingResourceNodes = (
  contents: string[],
  diagramFile: DiagramFile,
  fileIndexName: string,
  supportingGroupId: string,
  classification: ResourceClassification,
): void => {
  contents.push('  %% Supporting resources (auxiliary for this viewpoint)');
  diagramFile.resouces.forEach((logicalId) => {
    if (!classification.auxiliaryIds.has(logicalId)) {
      return;
    }
    renderResourceNode(
      contents,
      diagramFile,
      fileIndexName,
      supportingGroupId,
      logicalId,
      classification,
    );
  });
  contents.push('');
};

const renderResourceNode = (
  contents: string[],
  diagramFile: DiagramFile,
  fileIndexName: string,
  groupId: string,
  logicalId: string,
  classification: ResourceClassification,
): void => {
  const resource = diagramFile.cfnTemplate.Resources[logicalId];
  const serviceId = `${fileIndexName}_${logicalId}`;
  // Only ever non-empty when auxiliaryTreatment is 'MergeIntoLabel' - classifyDiagramFile()
  // doesn't populate mergedAnnotationsByFocusId under any other treatment.
  const mergedSuffix = mergedAnnotationSuffix(classification, logicalId);

  switch (resource.Type) {
    case 'AWS::EC2::VPC':
      contents.push(
        `  service ${serviceId}${getCfnIconString(
          resource.Type,
        )}[${logicalId} VPC_${getCidrBlock(
          resource.Properties,
        )}${mergedSuffix}] in ${groupId}`,
      );
      break;
    case 'AWS::EC2::Subnet':
      contents.push(
        `  service ${serviceId}${getCfnIconString(
          resource.Type,
        )}[${logicalId} ${
          resource.Properties?.MapPublicIpOnLaunch ? 'Public_' : ''
        }Subnet_${getCidrBlock(resource.Properties)}${mergedSuffix}] in ${groupId}`,
      );
      break;
    default: {
      const iconStr = getCfnIconString(resource.Type);
      contents.push(
        `  service ${serviceId}${iconStr}[${resourceServiceLabel(
          logicalId,
          resource.Type,
          iconStr,
        )}${mergedSuffix}] in ${groupId}`,
      );
      break;
    }
  }
};

const mergedAnnotationSuffix = (
  classification: ResourceClassification,
  logicalId: string,
): string => {
  const annotations = classification.mergedAnnotationsByFocusId.get(logicalId);
  return annotations && annotations.length > 0 ? ` ${annotations.join(' ')}` : '';
};

const renderParameterNodes = (
  contents: string[],
  diagramFile: DiagramFile,
  fileIndexName: string,
  parametersGroupId: string,
): void => {
  contents.push('  %% Parameters');
  diagramFile.parameters.forEach((logicalId) => {
    const serviceId = `${fileIndexName}_${logicalId}`;
    const parameter = diagramFile.cfnTemplate.Parameters[logicalId];
    const iconStr = getCfnIconString(parameter.Type);
    contents.push(
      `  service ${serviceId}${iconStr}[${resourceServiceLabel(
        logicalId,
        parameter.Type,
        iconStr,
      )}] in ${parametersGroupId}`,
    );
  });
  contents.push('');
};

const renderOutputNodes = (
  contents: string[],
  diagramFile: DiagramFile,
  fileIndexName: string,
  outputsGroupId: string,
): void => {
  contents.push('  %% Outputs');
  diagramFile.outputs.forEach((output) => {
    const serviceId = `${fileIndexName}_${output.id}`;
    contents.push(
      `  service ${serviceId}[${output.export.name}] in ${outputsGroupId}`,
    );
  });
  contents.push('');
};

/** An edge renders only when *both* endpoints are focus - true regardless of
 * auxiliaryTreatment (an edge with an auxiliary endpoint either got folded into a label
 * instead under 'MergeIntoLabel', or is explicitly not drawn for a 'SeparateGroup'/'Omit'
 * auxiliary resource) and trivially true for everyone under 'CloudFormationView' (nothing is
 * auxiliary there, so this is unfiltered - identical to how this function behaved before
 * viewpoints existed). */
const renderDependencyEdges = (
  contents: string[],
  diagramFile: DiagramFile,
  fileIndexName: string,
  options: RenderOptions,
  classification: ResourceClassification,
): void => {
  contents.push('  %% Edges');
  diagramFile.dependencies.forEach(({ from, to }) => {
    if (
      classification.auxiliaryIds.has(from) ||
      classification.auxiliaryIds.has(to.logicalId)
    ) {
      return;
    }

    const serviceFromId = `${fileIndexName}_${from}`;
    const serviceToId = `${fileIndexName}_${to.logicalId}`;
    switch (to.kind) {
      case 'Resources':
        contents.push(`  ${serviceFromId}:L --> R:${serviceToId}`);
        break;
      case 'Parameters':
        if (options.includeParameters) {
          contents.push(`  ${serviceFromId}:B --> T:${serviceToId}`);
        }
        break;
      case 'Outputs':
        if (options.includeOutputs) {
          contents.push(`  ${serviceFromId}:B --> T:${serviceToId}`);
        }
        break;
      default:
        console.warn(`Unknown dependency kind: ${to.kind}`);
        break;
    }
  });
};
