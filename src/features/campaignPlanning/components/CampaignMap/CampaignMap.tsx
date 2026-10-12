import mapboxgl, { AttributionControl, GeoJSONSource, LngLatBounds, Map } from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { config } from '../../../../config/config';
import { DATASET_COLORS, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../constants';
import { LocationFeature, SimulationDataset } from '../../providers/types';
import styles from './CampaignMap.module.css';

mapboxgl.accessToken = config.MAPBOX_TOKEN ?? '';

const LOCATIONS_SOURCE = 'campaign-locations';
// Same outline as the Simulation page's children layer
const LOCATIONS_OUTLINE = 'rgba(0, 0, 0, 1)';
const DATASET_LAYER_PREFIX = `${LOCATIONS_SOURCE}-dataset-`;

interface Props {
  mapStyle: string;
  locations: LocationFeature[];
  datasets: SimulationDataset[];
}

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

// Same rules as the Simulation page's dataset layers (SimulationMapView), so both pages look alike for the same data:
// fill in the dataset colour, opacity from 0 at value 0 to 1 at the highest value among the shown areas,
// outline in the dataset's border colour (black by default) and line width
const setDatasetLayers = (map: Map, datasets: SimulationDataset[], data: GeoJSON.FeatureCollection) => {
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
          'fill-color': dataset.hexColor || DATASET_COLORS[index % DATASET_COLORS.length],
          'fill-opacity': maxValue > 0 ? ['interpolate', ['linear'], ['get', id], 0, 0, maxValue, 1] : 0
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

// Logo and attribution sit in the bottom gap between the table and the map tool buttons (see CSS)
const CampaignMap = ({ mapStyle, locations, datasets }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map>();
  const appliedStyle = useRef(mapStyle);
  const locationsData = useRef<GeoJSON.FeatureCollection>(toFeatureCollection([]));
  const fittedKey = useRef('');
  const datasetsRef = useRef(datasets);

  useEffect(() => {
    map.current = new Map({
      container: mapContainer.current as HTMLDivElement,
      style: appliedStyle.current,
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      logoPosition: 'bottom-right',
      attributionControl: false
    });
    map.current.addControl(new AttributionControl({ compact: true }), 'bottom-right');
    map.current.on('style.load', () => {
      if (!map.current) return;
      addLocationLayers(map.current, locationsData.current);
      setDatasetLayers(map.current, datasetsRef.current, locationsData.current);
    });
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (!map.current || appliedStyle.current === mapStyle) return;
    map.current.setStyle(mapStyle);
    appliedStyle.current = mapStyle;
  }, [mapStyle]);

  useEffect(() => {
    locationsData.current = toFeatureCollection(locations);
    const source = map.current?.getSource(LOCATIONS_SOURCE) as GeoJSONSource | undefined;
    source?.setData(locationsData.current);
    datasetsRef.current = datasets;
    if (map.current) setDatasetLayers(map.current, datasets, locationsData.current);
    // Zoom only when a different set of locations arrives, not when the same ones reload with new dataset values
    const key = locations.map(location => location.identifier).join();
    if (map.current && locationsData.current.features.length && key !== fittedKey.current) {
      map.current.fitBounds(getBounds(locationsData.current), { padding: 60, maxZoom: 12 });
      fittedKey.current = key;
    }
  }, [locations, datasets]);

  return <div ref={mapContainer} className={styles.map} />;
};

export default CampaignMap;
