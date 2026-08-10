import { GenerateDiagramParams } from '../../types';
import { CfnDeploymentTopologyStructure } from './deploymentTopology';
import { parseDiagramFiles } from './diagramFileModel';
import {
  drawioLineLegendCells,
  drawioPage,
  drawioTemplatePage,
  pageLink,
  wrapDrawioPages,
  xmlEscape,
} from './drawioXml';
import {
  buildMultiAzDeploymentTrafficPathsAndProtection,
  TrafficProtectionPathKind,
} from './multiAzDeploymentTrafficPathsAndProtection';

type EdgeKind =
  | 'Ref'
  | 'GetAtt'
  | 'DependsOn'
  | 'ImportValue'
  | 'client'
  | 'egress'
  | 'event'
  | 'data'
  | 'security';

const edgeStyles: Record<EdgeKind, { color: string; width: number; dashed?: boolean }> = {
  Ref: { color: '#2563eb', width: 2 },
  GetAtt: { color: '#059669', width: 2, dashed: true },
  DependsOn: { color: '#6b7280', width: 2, dashed: true },
  ImportValue: { color: '#7c3aed', width: 3 },
  client: { color: '#2563eb', width: 2 },
  egress: { color: '#0d9488', width: 2 },
  event: { color: '#ea580c', width: 2, dashed: true },
  data: { color: '#059669', width: 2 },
  security: { color: '#dc2626', width: 2 },
};

const displayCidr = (value: string): string => {
  const match = value.match(/^(\d+)_(\d+)_(\d+)_(\d+)_(\d+)$/);
  return match ? `${match[1]}.${match[2]}.${match[3]}.${match[4]}/${match[5]}` : value;
};

const groupCell = (id: string, label: string, x: number, y: number, width: number, height: number, parent = '1', fill = '#f8fafc', titleAlign: 'center' | 'left' = 'center'): string =>
  `<mxCell id="${id}" value="${xmlEscape(label)}" style="swimlane;html=1;rounded=1;horizontal=1;startSize=30;fillColor=${fill};strokeColor=#94a3b8;fontStyle=1;align=${titleAlign};${titleAlign === 'left' ? 'spacingLeft=40;' : ''}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;

const nodeCell = (id: string, label: string, x: number, y: number, width: number, height: number, parent: string, fill = '#ffffff', link = ''): string =>
  `<mxCell id="${id}" value="${xmlEscape(label)}"${link} style="rounded=1;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=#64748b;spacing=8;" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;

type EdgeAnchors = {
  exitX: number;
  exitY: number;
  entryX: number;
  entryY: number;
};

const edgeCell = (
  id: string,
  source: string,
  target: string,
  label: string,
  kind: EdgeKind,
  bidirectional = false,
  points: { x: number; y: number }[] = [],
  anchors?: EdgeAnchors,
): string => {
  const style = edgeStyles[kind];
  const anchorStyle = anchors
    ? `exitX=${anchors.exitX};exitY=${anchors.exitY};exitDx=0;exitDy=0;` +
      `entryX=${anchors.entryX};entryY=${anchors.entryY};entryDx=0;entryDy=0;`
    : '';
  const pointXml = points.length > 0
    ? `<Array as="points">${points.map((point) =>
        `<mxPoint x="${point.x}" y="${point.y}"/>`).join('')}</Array>`
    : '';
  return `<mxCell id="${id}" value="${xmlEscape(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;jumpStyle=arc;jumpSize=12;html=1;labelBackgroundColor=#ffffff;strokeColor=${style.color};strokeWidth=${style.width};${style.dashed ? 'dashed=1;dashPattern=8 8;' : ''}${bidirectional ? 'startArrow=block;' : ''}endArrow=block;${anchorStyle}" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry">${pointXml}</mxGeometry></mxCell>`;
};

const addDependencyLegend = (cells: string[], y: number): void => {
  const items: [string, string, EdgeKind][] = [
    ['Ref', 'Ref', 'Ref'],
    ['GetAtt', 'GetAtt', 'GetAtt'],
    ['DependsOn', 'DependsOn', 'DependsOn'],
    ['ImportValue', 'ImportValue', 'ImportValue'],
  ];
  cells.push(...drawioLineLegendCells({
    title: 'Relationship types',
    x: 40,
    y,
    width: 1100,
    items: items.map(([id, label, kind]) => {
      const style = edgeStyles[kind];
      return { id, label, ...style };
    }),
  }));
};

