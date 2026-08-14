import { TrafficProtectionPathKind } from '../multiAzDeploymentTrafficPathsAndProtection';
import { EdgeKind } from './commonCells';

export type NodePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ConnectionSide = 'top' | 'right' | 'bottom' | 'left';

type ConnectionLayout = {
  sourceSide: ConnectionSide;
  targetSide: ConnectionSide;
};

export const edgeKindForPath = (kind: TrafficProtectionPathKind): EdgeKind => {
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

export const connectionLayout = (
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

export const anchorCoordinates = (
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

export const absoluteAnchorPoint = (
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

export const routePoints = (
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
