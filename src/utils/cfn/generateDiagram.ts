import { GenerateDiagramParams } from '../../types';
import { generateDiagramArchitectureDiagram } from './architectureDiagram';
import { generateDiagramCfnDependencyGraph } from './cfnDependencyGraphDiagram';

/**
 * The one entry point for turning one or more parsed CloudFormation templates into a
 * Mermaid diagram (an `architecture-beta` block, fenced in ` ```mermaid `) - entirely
 * deterministic, no AI involved, so there's nothing here to hallucinate a relationship
 * that isn't actually in the template.
 */
export const generateDiagram = (params: GenerateDiagramParams): string => {
  switch (params.mode) {
    case 'CfnDependencyGraph':
      return generateDiagramCfnDependencyGraph(params);
    case 'ArchitectureDiagram':
      return generateDiagramArchitectureDiagram(params);
    default: {
      const _exhaustiveCheck: never = params.mode;
      throw new Error(`Unknown mode: ${_exhaustiveCheck}`);
    }
  }
};
