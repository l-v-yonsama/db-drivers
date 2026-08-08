import { DiagramFile, GenerateDiagramParams } from '../../types';
import { CfnArchitectureDiagramStructure } from './architectureTopology';
import { parseDiagramFiles } from './diagramFileModel';
import { drawioPage, drawioTemplatePage, pageLink, wrapDrawioPages } from './drawioXml';

type EdgeKind = 'Ref' | 'GetAtt' | 'DependsOn' | 'ImportValue' | 'network';

const edgeStyles: Record<EdgeKind, { color: string; width: number; dashed?: boolean }> = {
  Ref: { color: '#2563eb', width: 2 },
  GetAtt: { color: '#059669', width: 2, dashed: true },
  DependsOn: { color: '#6b7280', width: 2, dashed: true },
  ImportValue: { color: '#7c3aed', width: 3 },
  network: { color: '#0891b2', width: 2, dashed: true },
};

const xmlEscape = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const displayCidr = (value: string): string => {
  const match = value.match(/^(\d+)_(\d+)_(\d+)_(\d+)_(\d+)$/);
  return match ? `${match[1]}.${match[2]}.${match[3]}.${match[4]}/${match[5]}` : value;
};

const groupCell = (id: string, label: string, x: number, y: number, width: number, height: number, parent = '1', fill = '#f8fafc', titleAlign: 'center' | 'left' = 'center'): string =>
  `<mxCell id="${id}" value="${xmlEscape(label)}" style="swimlane;html=1;rounded=1;horizontal=1;startSize=30;fillColor=${fill};strokeColor=#94a3b8;fontStyle=1;align=${titleAlign};${titleAlign === 'left' ? 'spacingLeft=40;' : ''}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;

const nodeCell = (id: string, label: string, x: number, y: number, width: number, height: number, parent: string, fill = '#ffffff', link = ''): string =>
  `<mxCell id="${id}" value="${xmlEscape(label)}"${link} style="rounded=1;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=#64748b;spacing=8;" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;

const edgeCell = (id: string, source: string, target: string, label: string, kind: EdgeKind): string => {
  const style = edgeStyles[kind];
  return `<mxCell id="${id}" value="${xmlEscape(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=${style.color};strokeWidth=${style.width};${style.dashed ? 'dashed=1;dashPattern=8 8;' : ''}endArrow=block;" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry"/></mxCell>`;
};

const addLegend = (cells: string[], y: number, includeNetwork: boolean): void => {
  const items: [string, string, EdgeKind][] = [
    ['Ref', 'Blue solid: Ref', 'Ref'],
    ['GetAtt', 'Green dashed: GetAtt', 'GetAtt'],
    ['DependsOn', 'Gray dashed: DependsOn', 'DependsOn'],
    ['ImportValue', 'Purple thick: ImportValue', 'ImportValue'],
  ];
  if (includeNetwork) items.push(['Network', 'Cyan dashed: network route', 'network']);
  cells.push(groupCell('legend', 'Relationship types', 40, y, includeNetwork ? 1100 : 900, 130, '1', '#f8fafc'));
  items.forEach(([id, label, kind], index) => {
    const style = edgeStyles[kind];
    cells.push(`<mxCell id="legend_${id}" value="${label}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=${style.color};strokeWidth=${style.width};${style.dashed ? 'dashed=1;dashPattern=8 8;' : ''}" vertex="1" parent="legend"><mxGeometry x="${15 + index * 215}" y="45" width="200" height="55" as="geometry"/></mxCell>`);
  });
};

/** Generates an editable draw.io network topology using the same VPC/AZ/Subnet model as
 * ArchitectureDiagram. Resources are intentionally rendered as simple editable cards so the
 * file works without requiring a particular AWS shape library to be installed. */
