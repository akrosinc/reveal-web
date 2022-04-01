import { center, Feature, Point, Properties } from '@turf/turf';
import { LngLatBounds, Map, Popup, GeolocateControl, NavigationControl } from 'mapbox-gl';
import { toast } from 'react-toastify';
import { MAPBOX_STYLE } from '../constants';
import { getChildLocation } from '../features/assignment/api';

interface LocationProperties {
  id: string;
  name: string;
  assigned: boolean;
  numberOfTeams: number;
}

//init mapbox instance
export const initMap = (
  container: any,
  center: [number, number],
  zoom: number,
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
): Map => {
  const mapboxInstance = new Map({
    container: container.current,
    style: MAPBOX_STYLE,
    center: center,
    zoom: zoom,
    doubleClickZoom: false
  });
  mapboxInstance.addControl(
    new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: false
    }),
    position
  );
  mapboxInstance.addControl(
    new NavigationControl({
      showCompass: false
    }),
    position
  );
  return mapboxInstance;
};

export const getPolygonCenter = (data: any) => {
  let centerLabel = center(data);

  // Geographic coordinates of the LineString
  let coordinates = data.geometry.coordinates[0][0];

  if (typeof coordinates[0] === 'number') {
    coordinates = data.geometry.coordinates[0];
  }

  // Create a 'LngLatBounds' with both corners at the first coordinate.
  const bounds = new LngLatBounds(coordinates[0], coordinates[0]);

  // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
  for (const coord of coordinates) {
    bounds.extend(coord);
  }
  return {
    center: centerLabel,
    bounds: bounds
  };
};

export const createLocation = (map: Map, data: any, zoom: number, locationHierarchy: string): void => {
  if (
    map.getSource(data.identifier) === undefined &&
    map.getSource(data.properties.id + 'children') === undefined &&
    map.getLayer(data.properties.id + '-fill') === undefined
  ) {
    //save property id
    data.properties.id = data.identifier;
    map.addSource(data.identifier, {
      type: 'geojson',
      data: data,
      tolerance: 1.5
    });

    map.addLayer({
      id: data.identifier + '-outline',
      type: 'line',
      source: data.identifier,
      layout: {},
      paint: {
        'line-color': 'black',
        'line-width': 3
      }
    });
    map.addLayer({
      id: data.identifier + '-fill',
      type: 'fill',
      source: data.identifier,
      layout: {},
      paint: {
        'fill-color': data.properties.status === 'active' ? 'green' : 'red',
        'fill-opacity': 0.2
      }
    });

    hoverHandler(map, data.identifier);

    //set center label
    let centerLabel = getPolygonCenter(data);

    map.fitBounds(
      centerLabel.bounds,
      {
        padding: 20
      },
      {
        data: data,
        center: centerLabel.center
      }
    );
  }
};

export const hoverHandler = (map: Map, identifier: string) => {
  let popup = new Popup().setHTML(
    `<h4 class='bg-success text-light text-center'>Actions</h4><div class='p-2'><small>Available commands:<br />
    Right click - context menu <br/> Double Click - load children<br />
    Ctrl + Left Click - Select location</small></div>`
  );

  let timer: NodeJS.Timeout;

  map.on('mouseover', identifier + '-fill', e => {
    if (!popup.isOpen()) {
      timer = setTimeout(() => {
        popup.setLngLat(e.lngLat);
        popup.addTo(map);
        popup.setOffset(100);
      }, 1200);
    }
  });

  map.on('mouseleave', identifier + '-fill', _ => {
    popup.remove();
    clearTimeout(timer);
  });
};

export const createChild = (map: Map, data: any) => {
  if (map.getSource(data.identifier) === undefined) {
    map.addSource(data.identifier, {
      type: 'geojson',
      data: data,
      tolerance: 1.5
    });

    map.addLayer({
      id: data.identifier + '-fill',
      type: 'fill',
      source: data.identifier,
      layout: {},
      paint: {
        'fill-color': ['match', ['get', 'geographicLevel'], 'structure', 'yellow', ['match', ['get', 'numberOfTeams'], 0, 'red', 'green']],
        'fill-opacity': 0.4
      }
    });

    map.addLayer({
      id: data.identifier + '-fill-disable',
      type: 'fill',
      source: data.identifier,
      layout: {},
      paint: {
        'fill-color': 'grey',
        'fill-opacity': 0.8
      },
      filter: ['in', 'assigned', false]
    });

    map.addLayer({
      id: data.identifier + '-border',
      type: 'line',
      source: data.identifier,
      layout: {},
      paint: {
        'line-color': 'black',
        'line-width': 2.5
      }
    });

    if (data.features && data.features.length > 1) {
      //set center label
      const group = new LngLatBounds();
      const featureSet: Feature<Point, Properties>[] = [];
      data.features.forEach((element: any) => {
        //create label for each of the locations
        //create a group of locations so we can fit them all in viewport
        const centerLabel = getPolygonCenter(element);
        centerLabel.center.properties = {
          name: element.properties.name
        };
        featureSet.push(centerLabel.center);
        group.extend(element.geometry.coordinates[0][0]);
      });
      map.fitBounds(group, {
        easing: e => {
          //this is an event which is fired at the end of the fit bounds
          if (e === 1) {
            createChildLocationLabel(map, featureSet, data.identifier);
          }
          return e;
        },
        zoom: map.getZoom() + 0.5
      });
    } else {
      const centerLabel = getPolygonCenter(data.features[0]);
      map.fitBounds(centerLabel.bounds, {
        easing: e => {
          if (e === 1) {
            createLocationLabel(map, data.features[0], centerLabel.center);
          }
          return e;
        }
      });
    }
  }
};

