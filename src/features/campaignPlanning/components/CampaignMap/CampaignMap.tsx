import mapboxgl, { GeoJSONSource, LngLatBounds, Map } from 'mapbox-gl';
import { memo, useEffect, useRef } from 'react';
import { config } from '../../../../config/config';
import { ASSIGNED_AREA_COLOR, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, TEAMS_ASSIGNED_AREA_COLOR } from '../../constants';
import { LocationFeature, SimulationDataset, TargetArea, ValueRange } from '../../providers/types';
import { getDatasetColor } from '../../utils/datasets';
import styles from './CampaignMap.module.css';

mapboxgl.accessToken = config.MAPBOX_TOKEN ?? '';

const LOCATIONS_SOURCE = 'campaign-locations';
// Same outline as the Simulation page's children layer
const LOCATIONS_OUTLINE = 'rgba(0, 0, 0, 1)';
const DATASET_LAYER_PREFIX = `${LOCATIONS_SOURCE}-dataset-`;
const TARGET_AREAS_SOURCE = 'campaign-target-areas';

interface Props {
  mapStyle: string;
  locations: LocationFeature[];
  datasets: SimulationDataset[];
  // Dataset filters narrowed on the left panel (dataset id → kept value range)
  filters: Record<string, ValueRange>;
  // Areas assigned to the campaign (simulation target areas) and whether "Toggle assigned" shows them
  targetAreas: TargetArea[];
  showAssigned: boolean;
}

const toTargetAreasCollection = (targetAreas: TargetArea[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: targetAreas
    .filter(area => area.geometry)
    .map(area => ({
      type: 'Feature',
      id: area.identifier,
      geometry: area.geometry,
      properties: { name: area.properties?.name, numberOfTeams: area.properties?.numberOfTeams ?? 0 }
    }))
});

// Assigned areas like Campaign Management's target areas layer, above the dataset fills and below the outlines/labels;
// the colours follow its legend (assigned to the campaign / already has teams)
const setTargetAreasLayer = (map: Map, data: GeoJSON.FeatureCollection, isVisible: boolean) => {
  const source = map.getSource(TARGET_AREAS_SOURCE) as GeoJSONSource | undefined;
  if (source) source.setData(data);
  else map.addSource(TARGET_AREAS_SOURCE, { type: 'geojson', data });
  if (!map.getLayer(`${TARGET_AREAS_SOURCE}-fill`)) {
    map.addLayer(
      {
        id: `${TARGET_AREAS_SOURCE}-fill`,
        type: 'fill',
        source: TARGET_AREAS_SOURCE,
        paint: {
          'fill-color': ['case', ['>', ['get', 'numberOfTeams'], 0], TEAMS_ASSIGNED_AREA_COLOR, ASSIGNED_AREA_COLOR]
        }
      },
      map.getLayer(`${LOCATIONS_SOURCE}-line`) ? `${LOCATIONS_SOURCE}-line` : undefined
    );
  }
  map.setLayoutProperty(`${TARGET_AREAS_SOURCE}-fill`, 'visibility', isVisible ? 'visible' : 'none');
};

// Each dataset value is copied to a flat property (dataset id → value) so map expressions can read it
const toFeatureCollection = (locations: LocationFeature[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: locations
    .filter(location => location.geometry)
    .map(location => ({
      type: 'Feature',
      id: location.identifier,
      geometry: location.geometry,
      properties: {
        name: location.properties.name,
        ...Object.fromEntries(location.properties.metadata?.map(item => [item.datasetId, item.value]) ?? [])
      }
    }))
});

// Like Simulation's dataset filter: areas whose value is outside the kept range get no fill
const getFillColor = (color: string, datasetId: string, range?: ValueRange): any =>
  range
    ? [
        'case',
        ['<', ['get', datasetId], range.min],
        'transparent',
        ['>', ['get', datasetId], range.max],
        'transparent',
        color
      ]
    : color;

// Same rules as the Simulation page's dataset layers (SimulationMapView), so both pages look alike for the same data:
// fill in the dataset colour, opacity from 0 at value 0 to 1 (or the Edit dataset opacity) at the highest value among the shown areas,
// outline in the dataset's border colour (black by default) and line width
const setDatasetLayers = (
  map: Map,
  datasets: SimulationDataset[],
  data: GeoJSON.FeatureCollection,
  filters: Record<string, ValueRange>
) => {
  if (!map.getSource(LOCATIONS_SOURCE)) return;
  map
    .getStyle()
    .layers?.filter(layer => layer.id.startsWith(DATASET_LAYER_PREFIX))
    .forEach(layer => map.removeLayer(layer.id));
  datasets.forEach((dataset, index) => {
    const id = dataset.identifier;
    const values = data.features.map(feature => feature.properties?.[id]).filter(value => typeof value === 'number');
    const maxValue = values.length ? Math.max(...values) : 0;
    map.addLayer(
      {
        id: `${DATASET_LAYER_PREFIX}${id}`,
        type: 'fill',
        source: LOCATIONS_SOURCE,
        filter: ['has', id],
        paint: {
          'fill-color': getFillColor(getDatasetColor(dataset, index), id, filters[id]),
          'fill-opacity':
            maxValue > 0 ? ['interpolate', ['linear'], ['get', id], 0, 0, maxValue, (dataset.opacity ?? 100) / 100] : 0
        }
      },
      `${LOCATIONS_SOURCE}-line`
    );
    map.addLayer(
      {
        id: `${DATASET_LAYER_PREFIX}${id}-outline`,
        type: 'line',
        source: LOCATIONS_SOURCE,
        filter: ['has', id],
        paint: { 'line-color': dataset.borderColor || 'black', 'line-width': dataset.lineWidth ?? 1 }
      },
      `${LOCATIONS_SOURCE}-line`
    );
  });
};

