import { HierarchyNode } from '../providers/types';
import { filterHierarchy, findPath } from './hierarchyTree';

const node = (identifier: string, name: string, children: HierarchyNode[] = []): HierarchyNode => ({
  identifier,
  properties: { name, geographicLevel: '', parentIdentifier: '', childrenNumber: children.length },
  children
});

const tree = [node('zm', 'Zambia', [node('lu', 'Lusaka', [node('ch', 'Chirundu')]), node('no', 'Northern')])];

describe('filterHierarchy', () => {
  it('returns the same tree for an empty search', () => {
    expect(filterHierarchy(tree, '  ')).toBe(tree);
  });

  it('keeps matches with their ancestors, ignoring case', () => {
    const [zambia] = filterHierarchy(tree, 'CHIR');
    expect(zambia.identifier).toBe('zm');
    expect(zambia.children?.map(child => child.identifier)).toEqual(['lu']);
    expect(zambia.children?.[0].children?.map(child => child.identifier)).toEqual(['ch']);
  });

  it('returns nothing when no name matches', () => {
    expect(filterHierarchy(tree, 'xyz')).toEqual([]);
  });
});

describe('findPath', () => {
  it('returns the nodes from the root down to the node', () => {
    expect(findPath(tree, 'ch').map(item => item.identifier)).toEqual(['zm', 'lu', 'ch']);
  });

  it('returns an empty path for an unknown id', () => {
    expect(findPath(tree, 'missing')).toEqual([]);
  });
});
