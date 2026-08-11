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
  | 'membership'
  | 'permission'
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
  membership: { color: '#64748b', width: 2, dashed: true },
  permission: { color: '#7c3aed', width: 2, dashed: true },
  security: { color: '#dc2626', width: 2 },
};

const displayCidr = (value: string): string => {
  const match = value.match(/^(\d+)_(\d+)_(\d+)_(\d+)_(\d+)$/);
  return match ? `${match[1]}.${match[2]}.${match[3]}.${match[4]}/${match[5]}` : value;
};

const groupCell = (id: string, label: string, x: number, y: number, width: number, height: number, parent = '1', fill = '#f8fafc', titleAlign: 'center' | 'left' = 'center'): string =>
  `<mxCell id="${id}" value="${xmlEscape(label)}" style="swimlane;html=1;rounded=1;horizontal=1;startSize=30;fillColor=${fill};strokeColor=#94a3b8;fontStyle=1;align=${titleAlign};${titleAlign === 'left' ? 'spacingLeft=40;' : ''}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;

const nodeCell = (id: string, label: string, x: number, y: number, width: number, height: number, parent: string, fill = '#ffffff', link = '', topAlign = false): string =>
  `<mxCell id="${id}" value="${xmlEscape(label)}"${link} style="rounded=1;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=#64748b;spacing=8;${topAlign ? 'verticalAlign=top;align=left;' : ''}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;

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

/** Only lists a legend row for a relationship kind that actually occurs among `usedKinds` - the
 * generated paths for this specific diagram - instead of always listing the full fixed set of
 * seven kinds. A row with zero matching edges (for example "Security protection" when no WAF Web
 * ACL association is proven) sends a reader unfamiliar with the notation hunting for an arrow
 * that was never drawn. */
