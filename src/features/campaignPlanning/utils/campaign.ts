import { HierarchyNode, TargetArea } from '../providers/types';
import { findPath } from './hierarchyTree';

const getDescendantIds = (nodes: HierarchyNode[] = []): string[] =>
  nodes.flatMap(node => [
    ...(node.properties.geographicLevel !== 'structure' ? [node.identifier] : []),
    ...getDescendantIds(node.children)
  ]);

const getAssignedIds = (targetAreas: TargetArea[]) =>
  Array.from(new Set(targetAreas.flatMap(area => [...(area.ancestry ?? []), area.identifier])));

export const getIdsToAdd = (
  hierarchy: HierarchyNode[],
  locationId: string,
  ancestry: string[],
  targetAreas: TargetArea[]
): string[] => {
  const node = findPath(hierarchy, locationId).pop();
  return Array.from(
    new Set([...getDescendantIds(node?.children), ...ancestry, ...getAssignedIds(targetAreas), locationId])
  );
};

export const getIdsAfterRemove = (
  hierarchy: HierarchyNode[],
  locationId: string,
  ancestry: string[],
  targetAreas: TargetArea[]
): string[] => {
  const node = findPath(hierarchy, locationId).pop();
  const otherAncestry = new Set(
    targetAreas.filter(area => area.identifier !== locationId).flatMap(area => area.ancestry ?? [])
  );
  const removed = new Set([
    locationId,
    ...getDescendantIds(node?.children),
    ...ancestry.filter(id => !otherAncestry.has(id))
  ]);
  return getAssignedIds(targetAreas).filter(id => !removed.has(id));
};
