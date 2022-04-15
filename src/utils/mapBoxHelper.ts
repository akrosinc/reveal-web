import { center, Feature, Point, Properties, Polygon, MultiPolygon, bbox } from '@turf/turf';
import { LngLatBounds, Map, Popup, GeolocateControl, NavigationControl } from 'mapbox-gl';
import { toast } from 'react-toastify';
import { MAPBOX_STYLE } from '../constants';
import { assignLocationToPlan, getChildLocation } from '../features/assignment/api';

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
  //initialize an empty top layer for all labels
  //this layer is used to prevent labels getting behind fill and border layers on loading of locations
  mapboxInstance.on('load', () => {
    mapboxInstance.addSource('label-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    mapboxInstance.addLayer({
      id: 'label-layer',
      type: 'line',
      source: 'label-source'
    });
  });
  return mapboxInstance;
};

export const getPolygonCenter = (data: any) => {
  let centerLabel = center(data);

  // Geographic coordinates of the LineString
  let coordinates = data.geometry.coordinates[0][0];

  if (typeof coordinates[0] === 'number') {
    coordinates = data.geometry.coordinates[0];
  }

  // check if its a multy polygon, if it is append all polygons to bounds
  if (data.geometry.coordinates.length > 1) {
    data.geometry.coordinates.forEach((el: any[]) => {
      // prevent bad geojson error
      if (typeof el[0] === 'number') {
        coordinates = [...coordinates, ...el];
      } else {
        coordinates = [...coordinates, ...el[0]];
      }
    });
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

export const createLocation = (map: Map, data: any, moveend: () => void): void => {
  if (
    map.getSource(data.identifier) === undefined &&
    map.getSource(data.properties.id + 'children') === undefined &&
    map.getLayer(data.properties.id + '-fill') === undefined
  ) {
    //save property id
    data.properties.id = data.identifier;
    map.addSource(data.identifier, {
      promoteId: 'id',
      type: 'geojson',
      data: data,
      tolerance: 1
    });

    map.addLayer(
      {
        id: data.identifier + '-outline',
        type: 'line',
        source: data.identifier,
        layout: {},
        paint: {
          'line-color': 'black',
          'line-width': 3.5
        }
      },
      'label-layer'
    );
    map.addLayer(
      {
        id: data.identifier + '-fill',
        type: 'fill',
        source: data.identifier,
        layout: {},
        paint: {
          'fill-color': [
            'match',
            ['get', 'geographicLevel'],
            'structure',
            'yellow',
            ['match', ['get', 'numberOfTeams'], 0, '#A7171A', '#5DBB63']
          ],
          'fill-opacity': 0.6
        }
      },
      'label-layer'
    );

    if (data.properties.numberOfTeams !== undefined) {
      map.addLayer(
        {
          id: data.identifier + '-fill-disable',
          type: 'fill',
          source: data.identifier,
          layout: {},
          paint: {
            'fill-color': '#656565',
            'fill-opacity': 0.8
          },
          filter: ['in', 'assigned', false]
        },
        'label-layer'
      );
    }

    //set center label
    let centerLabel = getPolygonCenter(data);

    map.fitBounds(
      centerLabel.bounds,
      {
        easing: e => {
          //this is an event which is fired at the end of the fit bounds
          if (e === 1) {
            createLocationLabel(map, data, centerLabel.center);
            moveend();
          }
          return e;
        },
        padding: 20
      },
      {
        //send data event only if its 1st location to be loaded to initialize event handlers;
        data: map.queryRenderedFeatures().length > 1 ? undefined : data,
        center: centerLabel.center
      }
    );
  } else {
    moveend();
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
  let layerList = new Set(
    map
      .queryRenderedFeatures()
      .map(el => (el.properties as any).name as string)
      .filter(el => el !== undefined)
  );
  data.features.forEach((el: any, index: number) => {
    if (layerList.has((el.properties as any).name)) {
      data.features.splice(index, 1);
    } else {
      el.id = el.identifier;
    }
  });
  if (map.getSource(data.identifier) === undefined && data.features.length) {
    map.addSource(data.identifier, {
      type: 'geojson',
      promoteId: 'id',
      data: data,
      tolerance: 1
    });

    map.addLayer(
      {
        id: data.identifier + '-fill',
        type: 'fill',
        source: data.identifier,
        layout: {},
        paint: {
          'fill-color': [
            'match',
            ['get', 'geographicLevel'],
            'structure',
            'yellow',
            ['match', ['get', 'numberOfTeams'], 0, '#A7171A', '#5DBB63']
          ],
          'fill-opacity': 0.6
        }
      },
      'label-layer'
    );

    map.addLayer(
      {
        id: data.identifier + '-fill-disable',
        type: 'fill',
        source: data.identifier,
        layout: {},
        paint: {
          'fill-color': 'grey',
          'fill-opacity': 0.8
        },
        filter: ['in', 'assigned', false]
      },
      'label-layer'
    );

    map.addLayer(
      {
        id: data.identifier + '-border',
        type: 'line',
        source: data.identifier,
        layout: {},
        paint: {
          'line-color': 'black',
          'line-width': 3
        }
      },
      'label-layer'
    );

    if (data.features && data.features.length > 1) {
      const featureSet: Feature<Point, Properties>[] = [];
      const bounds = bbox(data) as any;
      data.features.forEach((element: Feature<Polygon | MultiPolygon, LocationProperties>) => {
        //create label for each of the locations
        //create a group of locations so we can fit them all in viewport
        const centerLabel = getPolygonCenter(element);
        centerLabel.center.properties = {
          name: element.properties.name
        };
        featureSet.push(centerLabel.center);
      });
      map.fitBounds(bounds, {
        easing: e => {
          //this is an event which is fired at the end of the fit bounds
          if (e === 1) {
            createChildLocationLabel(map, featureSet, data.identifier);
          }
          return e;
        },
        duration: 600
      });
    } else {
      const centerLabel = getPolygonCenter(data.features[0]);
      map.fitBounds(centerLabel.bounds, {
        easing: e => {
          if (e === 1) {
            createLocationLabel(map, data.features[0], centerLabel.center);
          }
          return e;
        },
        duration: 600
      });
    }
  }
};

export const doubleClickHandler = (map: Map, planId: string) => {
  map.on('dblclick', e => {
    if (!e.originalEvent.ctrlKey) {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length) {
        const feature = features[0];
        if (feature) {
          if (feature.properties && feature.properties.id && feature.properties.assigned) {
            loadChildren(map, feature.properties.id, planId);
          }
        }
      }
    }
  });
};

let popup: Popup;

export const contextMenuHandler = (map: Map, openHandler: (data: any, assign: boolean) => void, planId: string) => {
  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('contextmenu', e => {
    //get layer from event point
    const features = map.queryRenderedFeatures(e.point);

    if (features.length) {
      //remove previouse popup if exist
      if (popup !== undefined) {
        popup.remove();
      }
      const feature = features[0];
      if (feature && feature.properties && feature.properties.id) {
        const buttonId = feature.properties.id + '-button';
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
          const loadChildButtonId = feature.properties.id + '-child-button';
          const assignButtonId = feature.properties.id + '-assign';
          const start = `<h4 class='bg-success text-center'>Action menu</h4>
          <div class='m-0 p-0 text-center'>
            <p>
              <label>Property name: </label>
                ${(feature.properties as any).name}
                <br />
            </p>`;
          const end = `<button class='btn btn-primary w-75 mb-2' id='${loadChildButtonId}'>Load lower level</button>
          <button class='btn btn-primary w-75 mb-3' id='${buttonId}'>Actions and Details</button>
          </div>`;
          console.log(feature);
          const displayHTML =
            start +
            ((feature.properties as LocationProperties).assigned || feature.state.assigned
              ? end
              : `<button class='btn btn-primary w-75 mb-3' id='${assignButtonId}'>Assign location</button></div>`);
          popup = new Popup({ focusAfterOpen: true, closeOnMove: true })
            .setLngLat(e.lngLat)
            .setHTML(displayHTML)
            .addTo(map);
          document
            .getElementById(loadChildButtonId)
            ?.addEventListener('click', () => loadChildren(map, (feature.properties as any).id, planId));
          document.getElementById(assignButtonId)?.addEventListener('click', () => {
            assignLocationToPlan(planId, (feature.properties as any).id).then(res => {
              openHandler(feature, true);
              toast.success('Location assigned successfully.');
            });
            popup.remove();
          });
        }
        document.getElementById(buttonId)?.addEventListener('click', () => openHandler(feature, false));
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
        if (selectedLocation && selectedLocation.id && selectedLocation.assigned) {
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
  if (map.getSource(identifier + '-label') === undefined) {
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
      minzoom: map.getZoom(),
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
  }
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

export const isLocationAlreadyLoaded = (map: Map, propertyName: any): boolean => {
  let exists = false;
  map.queryRenderedFeatures().forEach(el => {
    if ((el.properties as any).name === propertyName) {
      exists = true;
    }
  });
  return exists;
};