const addTrafficProtectionLegend = (cells: string[], y: number): void => {
  const items: [string, string, EdgeKind, boolean][] = [
    ['Client', 'Client request / response', 'client', true],
    ['Egress', 'Outbound / return route', 'egress', true],
    ['Event', 'Asynchronous event', 'event', false],
    ['Data', 'Explicit data access', 'data', false],
    ['Security', 'Security protection', 'security', false],
  ];
  cells.push(...drawioLineLegendCells({
    title: 'Traffic and protection types',
    x: 40,
    y,
    width: 1100,
    items: items.map(([id, label, kind, bidirectional]) => {
      const style = edgeStyles[kind];
      return { id, label, bidirectional, ...style };
    }),
  }));
};

type NodePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ConnectionSide = 'top' | 'right' | 'bottom' | 'left';

type ConnectionLayout = {
  sourceSide: ConnectionSide;
  targetSide: ConnectionSide;
};

const edgeKindForPath = (kind: TrafficProtectionPathKind): EdgeKind => {
  switch (kind) {
    case 'client-request-response': return 'client';
    case 'egress-return': return 'egress';
    case 'event-delivery': return 'event';
    case 'data-access': return 'data';
    case 'security-protection': return 'security';
  }
};

const nodeCenter = (position: NodePosition): { x: number; y: number } => ({
  x: position.x + position.width / 2,
  y: position.y + position.height / 2,
});

const connectionLayout = (
  source: NodePosition,
  target: NodePosition,
  kind: TrafficProtectionPathKind,
  label: string,
): ConnectionLayout => {
  const sourceCenter = nodeCenter(source);
  const targetCenter = nodeCenter(target);
  if (kind === 'egress-return' && label === 'outbound / return route') {
    const side = sourceCenter.x < targetCenter.x ? 'left' : 'right';
    return { sourceSide: side, targetSide: side };
  }
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy >= 0
      ? { sourceSide: 'bottom', targetSide: 'top' }
      : { sourceSide: 'top', targetSide: 'bottom' };
  }
  return dx >= 0
    ? { sourceSide: 'right', targetSide: 'left' }
    : { sourceSide: 'left', targetSide: 'right' };
};

const anchorCoordinates = (
  side: ConnectionSide,
  fraction: number,
): { x: number; y: number } => {
  switch (side) {
    case 'top': return { x: fraction, y: 0 };
    case 'right': return { x: 1, y: fraction };
    case 'bottom': return { x: fraction, y: 1 };
    case 'left': return { x: 0, y: fraction };
  }
};

const absoluteAnchorPoint = (
  position: NodePosition,
  side: ConnectionSide,
  fraction: number,
): { x: number; y: number } => {
  const anchor = anchorCoordinates(side, fraction);
  return {
    x: position.x + position.width * anchor.x,
    y: position.y + position.height * anchor.y,
  };
};

const routePoints = (
  source: NodePosition,
  target: NodePosition,
  sourcePoint: { x: number; y: number },
  targetPoint: { x: number; y: number },
  kind: TrafficProtectionPathKind,
  label: string,
): { x: number; y: number }[] => {
  const sourceCenter = nodeCenter(source);
  const targetCenter = nodeCenter(target);
  if (kind === 'egress-return' && label === 'outbound / return route') {
    const outerLaneX = sourceCenter.x < targetCenter.x
      ? Math.min(source.x, target.x) - 70
      : Math.max(source.x + source.width, target.x + target.width) + 70;
    return [
      { x: outerLaneX, y: sourcePoint.y },
      { x: outerLaneX, y: targetPoint.y },
    ];
  }
  if (Math.abs(sourceCenter.y - targetCenter.y) >=
      Math.abs(sourceCenter.x - targetCenter.x)) {
    const laneY = (sourcePoint.y + targetPoint.y) / 2;
    return [{ x: sourcePoint.x, y: laneY }, { x: targetPoint.x, y: laneY }];
  }
  const laneX = (sourcePoint.x + targetPoint.x) / 2;
  return [{ x: laneX, y: sourcePoint.y }, { x: laneX, y: targetPoint.y }];
};

