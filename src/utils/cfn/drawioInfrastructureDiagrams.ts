// This file is a re-export barrel: drawioInfrastructureDiagrams.ts's
// implementation lives in ./drawio/*.ts, split by responsibility (see
// readability-maintenance-plan-2026-08-14.md, Phase 4). It exists so
// existing imports of './drawioInfrastructureDiagrams' keep working
// unchanged.
export {
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtectionAsync,
} from './drawio/multiAzInfrastructureDiagram';
export {
  generateDrawioCfnDependencyGraph,
  generateDrawioCfnDependencyGraphAsync,
} from './drawio/cfnDependencyGraphDiagram';
