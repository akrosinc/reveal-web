import { center, Feature, Point, Properties } from '@turf/turf';
import mapboxgl, { LngLatBounds, Map, Popup } from 'mapbox-gl';
import { toast } from 'react-toastify';
import { getChildLocation } from '../features/assignment/api';

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

export const createLocation = (map: mapboxgl.Map, data: any, zoom: number, locationHierarchy: string): void => {
  if (map.getSource(data.identifier) === undefined && map.getSource(data.properties.id + 'children') === undefined) {
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
        'line-color': 'gray',
        'line-width': 4
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

  map.on('mouseleave', identifier + '-fill', e => {
    popup.remove();
    clearTimeout(timer);
  });
}

export const createChild = (
  map: Map,
  data: any
) => {
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
        'fill-color': map.getZoom() >= 12 ? 'yellow' : 'gray',
        'fill-opacity': 0.2
      }
    });

    map.addLayer({
      id: data.identifier + '-border',
      type: 'line',
      source: data.identifier,
      layout: {},
      paint: {
        'line-color': map.getZoom() >= 12 ? 'yellow' : 'gray',
        'line-width': 3
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

export const doubleClickHandler = (map: Map, identifier: string, locationHierarchy: string) => {
  map.on('dblclick', identifier + '-fill', e => {
    if (!e.originalEvent.ctrlKey) {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length) {
        const feature = features[0];
        if (feature) {
          if (feature.properties && feature.properties.id) {
            loadChildren(map, feature.properties.id, locationHierarchy);
          }
        }
      }
    }
  });
}

let popup: Popup;

export const contextMenuHandler = (
  map: Map,
  identifier: string,
  openHandler: (data: any) => void,
  locationHierarchy?: string
) => {
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
      if (feature) {
        const buttonId = identifier + '-button';
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
        document.getElementById(buttonId)?.addEventListener('click', () => openHandler(feature));
        document
          .getElementById(loadChildButtonId)
          ?.addEventListener('click', () =>
            loadChildren(map, (feature.properties as any).id, locationHierarchy ?? '')
          );
        document.getElementById(detailsButtonId)?.addEventListener('click', () => openHandler(feature));
        document.getElementById(colorPickerId)?.addEventListener('change', e => {
          let hexColor = (e.target as any).value as string;
          map.setPaintProperty(identifier + '-fill', 'fill-color', hexColor);
        });
      }
    }
  });
};

export const selectHandler = (map: Map) => {
  map.on('click', e => {
    if (e.originalEvent.ctrlKey) {
      let f = map.queryRenderedFeatures(e.point);
      if (f.length) {
        if (map.getLayer((f[0].properties as any).id + '-highlighted')) {
          map.removeLayer((f[0].properties as any).id + '-highlighted');
        } else {
          map.addLayer({
            id: (f[0].properties as any).id + '-highlighted',
            type: 'fill',
            source: f[0].source,
            paint: {
              'fill-outline-color': '#484896',
              'fill-color': '#6e599f',
              'fill-opacity': 0.75
            }
          });
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

export const loadChildren = (
  map: Map,
  id: string,
  locationHierarchy: string
) => {
  getChildLocation(id, locationHierarchy).then(res => {
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
