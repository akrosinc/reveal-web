import {
  bbox,
  center,
  Feature,
  FeatureCollection,
  MultiPolygon,
  Point,
  pointsWithinPolygon,
  Polygon,
  Properties
} from '@turf/turf';
import mapboxgl, {
  EventData,
  GeoJSONSource,
  GeolocateControl,
  LngLatBoundsLike,
  Map,
  MapMouseEvent,
  NavigationControl,
  Popup
} from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MutableRefObject } from 'react';
import { toast } from 'react-toastify';
import {
  MAP_COLOR_NO_TEAMS,
  MAP_COLOR_SELECTED,
  MAP_COLOR_TEAM_ASSIGNED,
  MAP_COLOR_UNASSIGNED,
  MAP_DEFAULT_DISABLED_FILL_OPACITY,
  MAP_DEFAULT_FILL_OPACITY
} from '../constants';
import { assignLocationToPlan, getChildLocation } from '../features/assignment/api';
import { getLocationByIdAndPlanId } from '../features/location/api';
import {
  PlanningLocationResponse,
  PlanningLocationResponseTagged,
  PlanningParentLocationResponse
} from '../features/planSimulation/providers/types';

export interface LocationProperties {
  id: string;
  name: string;
  assigned: boolean;
  numberOfTeams: number;
  childrenNumber: number;
  geographicLevel: string;
  columnDataMap: string;
  distCoveragePercent: number;
}

export const SEARCH_RESULT_LABEL_SOURCE = 'main-labels';
export const HEATMAP_SOURCE_LABEL = 'parent-heatmap';
export const HEAT_MAP_LAYER_LABEL = 'heatmap-layer';

export const SEARCH_RESULT_LABEL_LAYER_LABEL = 'result-label';
export const PARENT_SOURCE = 'parent';
export const PARENT_LABEL_SOURCE = 'parent-labels';
export const PARENT_LAYER = 'parent-border';
export const PARENT_LABEL_LAYER = 'result-parent-label';

export const SEARCH_RESULT_SOURCE = 'main';
export const SEARCH_RESULT_FILL_LAYER = 'fill-layer';
export const SEARCH_RESULT_LINE_LAYER = 'main-border';

let timer: NodeJS.Timeout;
let popup: Popup;

//add access token to mapbox
mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? '';

//init mapbox instance
export const initSimulationMap = (
  container: MutableRefObject<any>,
  center: [number, number],
  zoom: number,
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  style: string,
  listener: (e: MapMouseEvent & EventData) => void
): Map => {
  const mapboxInstance = new Map({
    container: container.current,
    style: style,
    center: center,
    zoom: zoom,
    doubleClickZoom: false
  });

  mapboxInstance.addControl(
    new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }),
    position
  );
  mapboxInstance.addControl(
    new NavigationControl({
      showCompass: false
    }),
    position
  );
  mapboxInstance.setMinZoom(1.5);
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

    mapboxInstance.on('mouseover', 'draw-layer', e => {
      console.log(e);
    });

    let initParentData: PlanningParentLocationResponse = {
      features: [],
      type: 'FeatureCollection',
      identifier: undefined,
      featureCount: 0
    };
    createParentLayers(mapboxInstance, initParentData, PARENT_SOURCE, PARENT_LAYER);
    createSearchResultLabelLayer(mapboxInstance, initParentData, PARENT_LABEL_SOURCE, PARENT_LABEL_LAYER);

    mapboxInstance.on('contextmenu', listener);

    let mapboxDraw = new MapboxDraw({
      displayControlsDefault: true
    });

    // mapboxInstance.addControl(mapboxDraw, 'bottom-left');
    mapboxInstance.on('mouseover', 'gl-draw-polygon-fill-inactive.hot', e => {
      console.log(e);

      let sourceCentres: any = mapboxInstance.getSource('catchment-centers');

      let sourceData: FeatureCollection<Point> = {
        type: (sourceCentres._data as any)['type'],
        features: (sourceCentres._data as any)['features']
        // parents: (sourceCentres._data as any)['parents'],
        // identifier: undefined
      };

      e.features?.forEach((feature: any) => {
        if (feature != null && feature['properties'] && feature['properties']['id']) {
          console.log('feature', feature['properties']['id']);
          let item = mapboxDraw.get(feature['properties']['id']);

          let drawFeature: FeatureCollection<Polygon> = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: feature.geometry,
                properties: null,
                id: undefined
              }
            ]
          };

          let a = pointsWithinPolygon(sourceData, drawFeature)
            .features.filter(feature => feature.properties && feature.properties.identifier)
            .map(feature => feature?.properties?.identifier);

          sourceData.features.map(feature => {
            if (feature.properties && feature.properties.identifier) {
              if (a.includes(feature.properties.identifier)) {
                feature.properties['mark'] = true;
              }
            }
          });

          if (mapboxInstance.getSource('catchment-centers')) {
            (mapboxInstance.getSource('catchment-centers') as GeoJSONSource).setData(sourceData);
          }
        }
      });

      console.log(e.point);

      // if (e && e.features) {
      //   pointsWithinPolygon(e.features, sourceData);
      // }
    });
  });

  return mapboxInstance;
};