// Adds the locations source and its layers; setStyle drops them, so this runs again on every style load
const addLocationLayers = (map: Map, data: GeoJSON.FeatureCollection) => {
  if (map.getSource(LOCATIONS_SOURCE)) return;
  map.addSource(LOCATIONS_SOURCE, { type: 'geojson', data });
  map.addLayer({
    id: `${LOCATIONS_SOURCE}-line`,
    type: 'line',
    source: LOCATIONS_SOURCE,
    paint: { 'line-color': LOCATIONS_OUTLINE, 'line-width': 1 }
  });
  map.addLayer({
    id: `${LOCATIONS_SOURCE}-label`,
    type: 'symbol',
    source: LOCATIONS_SOURCE,
    layout: { 'text-field': ['get', 'name'], 'text-size': 11 },
    paint: { 'text-color': '#141814', 'text-halo-color': '#ffffff', 'text-halo-width': 1 }
  });
};

const getBounds = (data: GeoJSON.FeatureCollection) => {
  const bounds = new LngLatBounds();
  const extend = (coordinates: any): void => {
    if (typeof coordinates[0] === 'number') bounds.extend(coordinates as [number, number]);
    else coordinates.forEach(extend);
  };
  data.features.forEach(feature => {
    if (feature.geometry.type !== 'GeometryCollection') extend(feature.geometry.coordinates);
  });
  return bounds;
};

// No Mapbox logo / attribution (i) button: the lead asked to hide them (logo hidden in CSS)
const CampaignMap = ({ mapStyle, locations, datasets, filters, targetAreas, showAssigned }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map>();
  const appliedStyle = useRef(mapStyle);
  const locationsData = useRef<GeoJSON.FeatureCollection>(toFeatureCollection([]));
  const fittedKey = useRef('');
  const datasetsRef = useRef(datasets);
  const filtersRef = useRef(filters);
  const targetAreasData = useRef<GeoJSON.FeatureCollection>(toTargetAreasCollection(targetAreas));
  const showAssignedRef = useRef(showAssigned);

  useEffect(() => {
    map.current = new Map({
      container: mapContainer.current as HTMLDivElement,
      style: appliedStyle.current,
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      attributionControl: false
    });
    map.current.on('style.load', () => {
      if (!map.current) return;
      addLocationLayers(map.current, locationsData.current);
      setDatasetLayers(map.current, datasetsRef.current, locationsData.current, filtersRef.current);
      setTargetAreasLayer(map.current, targetAreasData.current, showAssignedRef.current);
    });
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (!map.current || appliedStyle.current === mapStyle) return;
    map.current.setStyle(mapStyle);
    appliedStyle.current = mapStyle;
  }, [mapStyle]);

  // Added / renamed / recoloured datasets: rebuild only the dataset layers (the area shapes stay as they are).
  // Declared before the locations effect so a render that changes both uses the new datasets there too.
  useEffect(() => {
    datasetsRef.current = datasets;
    if (map.current) setDatasetLayers(map.current, datasets, locationsData.current, filtersRef.current);
  }, [datasets]);

  // New areas: upload their shapes and values once, then rebuild the dataset layers (their max values changed)
  useEffect(() => {
    locationsData.current = toFeatureCollection(locations);
    const source = map.current?.getSource(LOCATIONS_SOURCE) as GeoJSONSource | undefined;
    source?.setData(locationsData.current);
    if (map.current) setDatasetLayers(map.current, datasetsRef.current, locationsData.current, filtersRef.current);
    // Zoom only when a different set of locations arrives, not when the same ones reload with new dataset values
    const key = locations.map(location => location.identifier).join();
    if (map.current && locationsData.current.features.length && key !== fittedKey.current) {
      map.current.fitBounds(getBounds(locationsData.current), { padding: 60, maxZoom: 12 });
      fittedKey.current = key;
    }
  }, [locations]);

  useEffect(() => {
    targetAreasData.current = toTargetAreasCollection(targetAreas);
    showAssignedRef.current = showAssigned;
    // Before the first style load there are no layers yet; style.load adds them
    if (map.current?.isStyleLoaded()) setTargetAreasLayer(map.current, targetAreasData.current, showAssigned);
  }, [targetAreas, showAssigned]);

  // Moving a filter slider only recolours the fills, without rebuilding the layers
  useEffect(() => {
    filtersRef.current = filters;
    datasetsRef.current.forEach((dataset, index) => {
      const layerId = `${DATASET_LAYER_PREFIX}${dataset.identifier}`;
      if (!map.current?.getLayer(layerId)) return;
      map.current.setPaintProperty(
        layerId,
        'fill-color',
        getFillColor(getDatasetColor(dataset, index), dataset.identifier, filters[dataset.identifier])
      );
    });
  }, [filters]);

  return <div ref={mapContainer} className={styles.map} />;
};

// Memoised: the map only needs to update when its own props change
export default memo(CampaignMap);
