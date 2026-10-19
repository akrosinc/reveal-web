import {
  addRasterClass,
  buildClassColorExpression,
  getDefaultRasterClasses,
  getRasterClassesFromMetadata,
  getRasterClasses,
  getRasterClassesError,
  recolorRasterClasses,
  removeRasterClass,
  setRasterClasses,
  splitRasterClasses,
  syncRasterClasses,
  withRasterClasses
} from './rasterClasses';

const COLORS = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999'];

describe('rasterClasses', () => {
  it('builds five default classes on the current ramp breaks', () => {
    expect(getDefaultRasterClasses(COLORS)).toEqual([
      { from: 0, to: 3, color: '#111111' },
      { from: 3, to: 15, color: '#333333' },
      { from: 15, to: 75, color: '#555555' },
      { from: 75, to: 300, color: '#777777' },
      { from: 300, to: 1200, color: '#999999' }
    ]);
  });

  it('splits a range evenly and spreads the palette over the classes', () => {
    expect(splitRasterClasses(0, 100, 4, ['#000000', '#ffffff'])).toEqual([
      { from: 0, to: 25, color: '#000000' },
      { from: 25, to: 50, color: '#000000' },
      { from: 50, to: 75, color: '#ffffff' },
      { from: 75, to: 100, color: '#ffffff' }
    ]);
  });

  it('keeps the ranges when the palette changes', () => {
    const classes = splitRasterClasses(0, 10, 2, ['#000000', '#ffffff']);
    expect(recolorRasterClasses(classes, ['#aaaaaa', '#bbbbbb'])).toEqual([
      { from: 0, to: 5, color: '#aaaaaa' },
      { from: 5, to: 10, color: '#bbbbbb' }
    ]);
  });

  it('reports missing values, reversed ranges and overlaps', () => {
    expect(getRasterClassesError(splitRasterClasses(0, 10, 2, COLORS))).toBeUndefined();
    expect(getRasterClassesError([{ from: NaN, to: 5, color: '#000000' }])).toBe('invalidValue');
    expect(getRasterClassesError([{ from: 5, to: 5, color: '#000000' }])).toBe('fromAboveTo');
    expect(
      getRasterClassesError([
        { from: 10, to: 20, color: '#000000' },
        { from: 0, to: 12, color: '#ffffff' }
      ])
    ).toBe('overlap');
  });

  it('colours each range and hides values outside the classes', () => {
    const value = ['get', 'class'];
    expect(
      buildClassColorExpression(value, [
        { from: 5, to: 10, color: '#bbbbbb' },
        { from: 0, to: 5, color: '#aaaaaa' }
      ])
    ).toEqual([
      'case',
      ['all', ['>=', value, 0], ['<', value, 5]],
      '#aaaaaa',
      ['all', ['>=', value, 5], ['<=', value, 10]],
      '#bbbbbb',
      'rgba(0, 0, 0, 0)'
    ]);
  });

  it('stores and clears classes per raster', () => {
    setRasterClasses('population', [{ from: 0, to: 1, color: '#000000' }]);
    expect(getRasterClasses('population')).toHaveLength(1);
    setRasterClasses('population', undefined);
    expect(getRasterClasses('population')).toBeUndefined();
  });
  it('adds a class after the last one with the same width, even past the raster max', () => {
    const classes = splitRasterClasses(0, 20000, 2, ['#000000', '#ffffff']);
    expect(addRasterClass(classes, ['#000000', '#ffffff'])).toEqual([
      { from: 0, to: 10000, color: '#000000' },
      { from: 10000, to: 20000, color: '#ffffff' },
      { from: 20000, to: 30000, color: '#ffffff' }
    ]);
  });

  it('keeps colours the user picked when adding a class', () => {
    const custom = [
      { from: 0, to: 4000, color: '#aaaaaa' },
      { from: 4000, to: 20000, color: '#bbbbbb' }
    ];
    expect(addRasterClass(custom, ['#000000', '#ffffff'])).toEqual([
      ...custom,
      { from: 20000, to: 36000, color: '#bbbbbb' }
    ]);
  });

  it('lets the neighbour cover a removed class so no values are lost', () => {
    const classes = splitRasterClasses(0, 30, 3, ['#000000', '#888888', '#ffffff']);
    expect(removeRasterClass(classes, 1, ['#000000', '#888888', '#ffffff'])).toEqual([
      { from: 0, to: 20, color: '#000000' },
      { from: 20, to: 30, color: '#ffffff' }
    ]);
    expect(removeRasterClass(classes, 0, ['#000000', '#888888', '#ffffff'])).toEqual([
      { from: 0, to: 20, color: '#000000' },
      { from: 20, to: 30, color: '#ffffff' }
    ]);
  });
  it('keeps other metadata keys and clears the classes when they are turned off', () => {
    const classes = [{ from: 0, to: 10, color: '#000000' }];
    expect(withRasterClasses({ source: 'worldpop' }, classes)).toEqual({ source: 'worldpop', rasterClasses: classes });
    expect(withRasterClasses({ source: 'worldpop', rasterClasses: classes })).toEqual({
      source: 'worldpop',
      rasterClasses: []
    });
  });

  it('reads only valid classes from saved metadata', () => {
    const classes = [{ from: 0, to: 10, color: '#000000' }];
    expect(getRasterClassesFromMetadata({ rasterClasses: classes })).toEqual(classes);
    expect(getRasterClassesFromMetadata({ rasterClasses: [] })).toBeUndefined();
    expect(getRasterClassesFromMetadata({ rasterClasses: [{ from: 'a', to: 1, color: '#000000' }] })).toBeUndefined();
    expect(getRasterClassesFromMetadata(undefined)).toBeUndefined();
  });

  it('loads saved classes into the page when rasters arrive', () => {
    syncRasterClasses('elevation', { rasterClasses: [{ from: 0, to: 5, color: '#111111' }] });
    expect(getRasterClasses('elevation')).toEqual([{ from: 0, to: 5, color: '#111111' }]);
    syncRasterClasses('elevation', {});
    expect(getRasterClasses('elevation')).toBeUndefined();
  });
});
