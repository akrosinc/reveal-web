import Pbf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import { RASTER_VALUE_PROPERTIES, RasterExtent, getRasterTileUrl, normalizeExtent } from './rasterHelper';

export interface RasterValueRange {
  min: number;
  max: number;
}

const MAX_TILES = 16;
const MAX_ZOOM = 10;
const MAX_LATITUDE = 85.0511;
const NO_DATA_LIMIT = -9999;
const VALUE_PROPERTIES = ['class', ...RASTER_VALUE_PROPERTIES.filter(name => name !== 'class')];

const rangeRequests = new Map<string, Promise<RasterValueRange | undefined>>();

const toTileX = (lng: number, zoom: number) => Math.floor(((lng + 180) / 360) * 2 ** zoom);

const toTileY = (lat: number, zoom: number) => {
  const rad = (Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat)) * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom);
};

export const getTilesForExtent = (extent: RasterExtent, maxTiles: number = MAX_TILES) => {
  for (let zoom = MAX_ZOOM; zoom >= 0; zoom--) {
    const last = 2 ** zoom - 1;
    const minX = Math.max(0, toTileX(extent.minX, zoom));
    const maxX = Math.min(last, toTileX(extent.maxX, zoom));
    const minY = Math.max(0, toTileY(extent.maxY, zoom));
    const maxY = Math.min(last, toTileY(extent.minY, zoom));
    if ((maxX - minX + 1) * (maxY - minY + 1) <= maxTiles) {
      const tiles: { z: number; x: number; y: number }[] = [];
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) tiles.push({ z: zoom, x, y });
      }
      return tiles;
    }
  }
  return [{ z: 0, x: 0, y: 0 }];
};

export const getFeatureValue = (properties: Record<string, unknown>): number | undefined => {
  const name = VALUE_PROPERTIES.find(key => properties[key] !== undefined && properties[key] !== null);
  if (!name) return undefined;
  const value = Number(properties[name]);
  return Number.isFinite(value) && value > NO_DATA_LIMIT ? value : undefined;
};

export const readTileValueRange = (buffer: ArrayBuffer): RasterValueRange | undefined => {
  const tile = new VectorTile(new Pbf(buffer));
  let min = Infinity;
  let max = -Infinity;
  Object.values(tile.layers).forEach(layer => {
    for (let i = 0; i < layer.length; i++) {
      const value = getFeatureValue(layer.feature(i).properties);
      if (value !== undefined) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  });
  return min <= max ? { min, max } : undefined;
};

const fetchTileRange = (rasterId: string, tile: { z: number; x: number; y: number }) =>
  fetch(
    getRasterTileUrl(rasterId)
      .replace('{z}', String(tile.z))
      .replace('{x}', String(tile.x))
      .replace('{y}', String(tile.y))
  )
    .then(res => (res.ok ? res.arrayBuffer() : undefined))
    .then(buffer => (buffer && buffer.byteLength ? readTileValueRange(buffer) : undefined))
    .catch(() => undefined);

const loadRasterValueRange = async (rasterId: string, extent: RasterExtent) => {
  const ranges = await Promise.all(getTilesForExtent(extent).map(tile => fetchTileRange(rasterId, tile)));
  const found = ranges.filter((range): range is RasterValueRange => Boolean(range));
  if (!found.length) return undefined;
  return {
    min: Math.min(...found.map(range => range.min)),
    max: Math.max(...found.map(range => range.max))
  };
};

export const getRasterValueRange = (rasterId: string, extent: unknown): Promise<RasterValueRange | undefined> => {
  const bounds = normalizeExtent(extent);
  if (!bounds) return Promise.resolve(undefined);
  if (!rangeRequests.has(rasterId)) {
    const request = loadRasterValueRange(rasterId, bounds).then(range => {
      if (!range) rangeRequests.delete(rasterId);
      return range;
    });
    rangeRequests.set(rasterId, request);
  }
  return rangeRequests.get(rasterId)!;
};