export const generateDrawioArchitectureDiagram = (params: GenerateDiagramParams): string => {
  const files = parseDiagramFiles({ ...params, options: { ...params.options, includeOutputs: true, includeParameters: true } });
  const structure = new CfnArchitectureDiagramStructure(files);
  const cells: string[] = [];
  const nodeIds = new Map<string, string>();
  const templatePageByLogicalId = new Map<string, string>();
  files.forEach((file) => file.resouces.forEach((logicalId) => {
    const identity = `${file.fileIndex}:${logicalId}`;
    if (!templatePageByLogicalId.has(identity) && file.templateSource) {
      templatePageByLogicalId.set(identity, pageLink(`template_${file.fileIndex}`));
    }
  }));
  let maxHeight = 250;
  let vpcX = 40;
  const vpcTop = 80;
  const azTop = 90;
  const vpcWidths = structure.vpcs.map((vpc) => Math.max(360, 30 + vpc.availabilityZones.length * 350));
  const totalVpcWidth = vpcWidths.reduce((sum, width) => sum + width, 0) + Math.max(0, structure.vpcs.length - 1) * 30;
  const hasInternetGateway = structure.vpcs.some((vpc) => Boolean(vpc.igw));
  if (hasInternetGateway) {
    cells.push(nodeCell('internet', 'Internet', 40 + totalVpcWidth / 2 - 70, 10, 140, 50, '1', '#ecfeff'));
  }

  structure.vpcs.forEach((vpc, vpcIndex) => {
    const vpcId = `vpc_${vpc.fileIndex}_${vpc.logicalId}`;
    const azHeights = vpc.availabilityZones.map((az) =>
      Math.max(70, 45 + az.subnets.reduce((sum, subnet) => sum + 75 + subnet.resources.length * 75, 0)),
    );
    const vpcWidth = vpcWidths[vpcIndex];
    const maxAzHeight = Math.max(...azHeights, 70);
    const networkRowY = azTop + maxAzHeight + 35;
    const networkContentHeight = vpc.loadBalancers.length > 0
      ? 210
      : vpc.resources.length > 0
        ? 80
        : 50;
    const vpcHeight = Math.max(360, networkRowY + networkContentHeight + 30);
    cells.push(groupCell(vpcId, `VPC ${displayCidr(vpc.cidrBlock)}`, vpcX, vpcTop, vpcWidth, vpcHeight, '1', '#dbeafe', 'left'));
    if (vpc.igw) {
      const igwId = `${vpcId}_igw_${vpc.igw.logicalId}`;
      nodeIds.set(`${vpc.igw.fileIndex}:${vpc.igw.logicalId}`, igwId);
      cells.push(nodeCell(igwId, `${vpc.igw.logicalId}<br/><font color="#64748b">Internet Gateway</font>`, vpcWidth / 2 - 75, 15, 150, 50, vpcId, '#ecfeff', templatePageByLogicalId.get(`${vpc.igw.fileIndex}:${vpc.igw.logicalId}`) ?? ''));
      cells.push(edgeCell(`network_${vpcIndex}_igw`, 'internet', igwId, 'routes', 'network'));
    }
    vpc.availabilityZones.forEach((az, azIndex) => {
      const azId = `${vpcId}_az_${azIndex}`;
      const azHeight = azHeights[azIndex];
      cells.push(groupCell(azId, `Availability Zone ${azIndex + 1}`, 15 + azIndex * 350, azTop, 330, azHeight, vpcId, '#eff6ff'));
      let subnetY = 42;
      az.subnets.forEach((subnet) => {
        const subnetId = `${azId}_f${subnet.fileIndex}_${subnet.logicalId}`;
        const subnetHeight = Math.max(60, 45 + subnet.resources.length * 75);
        const subnetTitle = `${subnet.connectivity[0].toUpperCase()}${subnet.connectivity.slice(1)} Subnet ${displayCidr(subnet.cidrBlock)}`;
        cells.push(groupCell(subnetId, subnetTitle, 15, subnetY, 300, subnetHeight, azId, subnet.connectivity === 'public' ? '#f0fdf4' : '#f8fafc'));
        subnet.resources.forEach((resource, resourceIndex) => {
          const resourceId = `${subnetId}_f${resource.fileIndex}_${resource.logicalId}`;
          nodeIds.set(`${resource.fileIndex}:${resource.logicalId}`, resourceId);
          cells.push(nodeCell(resourceId, `${resource.logicalId}<br/><font color="#64748b">${resource.detail.Type}</font>`, 15, 40 + resourceIndex * 75, 270, 55, subnetId, '#ffffff', templatePageByLogicalId.get(`${resource.fileIndex}:${resource.logicalId}`) ?? ''));
        });
        subnetY += subnetHeight + 10;
      });
    });
    vpc.resources.forEach((resource, resourceIndex) => {
      const resourceId = `${vpcId}_f${resource.fileIndex}_${resource.logicalId}`;
      nodeIds.set(`${resource.fileIndex}:${resource.logicalId}`, resourceId);
      cells.push(nodeCell(resourceId, `${resource.logicalId}<br/><font color="#64748b">${resource.placement}</font>`, 20 + resourceIndex * 210, networkRowY, 200, 55, vpcId, '#ffffff', templatePageByLogicalId.get(`${resource.fileIndex}:${resource.logicalId}`) ?? ''));
    });
    vpc.loadBalancers.forEach((loadBalancer, loadBalancerIndex) => {
      const loadBalancerId = `${vpcId}_lb_f${loadBalancer.fileIndex}_${loadBalancer.logicalId}`;
      nodeIds.set(`${loadBalancer.fileIndex}:${loadBalancer.logicalId}`, loadBalancerId);
      cells.push(nodeCell(loadBalancerId, `${loadBalancer.logicalId}<br/><font color="#64748b">Load Balancer</font>`, 20 + loadBalancerIndex * 180, networkRowY + 70, 170, 50, vpcId, '#ecfeff', templatePageByLogicalId.get(`${loadBalancer.fileIndex}:${loadBalancer.logicalId}`) ?? ''));
      if (vpc.igw && loadBalancer.internetFacing) {
        const igwId = `${vpcId}_igw_${vpc.igw.logicalId}`;
        cells.push(edgeCell(`network_${vpcIndex}_lb_${loadBalancerIndex}`, igwId, loadBalancerId, 'routes', 'network'));
      }
      loadBalancer.targetGroups.forEach((targetGroup, targetGroupIndex) => {
        const targetGroupId = `${vpcId}_tg_f${targetGroup.fileIndex}_${targetGroup.logicalId}`;
        nodeIds.set(`${targetGroup.fileIndex}:${targetGroup.logicalId}`, targetGroupId);
        cells.push(nodeCell(targetGroupId, `${targetGroup.logicalId}<br/><font color="#64748b">Target Group</font>`, 20 + targetGroupIndex * 180, networkRowY + 130, 170, 50, vpcId, '#ecfeff', templatePageByLogicalId.get(`${targetGroup.fileIndex}:${targetGroup.logicalId}`) ?? ''));
        cells.push(edgeCell(`network_${vpcIndex}_lb_tg_${targetGroupIndex}`, loadBalancerId, targetGroupId, 'forwards', 'network'));
        targetGroup.targets.forEach((target, targetIndex) => {
          const targetResource = structure.getResourceFrom(target);
          const targetNode = targetResource
            ? nodeIds.get(`${targetResource.resource.fileIndex}:${targetResource.resource.logicalId}`)
            : undefined;
          if (targetNode) cells.push(edgeCell(`network_${vpcIndex}_target_${targetGroupIndex}_${targetIndex}`, targetGroupId, targetNode, 'targets', 'network'));
        });
      });
    });
    if (vpc.igw) {
      const igwId = `${vpcId}_igw_${vpc.igw.logicalId}`;
      vpc.natGateways.forEach((natGateway, natIndex) => {
        const natNode = nodeIds.get(`${natGateway.fileIndex}:${natGateway.logicalId}`);
        if (natNode) cells.push(edgeCell(`network_${vpcIndex}_nat_${natIndex}`, natNode, igwId, 'egress', 'network'));
      });
    }
    maxHeight = Math.max(maxHeight, vpcTop + vpcHeight);
    vpcX += vpcWidth + 30;
  });

  if (structure.standaloneResources.length > 0) {
    const groupId = 'standalone';
    cells.push(groupCell(groupId, 'Standalone resources', 40, maxHeight + 30, 1100, 120, '1', '#f8fafc'));
    structure.standaloneResources.forEach((resource, index) => {
      cells.push(nodeCell(`standalone_${resource.fileIndex}_${resource.logicalId}`, `${resource.logicalId}<br/><font color="#64748b">${resource.detail.Type}</font>`, 15 + index * 220, 45, 200, 50, groupId, '#ffffff', templatePageByLogicalId.get(`${resource.fileIndex}:${resource.logicalId}`) ?? ''));
    });
    maxHeight += 180;
  }
  if (params.options?.includeLegend !== false) addLegend(cells, maxHeight + 30, true);
  const pages = [drawioPage('architecture-diagram', 'ArchitectureDiagram', cells)];
  files.forEach((file) => {
    if (file.templateSource) pages.push(drawioTemplatePage(`template_${file.fileIndex}`, file.fileName, file.templateSource));
  });
  return wrapDrawioPages(pages);
};

