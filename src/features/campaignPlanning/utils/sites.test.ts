import { Site } from '../providers/types';
import {
  getSegmentOutsidePoints,
  getSiteGroups,
  getSnapSegments,
  isPointInside,
  isPolygonInside,
  isSelfIntersecting,
  Position,
  toPolygon
} from './sites';

const square: GeoJSON.Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0]
    ]
  ]
};

const site = (typeId: string, geometry: Site['geometry']): Site => ({
  identifier: typeId,
  name: `${typeId} site`,
  typeId,
  geometry,
  location: { type: 'Point', coordinates: [1, 1] }
});

describe('getSiteGroups', () => {
  it('counts the added sites per group and type', () => {
    const [polygonGroup, pointGroup] = getSiteGroups([site('static', 'polygon'), site('mobile', 'point')]);
    expect(polygonGroup.label).toBe('Outreach, static, H2R');
    expect(polygonGroup.mapped).toBe(1);
    expect(polygonGroup.target).toBe(1);
    expect(polygonGroup.types.find(type => type.label === 'Static sites')?.count).toBe(1);
    expect(pointGroup.sites).toEqual([{ name: 'mobile site', type: 'Mobile', isMapped: true }]);
  });

  it('starts at zero without sites', () => {
    expect(getSiteGroups([]).map(group => [group.mapped, group.target])).toEqual([
      [0, 0],
      [0, 0]
    ]);
  });
});

describe('getSnapSegments', () => {
  it('splits polygon rings into edges', () => {
    expect(getSnapSegments([square])).toHaveLength(4);
    expect(getSnapSegments([square])[0]).toEqual([0, 0, 10, 0]);
  });
});

describe('inside checks', () => {
  const inner: Position[] = [
    [2, 2],
    [8, 2],
    [8, 8]
  ];

  it('accepts a point inside and rejects one outside', () => {
    expect(isPointInside([5, 5], square)).toBe(true);
    expect(isPointInside([15, 5], square)).toBe(false);
  });

  it('accepts a polygon inside, also when it touches the boundary', () => {
    expect(isPolygonInside(inner, square)).toBe(true);
    expect(
      isPolygonInside(
        [
          [0, 0],
          [10, 0],
          [5, 5]
        ],
        square
      )
    ).toBe(true);
  });

  it('rejects a polygon that leaves the area', () => {
    expect(
      isPolygonInside(
        [
          [2, 2],
          [14, 2],
          [8, 8]
        ],
        square
      )
    ).toBe(false);
  });

  it('finds crossing boundary lines', () => {
    expect(isSelfIntersecting(inner)).toBe(false);
    expect(
      isSelfIntersecting([
        [0, 0],
        [4, 4],
        [4, 0],
        [0, 4]
      ])
    ).toBe(true);
  });

  it('closes the ring', () => {
    expect(toPolygon(inner).coordinates[0]).toHaveLength(4);
  });

  it('finds the part of a line that leaves the area', () => {
    const notch: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [6, 10],
          [6, 4],
          [4, 4],
          [4, 10],
          [0, 10],
          [0, 0]
        ]
      ]
    };
    expect(getSegmentOutsidePoints([1, 1], [9, 1], notch)).toEqual([]);
    expect(getSegmentOutsidePoints([0, 0], [10, 0], notch)).toEqual([]);
    expect(getSegmentOutsidePoints([2, 8], [8, 8], notch)).toEqual([[5, 8]]);
  });
});