export const initMap = (
  container: MutableRefObject<any>,
  center: [number, number],
  zoom: number,
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  style: string
): Map => {
  const mapboxInstance = new Map({
    container: container.current,
    style: style,
    center: center,
    zoom: zoom,
    doubleClickZoom: false
  });
  mapboxInstance.addControl(
    new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }),
    position
  );
  mapboxInstance.addControl(
    new NavigationControl({
      showCompass: false
    }),
    position
  );
  mapboxInstance.setMinZoom(1.5);
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

export const getPolygonCenter = (data: Feature<Polygon | MultiPolygon | Point>) => {
  return {
    center: center(data),
    bounds: bbox(data) as LngLatBoundsLike
  };
};

export const getFeatureCentres = (
  data: FeatureCollection<Polygon | MultiPolygon | Point>
): Feature<Point, Properties>[] => {
  const featureSet: Feature<Point, Properties>[] = [];
  data.features.forEach((element: Feature<Polygon | MultiPolygon | Point, Properties>) => {
    //create label for each of the locations
    //create a group of locations so we can fit them all in viewport
    if (element) {
      const centerLabel = getPolygonCenter(element);

      centerLabel.center.properties = { ...element.properties };
      featureSet.push(centerLabel.center);
    }
  });
  return featureSet;
};

export const getFeatureCentresFromLocation = (
  data: FeatureCollection<Polygon | MultiPolygon | Point>
): Feature<Point, Properties>[] => {
  const featureSet: Feature<Point, Properties>[] = [];
  data.features.forEach((element: Feature<Polygon | MultiPolygon | Point, Properties>) => {
    //create label for each of the locations
    //create a group of locations so we can fit them all in viewport
    if (element && element.properties) {
      let geometry: Point;
      if (element.properties.hasOwnProperty('point')) {
        geometry = element.properties.point.geometry;
      } else {
        geometry = {
          type: 'Point',
          coordinates: [element.properties.xcentroid, element.properties.ycentroid]
        };
      }

      let point: Feature<Point, Properties> = {
        id: element.id,
        type: 'Feature',
        properties: element.properties,
        geometry: geometry
      };

      featureSet.push(point);
    }
  });
  return featureSet;
};

export const getLocationsFilteredByGeoLevel = (
  data: FeatureCollection<Polygon | MultiPolygon | Point>,
  geographicLevel: String
) => {
  return data.features.filter((element: Feature<Polygon | MultiPolygon | Point, Properties>) => {
    //create label for each of the locations
    //create a group of locations so we can fit them all in viewport
    console.log(element);
    return element.properties?.geographicLevel === geographicLevel;
  });
};

export const fitCollectionToBounds = (mapInstance: Map, data: PlanningLocationResponse) => {
  const bounds = bbox(data) as any;
  mapInstance.fitBounds(bounds, {
    padding: 20,
    duration: 600
  });
};

export const createLocation = (map: Map, data: any, moveend: () => void, opacity: number): void => {
  if (
    map.getSource(data.identifier) === undefined &&
    map.getSource(data.properties.id + 'children') === undefined &&
    map.getLayer(data.properties.id + '-fill') === undefined
  ) {
    disableMapInteractions(map, true);
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
            ['match', ['get', 'numberOfTeams'], 0, MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED]
          ],
          'fill-opacity': opacity
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
            'fill-color': MAP_COLOR_UNASSIGNED,
            'fill-opacity': MAP_DEFAULT_DISABLED_FILL_OPACITY
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
            disableMapInteractions(map, false);
          }
          return e;
        },
        padding: 20,
        duration: 1000
      },
      {
        //send data event only if its 1st location to be loaded to initialize event handlers;
        data: map.queryRenderedFeatures().length > 1 ? undefined : data,
        center: centerLabel.center
      }
    );
    // Grab the prefers reduced media query.
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Check if the media query matches or is not available.
    if (!mediaQuery || mediaQuery.matches) {
      createLocationLabel(map, data, centerLabel.center);
      moveend();
      disableMapInteractions(map, false);
    }
  } else {
    moveend();
  }
};