const addTrafficProtectionLegend = (
  cells: string[],
  y: number,
  usedKinds: Set<TrafficProtectionPathKind>,
): void => {
  const items: [string, string, EdgeKind, boolean, TrafficProtectionPathKind][] = [
    ['Client', 'Client request / response', 'client', true, 'client-request-response'],
    ['Egress', 'Outbound / return route', 'egress', true, 'egress-return'],
    ['Event', 'Asynchronous event', 'event', false, 'event-delivery'],
    ['Data', 'Explicit data access', 'data', false, 'data-access'],
    ['Membership', 'Resource membership', 'membership', false, 'resource-membership'],
    ['Permission', 'Security-group permission', 'permission', false, 'security-permission'],
    ['Security', 'Security protection', 'security', false, 'security-protection'],
  ];
  const visibleItems = items.filter(([, , , , pathKind]) => usedKinds.has(pathKind));
  if (visibleItems.length === 0) return;
  cells.push(...drawioLineLegendCells({
    title: 'Traffic and protection types',
    x: 40,
    y,
    width: 1100,
    items: visibleItems.map(([id, label, kind, bidirectional]) => {
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
    case 'resource-membership': return 'membership';
    case 'security-permission': return 'permission';
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
  // Endpoint ids absorbed into a parent's containment box (see resource-membership handling
  // below), across all VPCs - their "member of" edge is dropped from the drawn path list since
  // containment already shows the relationship.
  const containedMemberIds = new Set<string>();
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
  // The height a VPC box needs when no subnet tier has to stack more than one VPC-level
  // resource - matches the previous fixed layout exactly. A VPC whose isolated/private tier
  // needs to stack several resources (see azHeight below) grows taller than this.
  const defaultVpcHeight = 1420;
  const azTop = 720;
  const azWidth = 340;
  const azGap = 20;
  const vpcWidths = structure.vpcs.map((vpc) =>
    Math.max(900, 50 + Math.max(1, vpc.availabilityZones.length) * (azWidth + azGap)));
  const totalVpcWidth = vpcWidths.reduce((sum, width) => sum + width, 0) +
    Math.max(0, structure.vpcs.length - 1) * 40;
  const regionalWidth = trafficPathsAndProtection.regionalNodes.length > 0 ? 360 : 0;
  const canvasWidth = 80 + totalVpcWidth + regionalWidth;
  let maxHeight = vpcTop + defaultVpcHeight;
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

    // A resource-membership relation proven between two resources both placed at VPC level (for
    // example an Aurora DB Instance's DBClusterIdentifier pointing at its DB Cluster) is rendered
    // as containment rather than as a separate dashed edge: the member is drawn as a child card
    // nested inside its parent's own box instead of as an independent top-level card. This is a
    // rendering choice about an already-proven relationship, not a new inference - the underlying
    // path still comes from buildMultiAzDeploymentTrafficPathsAndProtection() and is filtered out
    // of the edge list below once it has been absorbed into containment.
    const vpcResourceEndpointIds = new Set(vpc.resources.map((resource) =>
      `f${resource.fileIndex}_${resource.logicalId}`));
    const memberParentId = new Map<string, string>();
    trafficPathsAndProtection.paths
      .filter((path) => path.kind === 'resource-membership')
      .forEach((path) => {
        if (vpcResourceEndpointIds.has(path.from.id) && vpcResourceEndpointIds.has(path.to.id)) {
          memberParentId.set(path.from.id, path.to.id);
        }
      });
    const parentMembers = new Map<string, typeof vpc.resources>();
    vpc.resources.forEach((resource) => {
      const parentId = memberParentId.get(`f${resource.fileIndex}_${resource.logicalId}`);
      if (!parentId) return;
      parentMembers.set(parentId, [...parentMembers.get(parentId) ?? [], resource]);
      containedMemberIds.add(`f${resource.fileIndex}_${resource.logicalId}`);
    });
    // Only resources that are not themselves a member of another VPC-level resource take part in
    // the top-level candidate-subnet layout below; a member is instead nested inside its parent.
    const topLevelResources = vpc.resources.filter((resource) =>
      !memberParentId.has(`f${resource.fileIndex}_${resource.logicalId}`));

    // VPC-level resources (an ASG, DB cluster, an ElastiCache replication group, ...) that resolve
    // to the exact same set of candidate subnets are grouped so they can be stacked vertically -
    // one full-width card per resource - instead of overlapping. This has to be computed before
    // the VPC/AZ/subnet cells below so the VPC box, the AZ boxes, and the private/isolated subnet
    // tiers can all reserve enough height for the tallest stack that will be drawn across them.
    const resourceLayoutGroups = new Map<string, typeof vpc.resources>();
    topLevelResources.forEach((resource) => {
      const candidateKey = resource.candidateSubnets
        .map((subnet) => `${subnet.fileIndex}:${subnet.logicalId}`)
        .sort()
        .join('|');
      const key = candidateKey || `connectivity:${resource.candidateSubnets[0]?.connectivity ?? 'private'}`;
      resourceLayoutGroups.set(key, [...resourceLayoutGroups.get(key) ?? [], resource]);
    });
    const resourceHeight = 65;
    const horizontalInset = 15;
    const verticalTopInset = 50;
    const verticalBottomInset = 15;
    const rowGap = 15;
    // A resource that contains member cards needs room for its own header text (the same height
    // as an ordinary card) plus one stacked row per member; a resource with no members is just an
    // ordinary card.
    const individualHeight = (resource: typeof vpc.resources[number]): number => {
      const members = parentMembers.get(`f${resource.fileIndex}_${resource.logicalId}`);
      if (!members || members.length === 0) return resourceHeight;
      return resourceHeight + rowGap +
        members.length * resourceHeight + Math.max(0, members.length - 1) * rowGap +
        verticalBottomInset;
    };
    const stackedGroupHeight = (group: typeof vpc.resources): number =>
      verticalTopInset +
      group.reduce((sum, resource) => sum + individualHeight(resource), 0) +
      Math.max(0, group.length - 1) * rowGap +
      verticalBottomInset;
    const maxGroupHeightByConnectivity: Record<'public' | 'private' | 'isolated', number> = {
      public: 0,
      private: 0,
      isolated: 0,
    };
    resourceLayoutGroups.forEach((group) => {
      const connectivity = group[0]?.candidateSubnets[0]?.connectivity;
      if (!connectivity) return;
      maxGroupHeightByConnectivity[connectivity] =
        Math.max(maxGroupHeightByConnectivity[connectivity], stackedGroupHeight(group));
    });
    // Defaults (140/195/195, rows starting at 45/245/445, AZ height 650, VPC height 1420) exactly
    // match the previous fixed layout when no tier needs to stack more than one resource, so a
    // template with no shared candidate-subnet set renders pixel-identical diagrams to before.
    const tierHeight = {
      public: 140,
      private: Math.max(195, maxGroupHeightByConnectivity.private),
      isolated: Math.max(195, maxGroupHeightByConnectivity.isolated),
    };
    const baseRowY = {
      public: 45,
      private: 245,
      isolated: 245 + tierHeight.private + 5,
    };
    const azHeight = baseRowY.isolated + tierHeight.isolated + 10;
    const vpcHeight = Math.max(defaultVpcHeight, azTop + azHeight + 50);

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
      cells.push(groupCell(azId, `Availability Zone ${az.name}`, azX, azTop, azWidth, azHeight, vpcId, '#eff6ff'));
      const rowCounts: Record<string, number> = { public: 0, private: 0, isolated: 0 };
      az.subnets.forEach((subnet) => {
        const subnetId = `${azId}_f${subnet.fileIndex}_${subnet.logicalId}`;
        const subnetIndex = rowCounts[subnet.connectivity]++;
        const subnetY = baseRowY[subnet.connectivity] + subnetIndex * 18;
        const subnetHeight = tierHeight[subnet.connectivity];
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

    topLevelResources.forEach((resource) => {
      const endpointId = `f${resource.fileIndex}_${resource.logicalId}`;
      const resourceId = `node_${endpointId}`;
      const connectivity = resource.candidateSubnets[0]?.connectivity ?? 'private';
      const localY = connectivity === 'isolated' ? 1250 : connectivity === 'public' ? 810 : 1050;
      const candidateKey = resource.candidateSubnets
        .map((subnet) => `${subnet.fileIndex}:${subnet.logicalId}`)
        .sort()
        .join('|');
      const layoutGroupKey = candidateKey || `connectivity:${connectivity}`;
      const layoutGroup = resourceLayoutGroups.get(layoutGroupKey) ?? [resource];
      const resourceIndex = layoutGroup.indexOf(resource);
      const ownHeight = individualHeight(resource);
      // Heights vary once a resource with member cards sits beside an ordinary one-row resource
      // in the same group, so each row's offset is the cumulative height of the rows above it
      // rather than a fixed multiple of resourceHeight.
      const cumulativeOffset = layoutGroup
        .slice(0, resourceIndex)
        .reduce((offset, prior) => offset + individualHeight(prior) + rowGap, 0);
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
      // Every resource sharing this exact candidate-subnet set is stacked vertically, one row
      // per resource, each still spanning the full left-to-right width of those candidate
      // subnets - so a DB Cluster (or ElastiCache Replication Group, ...) with a subnet group
      // spanning both AZs keeps visually spanning both AZs even when a sibling resource without
      // member cards (or its own member cards nested inside it - see below) is drawn alongside
      // it. Stacking (instead of a grid that divides the width) keeps that "this candidate set
      // covers both AZs" impression intact for every card in the group, not just the first one.
      const stackedHeight = stackedGroupHeight(layoutGroup);
      const fitsCandidateRow = candidateTop !== undefined && candidateBottom !== undefined &&
        candidateBottom - candidateTop >= stackedHeight;
      const localPosition = candidateLeft !== undefined && candidateRight !== undefined &&
          fitsCandidateRow
        ? {
            x: candidateLeft + horizontalInset,
            y: candidateTop + verticalTopInset + cumulativeOffset,
            width: candidateRight - candidateLeft - horizontalInset * 2,
            height: ownHeight,
          }
        : {
            x: vpcWidth / 2 - 145,
            y: localY,
            width: 290,
            height: ownHeight,
          };
      const details = [
        ...(resource.multiAz ? ['Multi-AZ'] : []),
        ...(resource.traits ?? []),
      ].map((entry) => `; ${entry}`).join('');
      const members = parentMembers.get(endpointId) ?? [];
      cells.push(nodeCell(resourceId, `${resource.logicalId}<br/><font color="#64748b">${resource.placement}${details}</font>`, localPosition.x, localPosition.y, localPosition.width, localPosition.height, vpcId, '#ffffff', templatePageByLogicalId.get(`${resource.fileIndex}:${resource.logicalId}`) ?? '', members.length > 0));
      registerNode(endpointId, resourceId, { ...localPosition, x: vpcX + localPosition.x, y: vpcTop + localPosition.y });

      // Members proven by a resource-membership relation (for example an Aurora DB Instance's
      // DBClusterIdentifier) are nested inside their parent's own box as child cards, stacked
      // vertically below the parent's header text, instead of getting an independent top-level
      // card connected by a dashed "member of" edge.
      members.forEach((member, memberIndex) => {
        const memberEndpointId = `f${member.fileIndex}_${member.logicalId}`;
        const memberCellId = `node_${memberEndpointId}`;
        const memberLocalPosition = {
          x: horizontalInset,
          y: resourceHeight + rowGap + memberIndex * (resourceHeight + rowGap),
          width: localPosition.width - horizontalInset * 2,
          height: resourceHeight,
        };
        cells.push(nodeCell(memberCellId, `${member.logicalId}<br/><font color="#64748b">${member.detail.Type}</font>`, memberLocalPosition.x, memberLocalPosition.y, memberLocalPosition.width, memberLocalPosition.height, resourceId, '#f8fafc', templatePageByLogicalId.get(`${member.fileIndex}:${member.logicalId}`) ?? ''));
        registerNode(memberEndpointId, memberCellId, {
          x: vpcX + localPosition.x + memberLocalPosition.x,
          y: vpcTop + localPosition.y + memberLocalPosition.y,
          width: memberLocalPosition.width,
          height: memberLocalPosition.height,
        });
      });
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
    maxHeight = Math.max(maxHeight, vpcTop + vpcHeight);
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
    // A "member of" path already absorbed into containment (the member is nested inside its
    // parent's own box - see the resource-membership handling above) would otherwise draw a
    // redundant dashed edge pointing into the box that already visually contains it.
    if (path.kind === 'resource-membership' && containedMemberIds.has(path.from.id)) return [];
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

  if (params.options?.includeLegend !== false) {
    const usedKinds = new Set(drawablePaths.map(({ path }) => path.kind));
    addTrafficProtectionLegend(cells, maxHeight + 30, usedKinds);
  }
  const pages = [drawioPage('multi-az-traffic-paths-protection', 'Multi-AZ Deployment, Traffic Paths & Protection', cells)];
  files.forEach((file) => {
    if (file.templateSource) pages.push(drawioTemplatePage(`template_${file.fileIndex}`, file.fileName, file.templateSource));
  });
  return wrapDrawioPages(pages);
};

/** Generates an editable draw.io dependency graph. Unlike MultiAzDeploymentTrafficPathsAndProtection, this keeps all
 * resources and preserves the dependency kind used to color each connector. Resources are laid
 * out mechanically in template declaration order, one flat 3-column grid per template file - a
 * CFN template file is itself already an intentional, meaningful grouping the author chose, so
 * that grouping (rendered as one labeled box per file, titled with the file name) is the only
 * structure this raw view imposes; it does not try to re-derive additional relationship-based
 * groupings on top of it. */
export const generateDrawioCfnDependencyGraph = (params: GenerateDiagramParams): string => {
  const files = parseDiagramFiles({ ...params, mode: 'CfnDependencyGraph', viewpoint: 'CloudFormationView', options: { ...params.options, includeOutputs: true, includeParameters: true } });
  const cells: string[] = [];
  const nodeIds = new Map<string, string>();
  let maxHeight = 200;
  // Wide enough for the longest real AWS type name (e.g. "AWS::EC2::VPCGatewayAttachment")
  // to wrap onto two lines instead of overflowing into neighboring cards, with a real routing
  // corridor between adjacent cards so edges/labels do not run across card interiors.
  const columns = 3;
  const nodeWidth = 160;
  const nodeHeight = 80;
  const columnGap = 40;
  const rowGap = 40;
  const groupInset = 20;
  const groupTopInset = 45;
  const groupBottomInset = 20;
  const groupWidth = groupInset * 2 + columns * nodeWidth + (columns - 1) * columnGap;
  const stackGap = 40;
  const stacksPerRow = 3;
  let cursorX = 40;
  let cursorY = 40;
  let rowMaxHeight = 0;
  let columnsInRow = 0;
  files.forEach((file, fileIndex) => {
    if (columnsInRow === stacksPerRow) {
      cursorX = 40;
      cursorY += rowMaxHeight + stackGap;
      rowMaxHeight = 0;
      columnsInRow = 0;
    }
    const groupId = `stack_${fileIndex}`;
    const link = file.templateSource ? pageLink(`template_${fileIndex}`) : '';
    const rows = Math.ceil(file.resouces.length / columns);
    const groupHeight = Math.max(
      220,
      groupTopInset + rows * nodeHeight + Math.max(0, rows - 1) * rowGap + groupBottomInset,
    );
    // The group's own title bar is the file name (file.fileName) - every resource in this
    // stack is enclosed inside it, so which template file a resource came from is always
    // visible at a glance without reading logical IDs.
    cells.push(groupCell(groupId, file.fileName, cursorX, cursorY, groupWidth, groupHeight, '1', '#f8fafc'));
    file.resouces.forEach((logicalId, index) => {
      const id = `stack_${fileIndex}_${logicalId}`;
      nodeIds.set(`${fileIndex}:${logicalId}`, id);
      const resource = file.cfnTemplate.Resources[logicalId];
      const col = index % columns;
      const row = Math.floor(index / columns);
      cells.push(nodeCell(
        id,
        `${logicalId}<br/><font color="#64748b">${resource.Type}</font>`,
        groupInset + col * (nodeWidth + columnGap),
        groupTopInset + row * (nodeHeight + rowGap),
        nodeWidth,
        nodeHeight,
        groupId,
        '#ffffff',
        link,
      ));
    });
    rowMaxHeight = Math.max(rowMaxHeight, groupHeight);
    maxHeight = Math.max(maxHeight, cursorY + groupHeight);
    cursorX += groupWidth + stackGap;
    columnsInRow += 1;
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
