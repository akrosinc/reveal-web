import { HierarchyNode, TargetArea } from '../providers/types';
import { getIdsAfterRemove, getIdsToAdd } from './campaign';

const node = (identifier: string, geographicLevel: string, children: HierarchyNode[] = []): HierarchyNode => ({
  identifier,
  properties: { name: identifier, geographicLevel, parentIdentifier: '', childrenNumber: children.length },
  children
});

const hierarchy = [
  node('country', 'country', [
    node('north', 'province', [node('n1', 'district', [node('s1', 'structure')]), node('n2', 'district')]),
    node('south', 'province', [node('s-d1', 'district')])
  ])
];

const area = (identifier: string, ancestry: string[]): TargetArea => ({
  identifier,
  ancestry,
  geometry: { type: 'Point', coordinates: [0, 0] },
  properties: { name: identifier }
});

describe('getIdsToAdd', () => {
  it('adds the area, its children (not structures), its parents and keeps what is already assigned', () => {
    const ids = getIdsToAdd(hierarchy, 'north', ['country'], [area('s-d1', ['country', 'south'])]);
    expect(ids.sort()).toEqual(['country', 'n1', 'n2', 'north', 's-d1', 'south'].sort());
  });
});

describe('getIdsAfterRemove', () => {
  it('removes the area, its children and parents no other assigned area needs', () => {
    const targetAreas = [area('n1', ['country', 'north']), area('s-d1', ['country', 'south'])];
    expect(getIdsAfterRemove(hierarchy, 'north', ['country'], targetAreas).sort()).toEqual(
      ['country', 's-d1', 'south'].sort()
    );
  });

  it('removes the shared parent when nothing else is assigned', () => {
    expect(getIdsAfterRemove(hierarchy, 'n1', ['country', 'north'], [area('n1', ['country', 'north'])])).toEqual([]);
  });
});