// hover handler with timeout to simulate hovering effect
export const hoverHandler = (map: Map, identifier: string) => {
  let popup = new Popup({ closeButton: false }).setHTML(
    `<h4 class="bg-success text-light text-center">Actions</h4><div class="p-2"><small>Available commands:<br />
    Right click - context menu <br/> Double Click - load children<br />
    Ctrl + Left Click - Select location</small></div>`
  );

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

export const createChild = (map: Map, data: any, opacity: number) => {
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
            ['match', ['get', 'numberOfTeams'], 0, MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED]
          ],
          'fill-opacity': opacity
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
          'fill-color': MAP_COLOR_UNASSIGNED,
          'fill-opacity': MAP_DEFAULT_DISABLED_FILL_OPACITY
        },
        filter: [
          'case',
          ['==', ['get', 'geographicLevel'], 'structure'],
          false,
          ['case', ['boolean', ['get', 'assigned']], false, true]
        ]
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

    const featureSet: Feature<Point, Properties>[] = [];
    const bounds = bbox(data) as LngLatBoundsLike;
    data.features.forEach((element: Feature<Polygon | MultiPolygon, LocationProperties>) => {
      //create label for each of the locations
      //create a group of locations so we can fit them all in viewport
      const centerLabel = getPolygonCenter(element);
      centerLabel.center.properties = {
        name: element.properties.name,
        childrenNumber: element.properties.childrenNumber,
        geographicLevel: element.properties.geographicLevel
      };
      featureSet.push(centerLabel.center);
    });
    map.fitBounds(bounds, {
      easing: e => {
        //this is an event which is fired at the end of the fit bounds
        if (e === 1) {
          createChildLocationLabel(map, featureSet, data.identifier);
          disableMapInteractions(map, false);
        }
        return e;
      },
      padding: 20,
      duration: 600
    });
    // Grab the prefers reduced media query.
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Check if the media query matches or is not available.
    if (!mediaQuery || mediaQuery.matches) {
      createChildLocationLabel(map, featureSet, data.identifier);
      disableMapInteractions(map, false);
    }
  } else {
    disableMapInteractions(map, false);
  }
};

export const doubleClickHandler = (map: Map, planId: string, opacity: number) => {
  map.on('dblclick', e => {
    if (!e.originalEvent.ctrlKey) {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length) {
        const feature = features[0];
        if (feature) {
          if (feature.properties && feature.properties.id && (feature.properties.assigned || feature.state.assigned)) {
            loadChildren(map, feature.properties.id, planId, opacity);
          }
        }
      }
    }
  });
};

export const contextMenuHandler = (
  map: Map,
  openHandler: (data: any, assign: boolean) => void,
  planId: string,
  opacity: number
) => {
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
          popup = new Popup({ focusAfterOpen: true, closeOnMove: true, closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(
              `<h4 class="bg-success text-center">Action menu</h4>
              <div class="m-0 p-0 text-center">
              <p>You have selected multiple locations.</p>
              <button class="btn btn-primary mx-2 mt-2 mb-4" style="min-width: 200px" id="${buttonId}">Assign teams</button>
              </div>`
            )
            .addTo(map);
        } else {
          const loadChildButtonId = feature.properties.id + '-child-button';
          const assignButtonId = feature.properties.id + '-assign';
          const parentButtonId = feature.properties.id + '-parent';
          const start = `<h4 class="bg-success text-center">Action menu</h4>
          <div class="m-0 p-0 text-center">
            <p>
              <label>Property name: </label>
                ${(feature.properties as any).name}
                <br />
            </p>`;
          const end = `<button class="btn btn-primary w-75 mb-2" id="${loadChildButtonId}">Load lower level</button>
          <button class="btn btn-primary w-75 mb-2" id="${parentButtonId}" style="${
            (feature.properties as any).parentIdentifier ? 'display: ""' : 'display: none'
          }">Parent details</button>
          <button class="btn btn-primary w-75 mb-3" id="${buttonId}">Actions and Details</button>
          </div>`;
          const displayHTML =
            start +
            ((feature.properties as LocationProperties).assigned || feature.state.assigned
              ? end
              : feature.properties.geographicLevel === 'structure'
              ? `<button class="btn btn-primary w-75 mb-3" id="${buttonId}">Structure Details</button>`
              : `<button class="btn btn-primary w-75 mb-3" id="${assignButtonId}">Assign location</button></div>`);
          popup = new Popup({ focusAfterOpen: true, closeOnMove: true, closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(displayHTML)
            .addTo(map);
          document
            .getElementById(loadChildButtonId)
            ?.addEventListener('click', () => loadChildren(map, (feature.properties as any).id, planId, opacity));
          document.getElementById(parentButtonId)?.addEventListener('click', () => {
            getLocationByIdAndPlanId((feature.properties as any).parentIdentifier, planId).then(res => {
              res.properties.id = res.identifier;
              openHandler(res, false);
            });
          });
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
        if (selectedLocation && selectedLocation.id && (selectedLocation.assigned || features[0].state.assigned)) {
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
                'fill-color': MAP_COLOR_SELECTED,
                'fill-opacity': MAP_DEFAULT_FILL_OPACITY
              },
              filter: ['in', 'id', selectedLocation.id]
            });
          }
        }
      }
    }
  });
};

