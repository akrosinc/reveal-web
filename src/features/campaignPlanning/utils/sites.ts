import {
  area,
  booleanPointInPolygon,
  difference,
  kinks,
  lineIntersect,
  lineString,
  MultiPolygon,
  Polygon,
  polygon
} from '@turf/turf';
import { Map } from 'mapbox-gl';
import { SITE_GEOMETRIES, SITE_SNAP_TOLERANCE_PX, SITE_TYPES } from '../constants';
import { Site, SiteTargets } from '../providers/types';

export type Position = [number, number];

export type Segment = [number, number, number, number];

export interface SiteGroup {
  geometry: Site['geometry'];
  label: string;
  mapped: number;
  target: number;
  types: { id: string; label: string; count: number; target: number }[];
  sites: { name: string; type: string; isMapped: boolean }[];
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const getSiteTypeName = (typeId: string) => SITE_TYPES.find(type => type.id === typeId)?.name ?? typeId;

export const getSiteGroups = (sites: Site[], targets: SiteTargets = {}): SiteGroup[] =>
  SITE_GEOMETRIES.map(geometry => {
    const types = SITE_TYPES.filter(type => type.geometry === geometry);
    const groupSites = sites.filter(site => site.geometry === geometry);
    return {
      geometry,
      label: capitalize(types.map(type => type.name).join(', ')),
      mapped: groupSites.filter(site => site.location).length,
      target: types.reduce((sum, type) => sum + (targets[type.id] ?? 0), 0),
      types: types.map(type => ({
        id: type.id,
        label: type.label,
        count: groupSites.filter(site => site.typeId === type.id).length,
        target: targets[type.id] ?? 0
      })),
      sites: groupSites.map(site => ({
        name: site.name,
        type: capitalize(getSiteTypeName(site.typeId)),
        isMapped: !!site.location
      }))
    };
  });

const toRings = (geometry: GeoJSON.Geometry): GeoJSON.Position[][] => {
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat();
  if (geometry.type === 'GeometryCollection') return geometry.geometries.flatMap(toRings);
  return [];
};

export const getSnapSegments = (geometries: GeoJSON.Geometry[]): Segment[] =>
  geometries
    .flatMap(toRings)
    .flatMap(ring => ring.slice(1).map((end, index): Segment => [ring[index][0], ring[index][1], end[0], end[1]]));

export const snapPosition = (
  map: Map,
  position: Position,
  segments: Segment[],
  tolerance = SITE_SNAP_TOLERANCE_PX
): Position | undefined => {
  const cursor = map.project(position);
  const topLeft = map.unproject([cursor.x - tolerance, cursor.y - tolerance]);
  const bottomRight = map.unproject([cursor.x + tolerance, cursor.y + tolerance]);
  const [minX, maxX] = [Math.min(topLeft.lng, bottomRight.lng), Math.max(topLeft.lng, bottomRight.lng)];
  const [minY, maxY] = [Math.min(topLeft.lat, bottomRight.lat), Math.max(topLeft.lat, bottomRight.lat)];
  let vertex: Position | undefined;
  let vertexDistance = tolerance;
  let edge: Position | undefined;
  let edgeDistance = tolerance;

  segments.forEach(([ax, ay, bx, by]) => {
    if (Math.max(ax, bx) < minX || Math.min(ax, bx) > maxX || Math.max(ay, by) < minY || Math.min(ay, by) > maxY) {
      return;
    }
    const a = map.project([ax, ay]);
    const b = map.project([bx, by]);
    [
      { point: a, coordinates: [ax, ay] as Position },
      { point: b, coordinates: [bx, by] as Position }
    ].forEach(({ point, coordinates }) => {
      const distance = point.dist(cursor);
      if (distance <= vertexDistance) {
        vertex = coordinates;
        vertexDistance = distance;
      }
    });
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = dx * dx + dy * dy;
    if (!length) return;
    const t = Math.max(0, Math.min(1, ((cursor.x - a.x) * dx + (cursor.y - a.y) * dy) / length));
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    const distance = Math.hypot(cursor.x - x, cursor.y - y);
    if (distance <= edgeDistance) {
      const snapped = map.unproject([x, y]);
      edge = [snapped.lng, snapped.lat];
      edgeDistance = distance;
    }
  });

  return vertex ?? edge;
};

export const isPointInside = (position: Position, geometry: GeoJSON.Geometry) =>
  (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') &&
  booleanPointInPolygon(position, geometry as Polygon | MultiPolygon);

export const getSegmentOutsidePoints = (from: Position, to: Position, geometry: GeoJSON.Geometry): Position[] => {
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') return [from, to];
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = dx * dx + dy * dy;
  if (!length) return [];
  const crossings = lineIntersect(lineString([from, to]), geometry as Polygon | MultiPolygon).features.map(point => {
    const [x, y] = point.geometry.coordinates;
    return ((x - from[0]) * dx + (y - from[1]) * dy) / length;
  });
  const stops = [0, ...crossings, 1].sort((a, b) => a - b);
  return stops.slice(1).flatMap((end, index) => {
    const t = (stops[index] + end) / 2;
    const middle: Position = [from[0] + t * dx, from[1] + t * dy];
    return booleanPointInPolygon(middle, geometry as Polygon | MultiPolygon) ? [] : [middle];
  });
};

export const toPolygon = (ring: Position[]): GeoJSON.Polygon => ({
  type: 'Polygon',
  coordinates: [[...ring, ring[0]]]
});

export const isSelfIntersecting = (ring: Position[]) => kinks(polygon(toPolygon(ring).coordinates)).features.length > 0;

export const isPolygonInside = (ring: Position[], geometry: GeoJSON.Geometry) => {
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') return false;
  const drawn = polygon(toPolygon(ring).coordinates);
  const outside = difference(drawn, geometry as Polygon | MultiPolygon);
  return !outside || area(outside) <= Math.max(1, area(drawn) * 1e-6);
};