/** Generates the editable Multi-AZ placement and data-path view. */
export const generateDrawioMultiAzDeploymentTrafficPathsAndProtection = (params: GenerateDiagramParams): string => {
  const files = parseDiagramFiles({ ...params, options: { ...params.options, includeOutputs: true, includeParameters: true } });
  const structure = new CfnDeploymentTopologyStructure(files);
  const trafficPathsAndProtection = buildMultiAzDeploymentTrafficPathsAndProtection(files, structure);
  const cells: string[] = [];
  const nodeIds = new Map<string, string>();
  const nodePositions = new Map<string, NodePosition>();
  const subnetPositions = new Map<string, NodePosition>();
  const templatePageByLogicalId = new Map<string, string>();
  files.forEach((file) => file.resouces.forEach((logicalId) => {
    const identity = `${file.fileIndex}:${logicalId}`;
    if (!templatePageByLogicalId.has(identity) && file.templateSource) {
      templatePageByLogicalId.set(identity, pageLink(`template_${file.fileIndex}`));
    }
  }));
  const registerNode = (
    endpointId: string,
    cellId: string,
    position: NodePosition,
  ): void => {
    nodeIds.set(endpointId, cellId);
    nodePositions.set(endpointId, position);
  };
  const vpcTop = 100;
  const vpcHeight = 1420;
  const azTop = 720;
  const azWidth = 340;
  const azGap = 20;
  const vpcWidths = structure.vpcs.map((vpc) =>
    Math.max(900, 50 + Math.max(1, vpc.availabilityZones.length) * (azWidth + azGap)));
  const totalVpcWidth = vpcWidths.reduce((sum, width) => sum + width, 0) +
    Math.max(0, structure.vpcs.length - 1) * 40;
  const regionalWidth = trafficPathsAndProtection.regionalNodes.length > 0 ? 360 : 0;
  const canvasWidth = 80 + totalVpcWidth + regionalWidth;
  let maxHeight = vpcTop + vpcHeight;
  let vpcX = 40;

  if (trafficPathsAndProtection.paths.some((path) =>
    path.from.id === 'internet' || path.to.id === 'internet')) {
    const internetPosition = {
      x: 40 + totalVpcWidth / 2 - 75,
      y: 20,
      width: 150,
      height: 55,
    };
    cells.push(nodeCell(
      'internet',
      'Internet',
      internetPosition.x,
      internetPosition.y,
      internetPosition.width,
      internetPosition.height,
      '1',
      '#ecfeff',
    ));
    registerNode('internet', 'internet', internetPosition);
  }

  structure.vpcs.forEach((vpc, vpcIndex) => {
    const vpcId = `vpc_${vpc.fileIndex}_${vpc.logicalId}`;
    const vpcWidth = vpcWidths[vpcIndex];
    cells.push(groupCell(vpcId, `VPC ${displayCidr(vpc.cidrBlock)}`, vpcX, vpcTop, vpcWidth, vpcHeight, '1', '#dbeafe', 'left'));
    if (vpc.igw) {
      const endpointId = `f${vpc.igw.fileIndex}_${vpc.igw.logicalId}`;
      const igwId = `node_${endpointId}`;
      const localPosition = { x: vpcWidth / 2 - 85, y: 20, width: 170, height: 55 };
      cells.push(nodeCell(igwId, `${vpc.igw.logicalId}<br/><font color="#64748b">Internet Gateway</font>`, localPosition.x, localPosition.y, localPosition.width, localPosition.height, vpcId, '#ecfeff', templatePageByLogicalId.get(`${vpc.igw.fileIndex}:${vpc.igw.logicalId}`) ?? ''));
      registerNode(endpointId, igwId, { ...localPosition, x: vpcX + localPosition.x, y: vpcTop + localPosition.y });
    }

    vpc.availabilityZones.forEach((az, azIndex) => {
      const azId = `${vpcId}_az_${azIndex}`;
      const azGridWidth = Math.max(1, vpc.availabilityZones.length) * azWidth +
        Math.max(0, vpc.availabilityZones.length - 1) * azGap;
      const azStartX = (vpcWidth - azGridWidth) / 2;
      const azX = azStartX + azIndex * (azWidth + azGap);
      cells.push(groupCell(azId, `Availability Zone ${az.name}`, azX, azTop, azWidth, 650, vpcId, '#eff6ff'));
      const rowCounts: Record<string, number> = { public: 0, private: 0, isolated: 0 };
      const rowY: Record<string, number> = { public: 45, private: 245, isolated: 445 };
      az.subnets.forEach((subnet) => {
        const subnetId = `${azId}_f${subnet.fileIndex}_${subnet.logicalId}`;
        const subnetIndex = rowCounts[subnet.connectivity]++;
        const subnetY = rowY[subnet.connectivity] + subnetIndex * 18;
        const subnetHeight = 140;
        const subnetTitle = `${subnet.connectivity[0].toUpperCase()}${subnet.connectivity.slice(1)} Subnet ${displayCidr(subnet.cidrBlock)}`;
        const fill = subnet.connectivity === 'public'
          ? '#f0fdf4'
          : subnet.connectivity === 'private'
            ? '#eff6ff'
            : '#fffbeb';
        cells.push(groupCell(subnetId, subnetTitle, 10, subnetY, 320, subnetHeight, azId, fill));
        subnetPositions.set(`${subnet.fileIndex}:${subnet.logicalId}`, {
          x: azX + 10,
          y: azTop + subnetY,
          width: 320,
          height: subnetHeight,
        });
        subnet.resources.forEach((resource, resourceIndex) => {
          const endpointId = `f${resource.fileIndex}_${resource.logicalId}`;
          const resourceId = `node_${endpointId}`;
          const outerFirst = azIndex < vpc.availabilityZones.length / 2 ? 15 : 170;
          const innerSecond = outerFirst === 15 ? 170 : 15;
          const nodeX = resourceIndex % 2 === 0 ? outerFirst : innerSecond;
          const nodeY = 50 + Math.floor(resourceIndex / 2) * 68;
          const nodeWidth = 135;
          const nodeHeight = 55;
          cells.push(nodeCell(resourceId, `${resource.logicalId}<br/><font color="#64748b">${resource.detail.Type}</font>`, nodeX, nodeY, nodeWidth, nodeHeight, subnetId, '#ffffff', templatePageByLogicalId.get(`${resource.fileIndex}:${resource.logicalId}`) ?? ''));
          registerNode(endpointId, resourceId, {
            x: vpcX + azX + 10 + nodeX,
            y: vpcTop + azTop + subnetY + nodeY,
            width: nodeWidth,
            height: nodeHeight,
          });
        });
      });
    });

    vpc.resources.forEach((resource) => {
      const endpointId = `f${resource.fileIndex}_${resource.logicalId}`;
      const resourceId = `node_${endpointId}`;
      const connectivity = resource.candidateSubnets[0]?.connectivity ?? 'private';
      const localY = connectivity === 'isolated' ? 1250 : connectivity === 'public' ? 810 : 1050;
      const candidatePositions = resource.candidateSubnets
        .map((subnet) => subnetPositions.get(`${subnet.fileIndex}:${subnet.logicalId}`))
        .filter((position): position is NodePosition => Boolean(position));
      const candidateLeft = candidatePositions.length > 0
        ? Math.min(...candidatePositions.map((position) => position.x))
        : undefined;
      const candidateRight = candidatePositions.length > 0
        ? Math.max(...candidatePositions.map((position) => position.x + position.width))
        : undefined;
      const candidateTop = candidatePositions.length > 0
        ? Math.max(...candidatePositions.map((position) => position.y))
        : undefined;
      const candidateBottom = candidatePositions.length > 0
        ? Math.min(...candidatePositions.map((position) => position.y + position.height))
        : undefined;
      const resourceHeight = 65;
      const horizontalInset = 15;
      const verticalTopInset = 50;
      const verticalBottomInset = 15;
      const fitsCandidateRow = candidateTop !== undefined && candidateBottom !== undefined &&
        candidateBottom - candidateTop >=
          verticalTopInset + resourceHeight + verticalBottomInset;
      const localPosition = candidateLeft !== undefined && candidateRight !== undefined &&
          fitsCandidateRow
        ? {
            x: candidateLeft + horizontalInset,
            y: candidateTop + verticalTopInset,
            width: candidateRight - candidateLeft - horizontalInset * 2,
            height: resourceHeight,
          }
        : {
            x: vpcWidth / 2 - 145,
            y: localY,
            width: 290,
            height: resourceHeight,
          };
      const multiAz = resource.multiAz ? '; Multi-AZ' : '';
      cells.push(nodeCell(resourceId, `${resource.logicalId}<br/><font color="#64748b">${resource.placement}${multiAz}</font>`, localPosition.x, localPosition.y, localPosition.width, localPosition.height, vpcId, '#ffffff', templatePageByLogicalId.get(`${resource.fileIndex}:${resource.logicalId}`) ?? ''));
      registerNode(endpointId, resourceId, { ...localPosition, x: vpcX + localPosition.x, y: vpcTop + localPosition.y });
    });

    const renderedIngressNodes = new Set<string>();
    const addIngressNode = (
      fileIndex: number,
      logicalId: string,
      typeLabel: string,
      row: number,
      column: number,
    ): void => {
      const endpointId = `f${fileIndex}_${logicalId}`;
      if (renderedIngressNodes.has(endpointId)) return;
      renderedIngressNodes.add(endpointId);
      const cellId = `node_${endpointId}`;
      const localPosition = {
        x: vpcWidth / 2 - 150 + column * 320,
        y: 120 + row * 150,
        width: 300,
        height: 78,
      };
      cells.push(nodeCell(cellId, `${logicalId}<br/><font color="#64748b">${typeLabel}</font>`, localPosition.x, localPosition.y, localPosition.width, localPosition.height, vpcId, '#f5f3ff', templatePageByLogicalId.get(`${fileIndex}:${logicalId}`) ?? ''));
      registerNode(endpointId, cellId, { ...localPosition, x: vpcX + localPosition.x, y: vpcTop + localPosition.y });
    };

    vpc.loadBalancers.forEach((loadBalancer, loadBalancerIndex) => {
      addIngressNode(
        loadBalancer.fileIndex,
        loadBalancer.logicalId,
        `Application Load Balancer<br/>${loadBalancer.internetFacing ? 'internet-facing' : 'internal'}`,
        0,
        loadBalancerIndex,
      );
      loadBalancer.listeners.forEach((listener, listenerIndex) => {
        const listenerDetails = [listener.protocol, listener.port ? `:${listener.port}` : undefined]
          .filter(Boolean).join(' ');
        addIngressNode(
          listener.fileIndex,
          listener.logicalId,
          `Listener${listenerDetails ? `<br/>${listenerDetails}` : ''}`,
          1,
          listenerIndex,
        );
        listener.rules.forEach((rule, ruleIndex) => {
          const ruleDetails = [
            ...rule.conditions,
            rule.priority ? `priority: ${rule.priority}` : undefined,
          ].filter((value): value is string => Boolean(value));
          addIngressNode(
            rule.fileIndex,
            rule.logicalId,
            `Listener Rule${ruleDetails.length > 0 ? `<br/>${ruleDetails.join('<br/>')}` : ''}`,
            2,
            ruleIndex,
          );
        });
      });
      loadBalancer.targetGroups.forEach((targetGroup, targetGroupIndex) => {
        const targetGroupDetails = [
          targetGroup.protocol,
          targetGroup.port ? `:${targetGroup.port}` : undefined,
          targetGroup.targetType ? `target type: ${targetGroup.targetType}` : undefined,
        ].filter(Boolean).join(' ');
        addIngressNode(
          targetGroup.fileIndex,
          targetGroup.logicalId,
          `Target Group${targetGroupDetails ? `<br/>${targetGroupDetails}` : ''}`,
          3,
          targetGroupIndex,
        );
      });
    });
    vpcX += vpcWidth + 40;
  });

  const regionalX = 60 + totalVpcWidth;
  if (trafficPathsAndProtection.regionalNodes.length > 0) {
    const regionalHeight = 65 + trafficPathsAndProtection.regionalNodes.length * 150;
    cells.push(groupCell('regional', 'Regional managed services (outside VPC)', regionalX, 140, 320, regionalHeight, '1', '#fff7ed'));
    trafficPathsAndProtection.regionalNodes.forEach((node, index) => {
      const cellId = `node_${node.endpoint.id}`;
      const localPosition = { x: 20, y: 45 + index * 150, width: 280, height: 65 };
      cells.push(nodeCell(cellId, `${node.label}<br/><font color="#64748b">${node.type}</font>`, localPosition.x, localPosition.y, localPosition.width, localPosition.height, 'regional', '#fff7ed', templatePageByLogicalId.get(`${node.endpoint.fileIndex}:${node.endpoint.logicalId}`) ?? ''));
      registerNode(node.endpoint.id, cellId, { ...localPosition, x: regionalX + localPosition.x, y: 140 + localPosition.y });
    });
    maxHeight = Math.max(maxHeight, 140 + regionalHeight);
  }

  if (structure.standaloneResources.length > 0) {
    const groupId = 'standalone';
    cells.push(groupCell(groupId, 'Standalone resources', 40, maxHeight + 30, Math.max(1100, canvasWidth - 80), 120, '1', '#f8fafc'));
    structure.standaloneResources.forEach((resource, index) => {
      const endpointId = `f${resource.fileIndex}_${resource.logicalId}`;
      const cellId = `node_${endpointId}`;
      const localPosition = { x: 15 + index * 220, y: 45, width: 200, height: 50 };
      cells.push(nodeCell(cellId, `${resource.logicalId}<br/><font color="#64748b">${resource.detail.Type}</font>`, localPosition.x, localPosition.y, localPosition.width, localPosition.height, groupId, '#ffffff', templatePageByLogicalId.get(`${resource.fileIndex}:${resource.logicalId}`) ?? ''));
      registerNode(endpointId, cellId, { ...localPosition, x: 40 + localPosition.x, y: maxHeight + 30 + localPosition.y });
    });
    maxHeight += 180;
  }

  const drawablePaths = trafficPathsAndProtection.paths.flatMap((path) => {
    const source = nodeIds.get(path.from.id);
    const target = nodeIds.get(path.to.id);
    const sourcePosition = nodePositions.get(path.from.id);
    const targetPosition = nodePositions.get(path.to.id);
    if (!source || !target || !sourcePosition || !targetPosition) return [];
    return [{ path, source, target, sourcePosition, targetPosition }];
  });
  const sideCounts = new Map<string, number>();
  drawablePaths.forEach(({ path, sourcePosition, targetPosition }) => {
    const layout = connectionLayout(sourcePosition, targetPosition, path.kind, path.label);
    const sourceKey = `${path.from.id}:${layout.sourceSide}`;
    const targetKey = `${path.to.id}:${layout.targetSide}`;
    sideCounts.set(sourceKey, (sideCounts.get(sourceKey) ?? 0) + 1);
    sideCounts.set(targetKey, (sideCounts.get(targetKey) ?? 0) + 1);
  });
  const sideUsage = new Map<string, number>();
  const nextFraction = (endpointId: string, side: ConnectionSide): number => {
    const key = `${endpointId}:${side}`;
    const used = sideUsage.get(key) ?? 0;
    sideUsage.set(key, used + 1);
    return (used + 1) / ((sideCounts.get(key) ?? 1) + 1);
  };

  drawablePaths.forEach(({
    path,
    source,
    target,
    sourcePosition,
    targetPosition,
  }, index) => {
    const layout = connectionLayout(sourcePosition, targetPosition, path.kind, path.label);
    const sourceFraction = nextFraction(path.from.id, layout.sourceSide);
    const targetFraction = nextFraction(path.to.id, layout.targetSide);
    const sourceAnchor = anchorCoordinates(layout.sourceSide, sourceFraction);
    const targetAnchor = anchorCoordinates(layout.targetSide, targetFraction);
    const sourcePoint = absoluteAnchorPoint(sourcePosition, layout.sourceSide, sourceFraction);
    const targetPoint = absoluteAnchorPoint(targetPosition, layout.targetSide, targetFraction);
    cells.push(edgeCell(
      `path_${index}_${path.kind}`,
      source,
      target,
      path.label,
      edgeKindForPath(path.kind),
      path.bidirectional,
      routePoints(
        sourcePosition,
        targetPosition,
        sourcePoint,
        targetPoint,
        path.kind,
        path.label,
      ),
      {
        exitX: sourceAnchor.x,
        exitY: sourceAnchor.y,
        entryX: targetAnchor.x,
        entryY: targetAnchor.y,
      },
    ));
  });

  if (params.options?.includeLegend !== false) addTrafficProtectionLegend(cells, maxHeight + 30);
  const pages = [drawioPage('multi-az-traffic-paths-protection', 'Multi-AZ Deployment, Traffic Paths & Protection', cells)];
  files.forEach((file) => {
    if (file.templateSource) pages.push(drawioTemplatePage(`template_${file.fileIndex}`, file.fileName, file.templateSource));
  });
  return wrapDrawioPages(pages);
};

/** Generates an editable draw.io dependency graph. Unlike MultiAzDeploymentTrafficPathsAndProtection, this keeps all
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
  if (params.options?.includeLegend !== false) {
    addDependencyLegend(cells, maxHeight + 30);
  }
  const pages = [drawioPage('cfn-dependency-graph', 'CfnDependencyGraph', cells)];
  files.forEach((file) => {
    if (file.templateSource) pages.push(drawioTemplatePage(`template_${file.fileIndex}`, file.fileName, file.templateSource));
  });
  return wrapDrawioPages(pages);
};
