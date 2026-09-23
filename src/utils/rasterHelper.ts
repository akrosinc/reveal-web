import { Map as MapBoxMap } from 'mapbox-gl';
import { toast } from 'react-toastify';

export interface RasterLayerConfig {
  id: string;
  name: string;
  tiles: string[];
  tileSize?: number;
  opacity?: number;
  color?: string;
  minzoom?: number;
  maxzoom?: number;
  attribution?: string;
  scheme?: 'xyz' | 'tms';
}

/**
 * Catalog of presentation/demo raster tile layers
 */
export const DUMMY_RASTER_CATALOG: Record<string, RasterLayerConfig> = {
  population_density: {
    id: 'raster-population-density',
    name: 'Population Density (WorldPop)',
    tiles: [
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],
    tileSize: 256,
    opacity: 0.7,
    attribution: '© OpenStreetMap contributors, WorldPop'
  },
  building_footprints: {
    id: 'raster-building-footprints',
    name: 'Building Footprints / Density',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ],
    tileSize: 256,
    opacity: 0.75,
    attribution: 'Esri, Maxar, Earthstar Geographics'
  },
  elevation_dem: {
    id: 'raster-elevation-dem',
    name: 'Digital Elevation Model (DEM)',
    tiles: [
      'https://tile.opentopomap.org/{z}/{x}/{y}.png'
    ],
    tileSize: 256,
    opacity: 0.65,
    attribution: '© OpenTopoMap contributors'
  },
  ndvi_vegetation: {
    id: 'raster-ndvi-vegetation',
    name: 'Vegetation Index (NDVI)',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'
    ],
    tileSize: 256,
    opacity: 0.7,
    attribution: 'Esri, USGS, NOAA'
  },
  malaria_incidence: {
    id: 'raster-malaria-incidence',
    name: 'Malaria Risk Surface',
    tiles: [
      'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
    ],
    tileSize: 256,
    opacity: 0.7,
    attribution: '© CARTO, Malaria Atlas Project'
  },
  precipitation: {
    id: 'raster-precipitation',
    name: 'Annual Precipitation',
    tiles: [
      'https://tile.opentopomap.org/{z}/{x}/{y}.png'
    ],
    tileSize: 256,
    opacity: 0.6,
    attribution: 'CHIRPS, Climate Hazards Center'
  },
  travel_time_access: {
    id: 'raster-travel-time',
    name: 'Travel Time to Health Facilities',
    tiles: [
      'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png'
    ],
    tileSize: 256,
    opacity: 0.7,
    attribution: '© CARTO, AccessMod'
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

  // Prefer placing below fill/border/label layers
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
 * Adds a raster tile layer onto the Mapbox map instance.
 *
 * @param map Mapbox map instance
 * @param rasterKeyOrConfig Raster catalog key (e.g. 'population_density') or custom RasterLayerConfig
 * @param options Optional overrides for opacity, color, and beforeLayerId
 * @returns boolean true if successfully added, false otherwise
 */
export const addRasterToMap = (
  map: MapBoxMap | any,
  rasterKeyOrConfig: string | RasterLayerConfig,
  options?: {
    opacity?: number;
    color?: string;
    beforeLayerId?: string;
  }
): boolean => {
  if (!map) {
    console.warn('[RasterHelper] Map instance not ready.');
    return false;
  }

  const config: RasterLayerConfig =
    typeof rasterKeyOrConfig === 'string'
      ? DUMMY_RASTER_CATALOG[rasterKeyOrConfig] || {
          id: `raster-${rasterKeyOrConfig}`,
          name: rasterKeyOrConfig,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          opacity: 0.7
        }
      : rasterKeyOrConfig;

  const sourceId = `source-${config.id}`;
  const layerId = `layer-${config.id}`;
  const opacity = options?.opacity !== undefined ? options.opacity : config.opacity ?? 0.7;

  try {
    // Clean up existing layer and source if already present
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    // Add raster source
    map.addSource(sourceId, {
      type: 'raster',
      tiles: config.tiles,
      tileSize: config.tileSize || 256,
      attribution: config.attribution,
      scheme: config.scheme || 'xyz'
    });

    const beforeId = options?.beforeLayerId || findBeforeLayerId(map);

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
    map.setPaintProperty(layerId, 'raster-opacity', Math.max(0, Math.min(1, opacity)));
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
