import { Map as MapBoxMap } from 'mapbox-gl';
import { config } from '../config/config';

export interface RasterLayerConfig {
  id: string;
  rasterId?: string;
  name: string;
  type?: 'vector' | 'raster';
  tiles: string[];
  sourceLayer?: string;
  fieldName?: string;
  tileSize?: number;
  opacity?: number;
  color?: string;
  minzoom?: number;
  maxzoom?: number;
  attribution?: string;
  scheme?: 'xyz' | 'tms';
}

export interface RasterExtent {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Normalizes an extent from various formats (array, object with minX/minY or west/south/etc.)
 */
export const normalizeExtent = (extent: any): RasterExtent | null => {
  if (!extent) return null;

  // If array format: [minX, minY, maxX, maxY] or [west, south, east, north]
  if (Array.isArray(extent)) {
    if (extent.length === 4) {
      const [minX, minY, maxX, maxY] = extent.map(Number);
      if (!isNaN(minX) && !isNaN(minY) && !isNaN(maxX) && !isNaN(maxY)) {
        return { minX, minY, maxX, maxY };
      }
    }
    // If array of coordinate pairs: [[minX, minY], [maxX, maxY]]
    if (extent.length === 2 && Array.isArray(extent[0]) && Array.isArray(extent[1])) {
      const [minX, minY] = extent[0].map(Number);
      const [maxX, maxY] = extent[1].map(Number);
      if (!isNaN(minX) && !isNaN(minY) && !isNaN(maxX) && !isNaN(maxY)) {
        return { minX, minY, maxX, maxY };
      }
    }
  }

  // If object format
  if (typeof extent === 'object') {
    const minX = Number(
      extent.minX ?? extent.min_x ?? extent.xmin ?? extent.minLng ?? extent.minLon ?? extent.west ?? extent.left
    );
    const minY = Number(
      extent.minY ?? extent.min_y ?? extent.ymin ?? extent.minLat ?? extent.south ?? extent.bottom
    );
    const maxX = Number(
      extent.maxX ?? extent.max_x ?? extent.xmax ?? extent.maxLng ?? extent.maxLon ?? extent.east ?? extent.right
    );
    const maxY = Number(
      extent.maxY ?? extent.max_y ?? extent.ymax ?? extent.maxLat ?? extent.north ?? extent.top
    );
    if (!isNaN(minX) && !isNaN(minY) && !isNaN(maxX) && !isNaN(maxY)) {
      return { minX, minY, maxX, maxY };
    }
  }

  return null;
};

export interface RasterMapLayer {
  id: string;
  name: string;
  layerIdentifier: string;
  type: string;
  extent?: RasterExtent;
}

export interface ColorOption {
  value: string;
  label: string;
  color: string;
  colors: string[];
  gradient: string;
}

/**
 * Color ramp presets from raster.html
 */
export const RASTER_COLOR_PRESETS: Record<string, string[]> = {
  'YlOrRd (population / density)': [
    '#ffffcc',
    '#ffeda0',
    '#fed976',
    '#feb24c',
    '#fd8d3c',
    '#fc4e2a',
    '#e31a1c',
    '#bd0026',
    '#800026'
  ],
  'Viridis (perceptual, general purpose)': [
    '#440154',
    '#472d7b',
    '#3b528b',
    '#2c728e',
    '#21918c',
    '#28ae80',
    '#5ec962',
    '#addc30',
    '#fde725'
  ],
  'Plasma (perceptual, high contrast)': [
    '#0d0887',
    '#5302a3',
    '#8b0aa5',
    '#b83289',
    '#db5c68',
    '#f48849',
    '#febd2a',
    '#f0f921'
  ],
  'Magma (perceptual, dark background)': [
    '#000004',
    '#2c115f',
    '#721f81',
    '#b73779',
    '#f1605d',
    '#feaf77',
    '#fcfdbf'
  ],
  'Blues (sequential)': [
    '#f7fbff',
    '#deebf7',
    '#c6dbef',
    '#9ecae1',
    '#6baed6',
    '#4292c6',
    '#2171b5',
    '#08519c',
    '#08306b'
  ],
  'Greens (vegetation / land cover)': [
    '#f7fcf5',
    '#e5f5e0',
    '#c7e9c0',
    '#a1d99b',
    '#74c476',
    '#41ab5d',
    '#238b45',
    '#006d2c',
    '#00441b'
  ],
  'Purples (sequential)': [
    '#fcfbfd',
    '#efedf5',
    '#dadaeb',
    '#bcbddc',
    '#9e9ac8',
    '#807dba',
    '#6a51a3',
    '#54278f',
    '#3f007d'
  ],
  'Oranges (sequential)': [
    '#fff5eb',
    '#fee6ce',
    '#fdd0a2',
    '#fdae6b',
    '#fd8d3c',
    '#f16913',
    '#d94801',
    '#a63603',
    '#7f2704'
  ],
  'YlGnBu (population / terrain)': [
    '#ffffd9',
    '#edf8b1',
    '#c7e9b4',
    '#7fcdbb',
    '#41b6c4',
    '#1d91c0',
    '#225ea8',
    '#253494',
    '#081d58'
  ],
  'Turbo (rainbow, high dynamic range)': [
    '#30123b',
    '#4662d7',
    '#36aaf9',
    '#1ae4b6',
    '#72fe5e',
    '#c8ef34',
    '#faba39',
    '#f56918',
    '#c92903',
    '#7a0402'
  ]
};

export const COLOR_OPTIONS: ColorOption[] = Object.entries(RASTER_COLOR_PRESETS).map(([name, colors]) => ({
  value: name,
  label: name,
  color: colors[Math.floor(colors.length / 2)] || colors[0],
  colors: colors,
  gradient: `linear-gradient(to right, ${colors.join(', ')})`
}));

/**
 * Builds a Mapbox GL interpolation expression for vector tiles from an array of color stops.
 */
export const buildColorExpression = (
  fieldName: string = 'class',
  colors: string[],
  min: number = 0,
  max: number = 100,
  fallbackColor?: string
): any => {
  if (!colors || colors.length === 0) return fallbackColor || '#3b82f6';
  if (colors.length === 1) return colors[0];

  const interpArgs: (number | string)[] = [];
  const steps = Math.min(colors.length, 9);
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);
    const value = Math.round((min + t * (max - min)) * 100) / 100;
    interpArgs.push(value, colors[i]);
  }

  return [
    'case',
    ['has', fieldName],
    [
      'interpolate',
      ['linear'],
      ['coalesce', ['to-number', ['get', fieldName]], min],
      ...interpArgs
    ],
    fallbackColor || colors[0] || '#3b82f6'
  ];
};

