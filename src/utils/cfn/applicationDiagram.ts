import { GenerateDiagramParams } from '../../types';
import { parseDiagramFiles } from './diagramFileModel';
import {
  ApplicationRelationKind,
  extractApplicationRelations,
  extractUnresolvedApplicationReferences,
  getApplicationIngressRoutes,
  getApplicationNodes,
} from './applicationRelations';

const escape = (value: string): string => value.replace(/["[\]<>]/g, '');

const layerTitle: Record<string, string> = {
  ingress: 'Ingress',
  compute: 'Compute',
  messaging: 'Messaging',
  data: 'Data',
};

const relationStyle: Record<ApplicationRelationKind, {
  color: string;
  width: number;
  edge: string;
}> = {
  'runtime-call': { color: '#2563eb', width: 2, edge: '-->' },
  'event-delivery': { color: '#d97706', width: 2, edge: '-.->' },
  'data-read': { color: '#059669', width: 2, edge: '-->' },
  'data-write': { color: '#7c3aed', width: 3, edge: '==>' },
  'network-route': { color: '#0891b2', width: 2, edge: '-.->' },
};

/** Renders the user-facing application flow. Unlike CfnDependencyGraph, this intentionally
 * emits only semantic runtime relations detected from service-specific properties. */
export const generateDiagramApplicationDiagram = (params: GenerateDiagramParams): string => {
  const files = parseDiagramFiles({
    ...params,
    options: { ...params.options, includeOutputs: true, includeParameters: true },
  });
  const nodes = getApplicationNodes(files);
  const relations = extractApplicationRelations(files);
  const unresolvedReferences = extractUnresolvedApplicationReferences(files);
  const ingressRoutes = getApplicationIngressRoutes(files);
  const contents = ['```mermaid', 'flowchart LR'];

  const hiddenGatewayTypes = new Set([
    'AWS::ApiGateway::Resource',
    'AWS::ApiGateway::Method',
    'AWS::ApiGatewayV2::Route',
  ]);
  const visibleNodes = nodes.filter((node) => !hiddenGatewayTypes.has(node.type));
  const gatewayByFile = new Map<number, string>();
  visibleNodes.forEach((node) => {
    if (node.type === 'AWS::ApiGateway::RestApi' || node.type === 'AWS::ApiGatewayV2::Api') {
      gatewayByFile.set(node.fileIndex, node.id);
    }
  });
  const visibleNodeId = new Map(nodes.map((node) => [
    node.id,
    hiddenGatewayTypes.has(node.type)
      ? gatewayByFile.get(node.fileIndex) ?? node.id
      : node.id,
  ]));
  const visibleRelations = relations
    .map((relation) => ({ ...relation, from: visibleNodeId.get(relation.from) ?? relation.from, to: visibleNodeId.get(relation.to) ?? relation.to }))
    .filter((relation) => relation.from !== relation.to);
  const labelCounts = new Map<string, number>();
  visibleNodes.forEach((node) => labelCounts.set(node.label, (labelCounts.get(node.label) ?? 0) + 1));

  (['ingress', 'compute', 'messaging', 'data'] as const).forEach((layer) => {
    const layerNodes = visibleNodes.filter((node) => node.layer === layer);
    if (layerNodes.length === 0) return;
    contents.push(`  subgraph ${layer}["${layerTitle[layer]}"]`);
    layerNodes.forEach((node) => {
      const stackSuffix = (labelCounts.get(node.label) ?? 0) > 1 ? ` (${node.fileName})` : '';
      const routeList = ingressRoutes.get(node.id) ?? [];
      const routeSuffix = routeList.length > 0 ? ` [${routeList.join(', ')}]` : '';
      contents.push(`    ${node.id}["${escape(node.label + stackSuffix + routeSuffix)}"]`);
    });
    contents.push('  end');
  });

  visibleRelations.forEach((relation, index) => {
    const style = relationStyle[relation.kind];
    contents.push(`  ${relation.from} ${style.edge}|${relation.label}| ${relation.to}`);
    contents.push(
      `  linkStyle ${index} stroke:${style.color},stroke-width:${style.width}px${
        style.edge === '-.->' ? ',stroke-dasharray: 5 5' : ''
      }`,
    );
  });

  if (visibleNodes.length === 0) {
    contents.push('  empty["No application resources found"]');
  }
  if (unresolvedReferences.length > 0) {
    contents.push('  subgraph notes["Notes"]');
    unresolvedReferences.forEach((reference, index) => {
      const note = escape(
        `Unresolved cross-stack reference: ${reference.source} references ${reference.reference} (${reference.reason})`,
      );
      contents.push(`    unresolved_${index}["${note}"]`);
    });
    contents.push('  end');
  }
  if (params.options?.includeLegend !== false && visibleRelations.length > 0) {
    contents.push('  subgraph legend["Relationship types"]');
    contents.push('    runtime_legend["Blue solid: runtime call"]');
    contents.push('    event_legend["Orange dashed: event delivery"]');
    contents.push('    read_legend["Green solid: data read"]');
    contents.push('    write_legend["Purple thick: data write"]');
    contents.push('    network_legend["Cyan dashed: network route"]');
    contents.push('  end');
  }
  contents.push('```');
  return contents.join('\n');
};
