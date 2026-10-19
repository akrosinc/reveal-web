import { getFeatureValue, getTilesForExtent } from './rasterValues';

describe('rasterValues', () => {
  it('picks the deepest zoom whose tiles over the extent stay within the limit', () => {
    const tiles = getTilesForExtent({ minX: 21.99, minY: -18.08, maxX: 33.71, maxY: -8.2 });
    expect(tiles.length).toBeLessThanOrEqual(16);
    expect(tiles[0].z).toBe(6);
    expect(tiles).toContainEqual({ z: 6, x: 35, y: 33 });
  });

  it('falls back to the world tile when nothing smaller fits', () => {
    expect(getTilesForExtent({ minX: -180, minY: -85, maxX: 180, maxY: 85 }, 0)).toEqual([{ z: 0, x: 0, y: 0 }]);
  });

  it('reads the cell value like the map and skips no-data cells', () => {
    expect(getFeatureValue({ class: 12, population: 99 })).toBe(12);
    expect(getFeatureValue({ population: '7124' })).toBe(7124);
    expect(getFeatureValue({ value: -9999 })).toBeUndefined();
    expect(getFeatureValue({ name: 'cell' })).toBeUndefined();
  });
});