/** Generates an editable draw.io dependency graph. Unlike ArchitectureDiagram, this keeps all
 * resources and preserves the dependency kind used to color each connector. */
export const generateDrawioCfnDependencyGraph = (params: GenerateDiagramParams): string => {
  const files = parseDiagramFiles({ ...params, mode: 'CfnDependencyGraph', viewpoint: 'CloudFormationView', options: { ...params.options, includeOutputs: true, includeParameters: true } });
  const cells: string[] = [];
  const nodeIds = new Map<string, string>();
  let maxHeight = 200;
  files.forEach((file, fileIndex) => {
    const groupId = `stack_${fileIndex}`;
    const columns = 3;
    const rows = Math.ceil(file.resouces.length / columns);
    const height = Math.max(180, 55 + rows * 85);
    cells.push(groupCell(groupId, file.fileName, 40 + (fileIndex % 3) * 380, 40 + Math.floor(fileIndex / 3) * 330, 350, height, '1', '#f8fafc'));
    file.resouces.forEach((logicalId, index) => {
      const id = `stack_${fileIndex}_${logicalId}`;
      nodeIds.set(`${fileIndex}:${logicalId}`, id);
      const resource = file.cfnTemplate.Resources[logicalId];
      cells.push(nodeCell(id, `${logicalId}<br/><font color="#64748b">${resource.Type}</font>`, 15 + (index % columns) * 110, 45 + Math.floor(index / columns) * 85, 100, 65, groupId, '#ffffff', file.templateSource ? pageLink(`template_${fileIndex}`) : ''));
    });
    maxHeight = Math.max(maxHeight, 40 + Math.floor(fileIndex / 3) * 330 + height);
  });
  files.forEach((file, fileIndex) => {
    file.dependencies.forEach((dependency, dependencyIndex) => {
      const source = nodeIds.get(`${fileIndex}:${dependency.from}`);
      const target = nodeIds.get(`${dependency.to.fileIndex ?? fileIndex}:${dependency.to.logicalId}`);
      if (source && target) {
        cells.push(edgeCell(`dependency_${fileIndex}_${dependencyIndex}`, source, target, dependency.to.via ?? 'Ref', dependency.to.via ?? 'Ref'));
      }
    });
  });
  if (params.options?.includeLegend !== false) addLegend(cells, maxHeight + 30, false);
  const pages = [drawioPage('cfn-dependency-graph', 'CfnDependencyGraph', cells)];
  files.forEach((file) => {
    if (file.templateSource) pages.push(drawioTemplatePage(`template_${file.fileIndex}`, file.fileName, file.templateSource));
  });
  return wrapDrawioPages(pages);
};
