// Public surface of the CloudFormation diagram-generation feature - deliberately curated
// (not a blanket `export * from './xxx'` per file) so that a helper newly split out into its
// own module (e.g. walkIntrinsicRefs, getCfnIconString, parseDiagramFiles) stays an
// implementation detail shared between these files instead of silently becoming part of the
// package's public API just because it now lives in an exported-looking place.
export { CfnDeploymentTopologyStructure } from './deploymentTopology';
export { extractResourceDependencies } from './resourceDependencies';
export { generateDiagram } from './generateDiagram';
export { generateDrawioApplicationDiagram } from './drawioApplicationDiagram';
export {
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  generateDrawioCfnDependencyGraph,
} from './drawioInfrastructureDiagrams';
export {
  generateDiagramMultiAzDeploymentTrafficPathsAndProtection,
} from './multiAzDeploymentTrafficPathsAndProtectionDiagram';
export type { ApplicationRelationKind } from './applicationRelations';
export {
  extractApplicationRelations,
  extractUnresolvedApplicationReferences,
  getApplicationIngressRoutes,
  getApplicationNodes,
} from './applicationRelations';
export { parseRefValue } from './intrinsics';
export { getCidrBlock, sanitizeAwsType, sanitizeLogicalId } from './naming';
export { parseCfnJsonTemplate, parseCfnYamlTemplate } from './templateParsing';
