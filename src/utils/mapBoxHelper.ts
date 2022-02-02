import { center, Feature, Point, Properties } from '@turf/turf';
import mapboxgl from 'mapbox-gl';

export const getPolygonCenter = (data: any) => {
  let centerLabel = center(data);

  // Geographic coordinates of the LineString
  let coordinates = data.geometry.coordinates[0][0];

  if (typeof coordinates[0] === 'number') {
    coordinates = data.geometry.coordinates[0];
  }

  // Create a 'LngLatBounds' with both corners at the first coordinate.
  const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);

  // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
  for (const coord of coordinates) {
    bounds.extend(coord);
  }
  return {
    center: centerLabel,
    bounds: bounds
  };
};

export const createLocation = (map: mapboxgl.Map, data: any): void => {
  if (map.getSource(data.identifier) === undefined) {
    map.addSource(data.identifier, {
      type: 'geojson',
      data: data
    });

    map.addLayer({
      id: data.identifier + 'Outline',
      type: 'line',
      source: data.identifier,
      layout: {},
      paint: {
        'line-color': data.properties.geographicLevel === 'country' ? 'black' : 'blue',
        'line-width': 6
      }
    });
    map.addLayer({
        id: data.identifier + 'Fill',
        type: 'fill',
        source: data.identifier,
        layout: {},
        paint: {
          'fill-color': data.properties.geographicLevel === 'country' ? 'yellow' : 'blue',
          'fill-opacity': 0.5
        }
      });
  }
};

export const createLocationLabel = (map: mapboxgl.Map, data: any, center: Feature<Point, Properties>) => {
  map.addSource(data.identifier + 'Label', {
    type: 'geojson',
    data: center
  });

  map.addLayer({
    id: data.identifier + 'Label',
    minzoom: map.getZoom() - 1.0,
    type: 'symbol',
    source: data.identifier + 'Label',
    layout: {
      'text-field': data.properties.name,
      'text-font': ['Open Sans Bold', 'Open Sans Semibold'],
      'text-anchor': 'bottom'
    },
    paint: {
      'text-color': 'white'
    }
  });
};