export const doubleClickHandler = (map: Map, identifier: string, planId: string) => {
  map.on('dblclick', identifier + '-fill', e => {
    if (!e.originalEvent.ctrlKey) {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length) {
        const feature = features[0];
        if (feature) {
          if (feature.properties && feature.properties.id) {
            loadChildren(map, feature.properties.id, planId);
          }
        }
      }
    }
  });
};

let popup: Popup;

export const contextMenuHandler = (map: Map, identifier: string, openHandler: (data: any) => void, planId: string) => {
  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('contextmenu', identifier + '-fill', e => {
    //get layer from event point
    const features = map.queryRenderedFeatures(e.point);

    if (features.length) {
      //remove previouse popup if exist
      if (popup !== undefined) {
        popup.remove();
      }
      const feature = features[0];
      if (feature && feature.properties && feature.properties.id) {
        const buttonId = identifier + '-button';
        if (feature.layer.id.includes('-highlighted')) {
          popup = new Popup({ focusAfterOpen: true, closeOnMove: true })
            .setLngLat(e.lngLat)
            .setHTML(
              `<h4 class='bg-success text-center'>Action menu</h4>
              <div class='m-0 p-0 text-center'>
              <p>You have selected multiple locations.</p>
              <button class='btn btn-primary mx-2 mt-2 mb-4' style='min-width: 200px' id='${buttonId}'>Assign teams</button>
              </div>`
            )
            .addTo(map);
        } else {
          const loadChildButtonId = identifier + '-child-button';
          const detailsButtonId = identifier + '-details-button';
          const colorPickerId = identifier + '-color-picker';
          popup = new Popup({ focusAfterOpen: true, closeOnMove: true })
            .setLngLat(e.lngLat)
            .setHTML(
              `<h4 class='bg-success text-center'>Action menu</h4>
                <div class='m-0 p-0 text-center'>
                  <p>
                    <label>Property name: </label>
                      ${(feature.properties as any).name}
                      <br />
                  </p>
                  <button class='btn btn-primary w-75 mb-2' id='${buttonId}'>Assign teams</button>
                  <button class='btn btn-primary w-75 mb-2' id='${loadChildButtonId}'>Load lower level</button>
                  <button class='btn btn-primary w-75 mb-2' id='${detailsButtonId}'>Property details</button>
                  <label style='vertical-align: super' class='me-1'>Change layer color:</label>
                  <input id='${colorPickerId}' class='mb-3' type='color' />
                </div>`
            )
            .addTo(map);
          document
            .getElementById(loadChildButtonId)
            ?.addEventListener('click', () => loadChildren(map, (feature.properties as any).id, planId));
          document.getElementById(detailsButtonId)?.addEventListener('click', () => openHandler(feature));
          document.getElementById(colorPickerId)?.addEventListener('change', e => {
            let hexColor = (e.target as any).value as string;
            map.setPaintProperty((feature.properties as any).id + '-fill', 'fill-color', hexColor);
          });
        }
        document.getElementById(buttonId)?.addEventListener('click', () => openHandler(feature));
      }
    }
  });
};

export const selectHandler = (
  map: Map,
  selectedLocations: string[],
  setSelectedLocations: (locations: string[]) => void
) => {
  map.on('click', e => {
    if (e.originalEvent.ctrlKey) {
      let features = map.queryRenderedFeatures(e.point);
      if (features.length) {
        const selectedLocation = features[0].properties as LocationProperties;
        if (selectedLocation && selectedLocation.id) {
          if (map.getLayer(selectedLocation.id + '-highlighted')) {
            selectedLocations = selectedLocations.filter(el => el !== selectedLocation.id);
            setSelectedLocations(selectedLocations);
            map.removeLayer(selectedLocation.id + '-highlighted');
          } else {
            selectedLocations.push(selectedLocation.id);
            setSelectedLocations(selectedLocations);
            map.addLayer({
              id: selectedLocation.id + '-highlighted',
              type: 'fill',
              source: features[0].source,
              paint: {
                'fill-outline-color': '#484896',
                'fill-color': '#6e599f',
                'fill-opacity': 0.75
              },
              filter: ['in', 'id', selectedLocation.id]
            });
          }
        }
      }
    }
  });
};

export const createChildLocationLabel = (map: Map, featureSet: Feature<Point, Properties>[], identifier: string) => {
  map.addSource(identifier + '-label', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: featureSet
    },
    tolerance: 1.5
  });

  map.addLayer({
    id: identifier + '-label',
    type: 'symbol',
    minzoom: map.getZoom() + 1.5,
    source: identifier + '-label',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Bold', 'Open Sans Semibold'],
      'text-anchor': 'bottom'
    },
    paint: {
      'text-color': 'white'
    }
  });
};

export const loadChildren = (map: Map, id: string, planId: string) => {
  getChildLocation(id, planId).then(res => {
    res.map(el => {
      const properties = {
        ...el.properties,
        id: el.identifier
      };
      el.properties = properties;
      return el;
    });
    if (res.length) {
      let featureSet = {
        identifier: id + 'children',
        type: 'FeatureCollection',
        features: res
      };
      createChild(map, featureSet);
    } else {
      toast.info('This location has no child locations.');
    }
  });
};

export const createLocationLabel = (map: Map, data: any, center: Feature<Point, Properties>) => {
  if (map.getSource(data.identifier + 'Label') === undefined) {
    map.addSource(data.identifier + 'Label', {
      type: 'geojson',
      data: center,
      tolerance: 1.5
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
  }
};