export const createChildLocationLabel = (
  map: Map,
  featureSet: Feature<Point, Properties>[],
  identifier: string,
  reporting?: boolean
) => {
  if (map.getSource(identifier + '-label') === undefined) {
    map.addSource(identifier + '-label', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: featureSet
      },
      tolerance: 1.5
    });
  }
};

export const loadChildren = (map: Map, id: string, planId: string, opacity: number) => {
  const loadingToast = toast.loading('Loading locations...', {
    autoClose: false
  });
  disableMapInteractions(map, true);
  getChildLocation(id, planId)
    .then(res => {
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
        createChild(map, featureSet, opacity);
      } else {
        toast.info('This location has no child locations.');
      }
    })
    .catch(err => {
      disableMapInteractions(map, false);
      toast.error(err);
    })
    .finally(() => {
      toast.dismiss(loadingToast.toString());
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
        'text-field':
          data.properties.name +
          (data.properties.geographicLevel === 'structure' ? '' : ' (' + data.properties.childrenNumber + ')'),
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
  return map.queryRenderedFeatures().some(el => {
    return (el.properties as any).name === propertyName;
  });
};

// disable map interaction so users can't pan, zoom, etc
export const disableMapInteractions = (map: Map, disable: boolean) => {
  if (disable) {
    map.boxZoom.disable();
    map.scrollZoom.disable();
    map.dragPan.disable();
    map.dragRotate.disable();
    map.keyboard.disable();
    map.touchZoomRotate.disable();
  } else {
    map.boxZoom.enable();
    map.scrollZoom.enable();
    map.dragPan.enable();
    map.dragRotate.enable();
    map.keyboard.enable();
    map.touchZoomRotate.enable();
  }
};

export const createParentLayers = (
  mapInstance: Map,
  mapData: PlanningParentLocationResponse,
  parentSource: string,
  parentLayer: string
) => {
  mapInstance.addSource(parentSource, {
    type: 'geojson',
    data: mapData,
    tolerance: 1.5
  });

  mapInstance.addLayer(
    {
      id: parentLayer,
      type: 'line',
      source: parentSource,
      paint: {
        'line-color': ['get', 'levelColor'],
        'line-width': 4
      }
    },
    'label-layer'
  );
};

export const getTagStats = (mapData: PlanningLocationResponse) => {
  return mapData.features.reduce((map: any, obj) => {
    if (obj.properties) {
      if (obj.properties?.metadata) {
        let metadata = obj.properties?.metadata;
        map.max = map.max ?? {};
        map.min = map.min ?? {};
        map.avg = map.avg ?? {};
        map.sum = map.sum ?? {};
        map.cnt = map.cnt ?? {};

        metadata.forEach((element: any) => {
          if (element.type) {
            if (map.max[element.type]) {
              map.max[element.type] = map.max[element.type] < element.value ? element.value : map.max[element.type];
            } else {
              map.max[element.type] = element.value;
            }

            if (map.min[element.type]) {
              map.min[element.type] = map.min[element.type] > element.value ? element.value : map.min[element.type];
            } else {
              map.min[element.type] = element.value;
            }

            if (map.sum[element.type]) {
              map.sum[element.type] = map.sum[element.type] + element.value;
            } else {
              map.sum[element.type] = element.value;
            }

            if (map.cnt[element.type]) {
              map.cnt[element.type] = map.cnt[element.type] + 1;
            } else {
              map.cnt[element.type] = 1;
            }
          }
        });
      }
    }

    return map;
  }, {});
};

export const getTagStatsByTag = (mapData: PlanningLocationResponse, tag: string) => {
  return mapData.features.reduce((map: any, obj) => {
    if (obj.properties) {
      if (obj.properties?.metadata) {
        let metadata = obj.properties?.metadata;
        map.max = map.max ?? {};
        map.min = map.min ?? {};
        map.avg = map.avg ?? {};
        map.sum = map.sum ?? {};
        map.cnt = map.cnt ?? {};
        metadata
          .filter((element: any) => element.type === tag)
          .forEach((element: any) => {
            if (element.type) {
              if (map.sum[element.type]) {
                map.sum[element.type] = map.sum[element.type] + element.value;
              } else {
                map.sum[element.type] = element.value;
              }
            }
          });
      }
    }

    return map;
  }, {});
};

export const createHeatMapLayer = (
  mapInstance: Map,
  featureCentres: Feature<Point, Properties>[],
  sourceLabel: string,
  layerLabel: string
) => {
  mapInstance.addSource(sourceLabel, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: featureCentres
    },
    tolerance: 0.75
  });

  mapInstance.addLayer(
    {
      id: layerLabel,
      type: 'heatmap',
      source: sourceLabel,
      paint: {
        'heatmap-radius': ['*', ['get', 'selectedTagValuePercent'], 50],
        'heatmap-weight': ['*', ['get', 'selectedTagValuePercent'], 30],
        'heatmap-opacity': 0.2
      }
    },
    'label-layer'
  );
};

