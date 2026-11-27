import { Site } from '../providers/types';
import { distance } from '@turf/turf';
import {
  getAddableTypeIds,
  getPointSiteBoundary,
  getSiteAnchor,
  getSegmentOutsidePoints,
  getSiteGroups,
  getSnapSegments,
  isPointInside,
  isPolygonInside,
  isSelfIntersecting,
  Position,
  toCustomLocationRequest,
  toPolygon,
  toSites
} from './sites';
import { CustomLocation } from '../providers/types';

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
  locations: [{ type: 'Point', coordinates: [1, 1] }]
});

describe('getSiteGroups', () => {
  it('counts the added sites per group and type', () => {
    const [polygonGroup, pointGroup] = getSiteGroups([site('static', 'polygon'), site('mobile', 'point')]);
    expect(polygonGroup.label).toBe('Outreach, static, H2R');
    expect(polygonGroup.mapped).toBe(1);
    expect(polygonGroup.target).toBe(0);
    expect(polygonGroup.types.find(type => type.label === 'Static sites')?.count).toBe(1);
    expect(pointGroup.sites).toEqual([{ identifier: 'mobile', name: 'mobile site', type: 'Mobile', isMapped: true }]);
  });

  it('counts a site as mapped only when it has at least one point', () => {
    const [polygonGroup] = getSiteGroups([
      { ...site('outreach', 'polygon'), locations: [] },
      {
        ...site('static', 'polygon'),
        locations: [
          { type: 'Point', coordinates: [1, 1] },
          { type: 'Point', coordinates: [2, 2] }
        ]
      }
    ]);
    expect(polygonGroup.mapped).toBe(1);
    expect(polygonGroup.sites.map(item => item.isMapped)).toEqual([false, true]);
  });

  it('adds up the target of each type in the group', () => {
    const [polygonGroup, pointGroup] = getSiteGroups([site('mobile', 'point')], { mobile: 12, school_hpv: 10 });
    expect(polygonGroup.target).toBe(0);
    expect(pointGroup.mapped).toBe(1);
    expect(pointGroup.target).toBe(22);
    expect(pointGroup.types.map(type => type.target)).toEqual([12, 10]);
  });

  it('uses the added counts instead of the sites when they are passed', () => {
    const [polygonGroup, pointGroup] = getSiteGroups(
      [site('static', 'polygon')],
      { outreach: 9 },
      { outreach: 4, h2r: 3 }
    );
    expect([polygonGroup.mapped, polygonGroup.target]).toEqual([7, 9]);
    expect(polygonGroup.types.map(type => type.count)).toEqual([4, 0, 3]);
    expect(pointGroup.mapped).toBe(0);
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

describe('getPointSiteBoundary', () => {
  it('draws a closed circle with every corner at the radius in meters', () => {
    const center: Position = [28.3467, -15.4123];
    const ring = getPointSiteBoundary(center, 1000).coordinates[0];

    expect(ring[0]).toEqual(ring[ring.length - 1]);
    ring.forEach(position => expect(distance(center, position, { units: 'meters' })).toBeCloseTo(1000, 0));
  });
});

describe('getAddableTypeIds', () => {
  it('only allows types with a target above their added sites', () => {
    const [polygonGroup, pointGroup] = getSiteGroups([site('static', 'polygon')], { outreach: 2, static: 1 });
    expect(getAddableTypeIds(polygonGroup)).toEqual(['outreach']);
    expect(getAddableTypeIds(pointGroup)).toEqual([]);
  });
});

describe('getSiteAnchor', () => {
  it('uses the first point of the site', () => {
    expect(getSiteAnchor(site('static', 'polygon'))).toEqual([1, 1]);
  });

  it('falls back to the first corner of the boundary when the site has no point', () => {
    expect(getSiteAnchor({ ...site('static', 'polygon'), locations: [], boundary: square })).toEqual([0, 0]);
  });
});

describe('toCustomLocationRequest', () => {
  it('sends the site with its backend type, levels, boundary and points', () => {
    const polygonSite: Site = { ...site('h2r', 'polygon'), boundary: square };
    expect(toCustomLocationRequest(polygonSite, 'catchment-1')).toEqual({
      parentLocationIdentifier: 'catchment-1',
      locationSubtype: 'H2R',
      name: 'h2r site',
      boundaryGeographicLevelName: 'site',
      pointGeographicLevelName: 'sitepoint',
      locationBoundary: square,
      points: [{ type: 'Point', coordinates: [1, 1] }]
    });
  });

  it('sends the added tag of the site type only for a new site', () => {
    expect(toCustomLocationRequest({ ...site('mobile', 'point'), identifier: '' }, 'catchment-1').tagName).toBe(
      'sites_mobile_added'
    );
    expect(toCustomLocationRequest(site('mobile', 'point'), 'catchment-1').tagName).toBeUndefined();
  });
});

describe('toSites', () => {
  const location = (
    identifier: string,
    geometry: GeoJSON.Geometry,
    parentIdentifier: string,
    locationSubtype: CustomLocation['properties']['locationSubtype'] = 'OUTREACH'
  ): CustomLocation => ({ identifier, geometry, properties: { name: identifier, locationSubtype, parentIdentifier } });
  const point = (x: number): GeoJSON.Point => ({ type: 'Point', coordinates: [x, 1] });

  it('groups each boundary with its own points', () => {
    const sites = toSites([
      location('site-a', square, 'catchment-1'),
      location('site-a point 1', point(1), 'site-a'),
      location('site-b', square, 'catchment-1', 'MOBILE'),
      location('site-a point 2', point(2), 'site-a'),
      location('site-b point 1', point(3), 'site-b', 'MOBILE')
    ]);

    expect(sites).toEqual([
      {
        identifier: 'site-a',
        name: 'site-a',
        typeId: 'outreach',
        geometry: 'polygon',
        locations: [point(1), point(2)],
        boundary: square
      },
      {
        identifier: 'site-b',
        name: 'site-b',
        typeId: 'mobile',
        geometry: 'point',
        locations: [point(3)],
        boundary: square,
        radius: 1000
      }
    ]);
  });

  it('skips locations of a type the page does not know', () => {
    expect(toSites([location('site-c', square, 'catchment-1', 'HPV')])).toEqual([]);
  });
});