/**
 * Generates the backend tile endpoint URL using the format:
 * @GetMapping("/raster/tiles/{rasterId}/{z}/{x}/{y}.mvt")
 */
export const getRasterTileUrl = (rasterId: string): string => {
  const baseUrl = config.API_BASE_URL || 'http://localhost:8080';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/raster/tiles/${rasterId}/{z}/{x}/{y}.mvt`;
};

/**
 * Catalog of presentation/demo raster tile layers using @GetMapping("/tiles/{rasterId}/{z}/{x}/{y}.mvt")
 */
export const DUMMY_RASTER_CATALOG: Record<string, RasterLayerConfig> = {
  landcover_mvt: {
    id: 'raster-landcover',
    rasterId: 'landcover',
    name: 'Landcover Classification (MVT)',
    type: 'vector',
    sourceLayer: 'landcover',
    fieldName: 'class',
    tiles: [getRasterTileUrl('landcover')],
    tileSize: 256,
    opacity: 0.75,
    attribution: 'Reveal Backend / Landcover MVT'
  },
  population_density: {
    id: 'raster-population-density',
    rasterId: 'population_density',
    name: 'Population Density (WorldPop MVT)',
    type: 'vector',
    sourceLayer: 'landcover',
    fieldName: 'class',
    tiles: [getRasterTileUrl('population_density'), 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    opacity: 0.7,
    attribution: 'WorldPop / MVT Tiles'
  },
  building_footprints: {
    id: 'raster-building-footprints',
    rasterId: 'building_footprints',
    name: 'Building Footprints / Settlement Density',
    type: 'vector',
    sourceLayer: 'landcover',
    fieldName: 'class',
    tiles: [getRasterTileUrl('building_footprints'), 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    tileSize: 256,
    opacity: 0.75,
    attribution: 'Esri / Maxar / MVT'
  },
  elevation_dem: {
    id: 'raster-elevation-dem',
    rasterId: 'elevation_dem',
    name: 'Digital Elevation Model (DEM MVT)',
    type: 'vector',
    sourceLayer: 'landcover',
    fieldName: 'class',
    tiles: [getRasterTileUrl('elevation_dem'), 'https://tile.opentopomap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    opacity: 0.65,
    attribution: 'OpenTopoMap / DEM MVT'
  },
  ndvi_vegetation: {
    id: 'raster-ndvi-vegetation',
    rasterId: 'ndvi_vegetation',
    name: 'Vegetation Index (NDVI MVT)',
    type: 'vector',
    sourceLayer: 'landcover',
    fieldName: 'class',
    tiles: [getRasterTileUrl('ndvi_vegetation'), 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'],
    tileSize: 256,
    opacity: 0.7,
    attribution: 'USGS / NOAA / MVT'
  },
  malaria_incidence: {
    id: 'raster-malaria-incidence',
    rasterId: 'malaria_incidence',
    name: 'Malaria Risk Surface (MVT)',
    type: 'vector',
    sourceLayer: 'landcover',
    fieldName: 'class',
    tiles: [getRasterTileUrl('malaria_incidence'), 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
    tileSize: 256,
    opacity: 0.7,
    attribution: 'CARTO / MAP / MVT'
  },
  precipitation: {
    id: 'raster-precipitation',
    rasterId: 'precipitation',
    name: 'Annual Precipitation (MVT)',
    type: 'vector',
    sourceLayer: 'landcover',
    fieldName: 'class',
    tiles: [getRasterTileUrl('precipitation'), 'https://tile.opentopomap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    opacity: 0.6,
    attribution: 'CHIRPS / MVT'
  },
  travel_time_access: {
    id: 'raster-travel-time',
    rasterId: 'travel_time_access',
    name: 'Travel Time to Health Facilities (MVT)',
    type: 'vector',
    sourceLayer: 'landcover',
    fieldName: 'class',
    tiles: [getRasterTileUrl('travel_time_access'), 'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png'],
    tileSize: 256,
    opacity: 0.7,
    attribution: 'AccessMod / MVT'
  }
};

/**
 * Finds a suitable layer id before which the raster layer should be inserted
 * so that polygon boundaries, labels, and interaction layers remain visible on top.
 */
export const findBeforeLayerId = (map: MapBoxMap): string | undefined => {
  if (!map || !map.getStyle) return undefined;
  const style = map.getStyle();
  if (!style || !style.layers) return undefined;

  const targetLayers = [
    'fill-layer',
    'children-layer',
    'main-border',
    'parent-border',
    'label-layer',
    'result-label',
    'result-parent-label',
    'multi-selected-layer',
    'target-areas-layer'
  ];

  for (const targetId of targetLayers) {
    if (map.getLayer(targetId)) {
      return targetId;
    }
  }

  return undefined;
};

/**
 * Adds a raster or vector-raster tile layer onto the Mapbox map instance.
 * Supports the tile format: /tiles/{rasterId}/{z}/{x}/{y}.mvt
 *
 * @param map Mapbox map instance
 * @param rasterKeyOrConfig Raster catalog key (e.g. 'population_density') or custom RasterLayerConfig
 * @param options Optional overrides for opacity, color, and beforeLayerId
 * @returns boolean true if successfully added, false otherwise
 */
export interface AddRasterOptions {
  opacity?: number;
  color?: string;
  colors?: string[];
  colorExpression?: any;
  beforeLayerId?: string;
  sourceLayer?: string;
  fieldName?: string;
}

export const addRasterToMap = (
  map: MapBoxMap | any,
  rasterKeyOrConfig: string | RasterLayerConfig,
  options?: AddRasterOptions
): boolean => {
  if (!map) {
    console.warn('[RasterHelper] Map instance not ready.');
    return false;
  }

  const config: RasterLayerConfig =
    typeof rasterKeyOrConfig === 'string'
      ? DUMMY_RASTER_CATALOG[rasterKeyOrConfig] || {
          id: `raster-${rasterKeyOrConfig}`,
          rasterId: rasterKeyOrConfig,
          name: rasterKeyOrConfig,
          tiles: [getRasterTileUrl(rasterKeyOrConfig)],
          tileSize: 256,
          opacity: 0.7
        }
      : rasterKeyOrConfig;

  const sourceId = `source-${config.id}`;
  const layerId = `layer-${config.id}`;
  const opacity = options?.opacity !== undefined ? options.opacity : config.opacity ?? 0.75;

  try {
    // Clean up existing layer and source if already present
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    const isMvt = config.tiles.some(t => t.endsWith('.mvt')) || config.type === 'vector';
    const beforeId = options?.beforeLayerId || findBeforeLayerId(map);
    const resolvedFieldName = options?.fieldName || config.fieldName || 'class';
    const resolvedSourceLayer = options?.sourceLayer || config.sourceLayer || 'landcover';

    const resolvedColor = options?.color || config.color || '#3b82f6';
    const colorExpression =
      options?.colorExpression ||
      (options?.colors && options.colors.length > 0
        ? buildColorExpression(resolvedFieldName, options.colors, 0, 100, resolvedColor)
        : resolvedColor);

    if (isMvt) {
      // Add vector tile source for .mvt
      map.addSource(sourceId, {
        type: 'vector',
        tiles: config.tiles,
        minzoom: config.minzoom || 0,
        maxzoom: config.maxzoom || 14
      });

      // Add fill layer for vector raster data
      map.addLayer(
        {
          id: layerId,
          type: 'fill',
          source: sourceId,
          'source-layer': resolvedSourceLayer,
          paint: {
            'fill-color': colorExpression,
            'fill-opacity': opacity,
            'fill-outline-color': 'transparent'
          }
        },
        beforeId
      );
    } else {
      // Add standard raster source
      map.addSource(sourceId, {
        type: 'raster',
        tiles: config.tiles,
        tileSize: config.tileSize || 256,
        attribution: config.attribution,
        scheme: config.scheme || 'xyz'
      });

      // Add raster layer
      map.addLayer(
        {
          id: layerId,
          type: 'raster',
          source: sourceId,
          minzoom: config.minzoom || 0,
          maxzoom: config.maxzoom || 22,
          paint: {
            'raster-opacity': opacity,
            'raster-resampling': 'linear',
            'raster-fade-duration': 300
          }
        },
        beforeId
      );
    }

    return true;
  } catch (err) {
    console.error(`[RasterHelper] Failed to add raster layer "${config.name}":`, err);
    return false;
  }
};

/**
 * Removes a raster layer and its source from the map.
 */
export const removeRasterFromMap = (map: MapBoxMap | any, rasterId: string): boolean => {
  if (!map) return false;

  const layerId = rasterId.startsWith('layer-') ? rasterId : `layer-${rasterId}`;
  const sourceId = rasterId.startsWith('source-') ? rasterId : `source-${rasterId.replace(/^layer-/, '')}`;

  try {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
    return true;
  } catch (err) {
    console.error(`[RasterHelper] Failed to remove raster layer "${rasterId}":`, err);
    return false;
  }
};

/**
 * Adjusts opacity for an existing raster layer.
 */
export const setRasterOpacity = (map: MapBoxMap | any, rasterId: string, opacity: number): void => {
  if (!map) return;
  const layerId = rasterId.startsWith('layer-') ? rasterId : `layer-${rasterId}`;
  if (map.getLayer(layerId)) {
    const layer = map.getLayer(layerId);
    if (layer.type === 'fill') {
      map.setPaintProperty(layerId, 'fill-opacity', Math.max(0, Math.min(1, opacity)));
    } else {
      map.setPaintProperty(layerId, 'raster-opacity', Math.max(0, Math.min(1, opacity)));
    }
  }
};

/**
 * Toggles visibility for a raster layer.
 */
export const toggleRasterVisibility = (map: MapBoxMap | any, rasterId: string, visible: boolean): void => {
  if (!map) return;
  const layerId = rasterId.startsWith('layer-') ? rasterId : `layer-${rasterId}`;
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
};
