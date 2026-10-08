import { HierarchyNode } from '../providers/types';

/**
 * Keeps nodes whose name contains the search term (with their full subtree),
 * plus the ancestors needed to reach them. Returns the input unchanged for an empty term.
 */
export const filterHierarchy = (nodes: HierarchyNode[], searchTerm: string): HierarchyNode[] => {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return nodes;

  const filter = (items: HierarchyNode[]): HierarchyNode[] =>
    items.flatMap(node => {
      if (node.properties.name.toLowerCase().includes(term)) return [node];
      const children = filter(node.children ?? []);
      return children.length ? [{ ...node, children }] : [];
    });

  return filter(nodes);
};

/** Returns the nodes from the root down to the node with the given id, or [] if it isn't in the tree. */
export const findPath = (nodes: HierarchyNode[], id: string): HierarchyNode[] => {
  for (const node of nodes) {
    if (node.identifier === id) return [node];
    const path = findPath(node.children ?? [], id);
    if (path.length) return [node, ...path];
  }
  return [];
};
