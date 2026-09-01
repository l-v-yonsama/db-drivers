import { GenerateDiagramParams } from '../../types';
import { generateDiagramMultiAzDeploymentTrafficPathsAndProtection } from './multiAzDeploymentTrafficPathsAndProtectionDiagram';
import { generateDiagramApplicationDiagram } from './applicationDiagram';
import { generateDiagramCfnDependencyGraph } from './cfnDependencyGraphDiagram';

export const generateDiagram = (params: GenerateDiagramParams): string => {
  switch (params.mode) {
    case 'ApplicationDiagram':
      return generateDiagramApplicationDiagram(params);
    case 'CfnDependencyGraph':
      return generateDiagramCfnDependencyGraph(params);
    case 'MultiAzDeploymentTrafficPathsAndProtection':
      return generateDiagramMultiAzDeploymentTrafficPathsAndProtection(params);
    default: {
      const _exhaustiveCheck: never = params.mode;
      throw new Error(`Unknown mode: ${_exhaustiveCheck}`);
    }
  }
};