export const createSearchResultLabelLayer = (mapInstance: Map, info: any, sourceLabel: string, layerLabel: string) => {
  mapInstance.addSource(sourceLabel, {
    type: 'geojson',
    data: info,
    tolerance: 0.75
  });

  mapInstance.addLayer(
    {
      id: layerLabel,
      type: 'symbol',
      source: sourceLabel,
      layout: {
        'text-field': [
          'format',
          ['get', 'name'],
          {
            'font-scale': 0.8,
            'text-font': ['literal', ['Open Sans Bold', 'Open Sans Semibold']]
          }
        ],
        'text-anchor': 'bottom',
        'text-justify': 'center'
      },
      paint: {
        'text-color': 'grey'
      }
    },
    'label-layer'
  );
};

export const createSearchResultLineLayer = (mapInstance: Map, info: any, sourceLabel: string, layerLabel: string) => {
  mapInstance.addSource(sourceLabel, {
    type: 'geojson',
    data: info,
    tolerance: 0.75
  });

  mapInstance.addLayer(
    {
      id: layerLabel,
      type: 'line',
      source: sourceLabel,
      paint: {
        'line-color': 'black',
        'line-width': 4
      }
    },
    'label-layer'
  );
};

export const createSearchResultFillLayer = (
  mapInstance: Map,
  sourceLabel: string,
  layerLabel: string,
  color: string
) => {
  mapInstance.addLayer(
    {
      id: layerLabel,
      type: 'fill',
      source: sourceLabel,
      paint: {
        'fill-color': color,
        'fill-opacity': 0.2
      }
    },
    'label-layer'
  );
};

export const createSearchResultFillLayerWeightedOnTagValue = (
  mapInstance: Map,
  sourceLabel: string,
  layerLabel: string,
  color: string
) => {
  mapInstance.addLayer(
    {
      id: layerLabel,
      type: 'fill',
      source: sourceLabel,
      paint: {
        'fill-color': [
          'case',
          ['<', ['get', 'selectedTagValue'], 0],
          'brown',
          ['case', ['==', ['get', 'selectedTagValue'], 0], 'blue', color]
        ],
        'fill-opacity': ['case', ['==', ['get', 'selectedTagValuePercent'], 0], 0.1, ['get', 'selectedTagValuePercent']]
      }
    },
    'label-layer'
  );
};

export const getGeoListFromMapData = (mapData: PlanningLocationResponse) => {
  let arr = new Set<string>();
  let arr3: any = {};

  if (mapData) {
    mapData.features
      // .map(key => mapData.features[key])
      .flatMap(feature => feature.properties)
      .map(property => {
        return {
          geographicLevel: property.geographicLevel,
          nodeNumber: property.geographicLevelNodeNumber
        };
      })
      .forEach(prop => {
        if (prop.geographicLevel) {
          arr3[prop.geographicLevel] = prop.nodeNumber;
        }
      });

    if (arr3) {
      Object.keys(arr3)
        .sort((keya, keyb) => {
          return arr3[keyb] - arr3[keya];
        })
        .forEach(prop => {
          arr.add(prop);
        });
    }
  }

  return arr;
};

export const getMetadataListFromMapData = (mapData: PlanningLocationResponseTagged | undefined) => {
  let arr = new Set<string>();
  if (mapData) {
    Object.keys(mapData?.features)
      .map(key => mapData?.features[key])
      .flatMap(feature => feature.properties)
      .flatMap(property => property.metadata)
      .forEach(metadata => arr.add(metadata?.type));
  }
  return arr;
};
