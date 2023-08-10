import { EventData, Expression, GeoJSONSource, LngLatBounds, Map, MapLayerEventType, Popup } from 'mapbox-gl';

import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { MAPBOX_STYLE_STREETS } from '../../../../constants';
import {
  disableMapInteractions,
  fitCollectionToBounds,
  getFeatureCentresFromLocation,
  getGeoListFromMapData,
  getMetadataListFromMapData,
  getTagStats,
  initSimulationMap,
  PARENT_LABEL_SOURCE,
  PARENT_SOURCE
} from '../../../../utils';
import {
  EntityTag,
  PlanningLocationResponse,
  PlanningLocationResponseTagged,
  PlanningParentLocationResponse,
  RevealFeature
} from '../../providers/types';
import { Feature, FeatureCollection, MultiPolygon, Point, pointsWithinPolygon, Polygon } from '@turf/turf';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Children, Stats } from '../Simulation';
import ActionDialog from '../../../../components/Dialogs/ActionDialog';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

interface Props {
  fullScreenHandler: () => void;
  fullScreen: boolean;
  mapData: PlanningLocationResponseTagged | undefined;
  toLocation: LngLatBounds | undefined;
  openModalHandler: (id: string) => void;
  entityTags: EntityTag[];
  parentMapData: PlanningParentLocationResponse | undefined;
  setMapDataLoad: (data: PlanningLocationResponse) => void;
  chunkedData: PlanningLocationResponse;
  updateLevelsLoaded: (levels: string[]) => void;
  resetMap: boolean;
  setResetMap: (resetMap: boolean) => void;
  resultsLoadingState: 'notstarted' | 'error' | 'started' | 'complete';
  parentsLoadingState: 'notstarted' | 'error' | 'started' | 'complete';
  stats: Stats;
  map: MutableRefObject<Map | undefined>;
  setMapData: (data: PlanningLocationResponseTagged | undefined) => void;
  updateMarkedLocations: (identifier: string, ancestry: string[], marked: boolean) => void;
  parentChild: { [parent: string]: Children };
}

interface PlanningLocationResponseGeoContainer {
  key: string;
  data: PlanningLocationResponse;
}

const lineParameters: any = {
  country: { col: 'red', num: 1, offset: 2.2 },
  county: { col: 'blue', num: 1, offset: 2 },
  subcounty: { col: 'darkblue', num: 1, offset: 1.8 },
  ward: { col: 'yellow', num: 1, offset: 1.5 },
  catchment: { col: 'purple', num: 1, offset: 1 }
};

const SimulationMapView = ({
  fullScreenHandler,
  fullScreen,
  mapData,
  toLocation,
  openModalHandler,
  entityTags,
  parentMapData,
  setMapData,
  chunkedData,
  updateLevelsLoaded,
  resetMap,
  setResetMap,
  resultsLoadingState,
  parentsLoadingState,
  stats,
  map,
  updateMarkedLocations,
  parentChild
}: Props) => {
  const INITIAL_HEAT_MAP_RADIUS = 50;
  const INITIAL_HEAT_MAP_OPACITY = 0.2;
  const INITIAL_FILL_COLOR = '#005512';

  const mapContainer = useRef<any>();

  const [lng, setLng] = useState(28.33);
  const [lat, setLat] = useState(-15.44);
  const [zoom, setZoom] = useState(10);
  const [metadataList, setMetadataList] = useState<Set<string>>();
  const [selectedMetadata, setSelectedMetadata] = useState<string>();
  const [selectedHeatMapMetadata, setSelectedHeatMapMetadata] = useState<string>();
  const hoverPopup = useRef<Popup>(
    new Popup({
      closeOnClick: false,
      closeButton: false,
      offset: 20
    })
  );
  const [showMapControls, setShowMapControls] = useState<boolean>(true);
  const [showMetaStyle, setShowMetaStyle] = useState<Boolean>(false);
  const [showGeoLevelStyle, setShowGeoLevelStyle] = useState<Boolean>(false);
  const [showHeatMapStyle, setShowHeatMapStyle] = useState<Boolean>(false);
  const [parentMapStateData, setParentMapStateData] = useState<PlanningParentLocationResponse>();
  const [color, setColor] = useColor('hex', INITIAL_FILL_COLOR);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showHeatMapToggles, setShowHeatMapToggles] = useState(false);
  const [geographicLevelResultLayerIds, setGeographicLevelResultLayerIds] = useState<
    { layer: string; active: boolean }[]
  >([]);
  const geographicLevelMapStateData = useRef<PlanningLocationResponseGeoContainer[]>([]);
  const geographicLevelMapStateDataIds = useRef<Set<string>>(new Set());

  const [showLayerSelector, setShowLayerSelector] = useState(false);

  const [heatMapRadius, setHeatmapRadius] = useState(INITIAL_HEAT_MAP_RADIUS);
  const [heatMapOpacity, setHeatMapOpacity] = useState(INITIAL_HEAT_MAP_OPACITY);
  const [showMapDrawnModal, setShowMapDrawnModal] = useState(false);
  const [mapDrawMouseOverEvent, setMapDrawMouseOverEvent] = useState<MapLayerEventType['mouseover'] & EventData>();
  const mapBoxDraw = useRef<MapboxDraw>();
  const [drawnMapLevel, setDrawnMapLevel] = useState<string>();
  const [shouldApplyToChildren, setShouldApplyToChildren] = useState(true);

  const getLineParameters = (level: string) => {
    if (lineParameters[level]) {
      return lineParameters[level];
    } else {
      return { col: 'black', num: 1, offset: 1 };
    }
  };

  useEffect(() => {
    if (map.current) return;
    initializeMap();
  });

  useEffect(() => {
    if (map.current) {
      if (
        (resultsLoadingState === 'notstarted' ||
          resultsLoadingState === 'complete' ||
          resultsLoadingState === 'error') &&
        (parentsLoadingState === 'notstarted' || parentsLoadingState === 'complete' || parentsLoadingState === 'error')
      ) {
        disableMapInteractions(map.current, false);
      } else {
        disableMapInteractions(map.current, true);
      }
    }
  }, [resultsLoadingState, parentsLoadingState, map]);

  useEffect(() => {
    console.log('parentChild', parentChild);
  }, [parentChild]);

  const updateChildrenOfSelectedLocation = useCallback(
    (identifier: string) => {
      let children: Children = parentChild[identifier];
      if (children && children.childrenList) {
        let sourceCentres: any = map.current?.getSource(children.level + '-centers');

        if (sourceCentres && sourceCentres._data) {
          let sourceData: FeatureCollection<Point> = {
            type: (sourceCentres._data as any)['type'],
            features: (sourceCentres._data as any)['features']
          };

          sourceData.features.forEach(feature => {
            if (
              feature.properties &&
              feature.properties.identifier &&
              children.childrenList.includes(feature.properties.identifier)
            ) {
              feature.properties['mark'] = true;
              if (feature.properties.identifier) {
                updateMarkedLocations(feature.properties.identifier, feature.properties.ancestry, true);
                updateChildrenOfSelectedLocation(feature.properties.identifier);
              }
            }
          });
          if (map.current?.getSource(children.level + '-centers')) {
            (map.current?.getSource(children.level + '-centers') as GeoJSONSource).setData(sourceData);
          }
        } else {
          children.childrenList.forEach(child => updateChildrenOfSelectedLocation(child));
        }
      }
    },
    [map, parentChild, updateMarkedLocations]
  );

  const updateSelectedLocations = (e: (MapLayerEventType['mouseover'] & EventData) | undefined) => {
    if (e) {
      let sourceCentres: any = map.current?.getSource(drawnMapLevel + '-centers');

      if (sourceCentres && sourceCentres._data) {
        let sourceData: FeatureCollection<Point> = {
          type: (sourceCentres._data as any)['type'],
          features: (sourceCentres._data as any)['features']
        };

        e.features?.forEach((feature: any) => {
          if (feature != null && feature['properties'] && feature['properties']['id']) {
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

            sourceData.features.forEach(feature => {
              if (feature.properties && feature.properties.identifier) {
                if (a.includes(feature.properties.identifier)) {
                  feature.properties['mark'] = true;
                  if (feature.properties.identifier) {
                    updateMarkedLocations(feature.properties.identifier, feature.properties.ancestry, true);
                    if (shouldApplyToChildren) {
                      updateChildrenOfSelectedLocation(feature.properties.identifier);
                    }
                  }
                }
              }
            });

            if (map.current?.getSource(drawnMapLevel + '-centers')) {
              (map.current?.getSource(drawnMapLevel + '-centers') as GeoJSONSource).setData(sourceData);
            }
          }
        });
      }
      if (mapBoxDraw.current) {
        mapBoxDraw.current?.deleteAll();
      }
    }
  };

  const initializeMap = useCallback(() => {
    map.current = initSimulationMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS, e => {
      if (map.current) {
        const features = map.current.queryRenderedFeatures(e.point);
        let filteredfeatures = features.filter(feature => feature.layer.id.endsWith('-fill'));

        let filteredfeature = filteredfeatures[0];

        if (filteredfeature) {
          let sourceCentres: any = map.current.getSource(filteredfeature.layer.id.split('-')[0].concat('-centers'));

          let sourceData: PlanningLocationResponse = {
            type: (sourceCentres._data as any)['type'],
            features: (sourceCentres._data as any)['features'],
            parents: (sourceCentres._data as any)['parents'],
            identifier: undefined
          };

          let featureSource = sourceData.features.filter(
            feat => feat.properties?.identifier === filteredfeature?.properties?.identifier
          );

          let feature = featureSource[0];
          if (feature) {
            let labelMarked = false;
            if (feature.properties) {
              if (feature.properties['mark']) {
                labelMarked = true;
              }
            }

            let popup = new Popup({ focusAfterOpen: true, closeOnMove: true, closeButton: true })
              .setHTML(
                `<h4 class="bg-success text-center">Location Action</h4>
              <div class="m-0 p-0 text-center">
              <ul>
              <li>
              <button class="btn btn-primary mx-2 mt-2 mb-4" style="min-width: 200px" id="simulationpopup" >` +
                  (labelMarked ? `De-Select` : `Select`) +
                  `</button>
              </li>
              <li>      
                <span>Should Selection apply to children locations?</span>       
                <input type="checkbox" id="updateChildrenWithSelected" checked />
                </li>
                </ul>
              
              <script>        
              </script>
              </div>`
              )
              .setLngLat(e.lngLat)
              .addTo(map.current);

            document.getElementById('simulationpopup')?.addEventListener('click', () => {
              if (feature !== null) {
                if (map.current) {
                  sourceData.features
                    .filter(feat => feat.properties?.identifier === filteredfeature?.properties?.identifier)
                    .forEach(feat => {
                      if (feat.properties) {
                        feat.properties['mark'] = !labelMarked;
                        if (feat.properties.identifier) {
                          updateMarkedLocations(feat.properties.identifier, feat.properties.ancestry, !labelMarked);
                          if (
                            document.getElementById('updateChildrenWithSelected') &&
                            (document.getElementById('updateChildrenWithSelected') as HTMLInputElement).checked
                          ) {
                            updateChildrenOfSelectedLocation(feat.properties.identifier);
                          }
                        }
                      }
                    });

                  (
                    map.current?.getSource(filteredfeature.layer.id.split('-')[0].concat('-centers')) as GeoJSONSource
                  ).setData(sourceData);
                }
              }

              popup.remove();
            });
          }
        }
      }
    });

    mapBoxDraw.current = new MapboxDraw({
      controls: {
        trash: true,
        polygon: true,
        point: false,
        uncombine_features: false,
        combine_features: false,
        line_string: false
      }
    });

    map.current.addControl(mapBoxDraw.current, 'bottom-left');

    map.current?.on('mouseover', 'gl-draw-polygon-fill-inactive.hot', e => {
      setShowMapDrawnModal(true);
      // updateSelectedLocations(e);
      setMapDrawMouseOverEvent(e);

      // if (e && e.features) {
      //   pointsWithinPolygon(e.features, sourceData);
      // }
    });
  }, [lat, lng, map, updateChildrenOfSelectedLocation, zoom, updateMarkedLocations]);

  useEffect(() => {
    if (resetMap) {
      initializeMap();
      setResetMap(false);
      setGeographicLevelResultLayerIds([]);
      geographicLevelMapStateData.current = [];
      geographicLevelMapStateDataIds.current = new Set();
    }
  }, [resetMap, initializeMap, setResetMap]);

  useEffect(() => {
    if (toLocation && map && map.current) map.current?.fitBounds(toLocation);
  }, [toLocation, map]);

  useEffect(() => {
    if (chunkedData) {
      if (chunkedData?.features.length > 0) {
        let geoListArr = getGeoListFromMapData(chunkedData);

        geoListArr.forEach(geo => {
          setGeographicLevelResultLayerIds(geoLayerList => {
            if (!geoLayerList.map(geoLayer => geoLayer.layer).includes(geo)) {
              geoLayerList.push({ layer: geo, active: true });

              let initData: PlanningLocationResponse = {
                parents: [],
                features: [],
                type: 'FeatureCollection',
                identifier: undefined
              };

              if (!map.current?.getSource(geo)) {
                map.current?.addSource(geo, {
                  type: 'geojson',
                  data: initData,
                  tolerance: 0.75
                });
              }

              if (!map.current?.getSource(geo.concat('-points'))) {
                map.current?.addSource(geo.concat('-points'), {
                  type: 'geojson',
                  data: initData,
                  tolerance: 0.75
                });
              }

              if (!map.current?.getSource(geo.concat('-centers'))) {
                map.current?.addSource(geo.concat('-centers'), {
                  type: 'geojson',
                  data: initData,
                  tolerance: 0.75
                });
              }

              if (!map.current?.getLayer(geo.concat('-line'))) {
                map.current?.addLayer(
                  {
                    id: geo.concat('-line'),
                    type: 'line',
                    source: geo,
                    paint: {
                      'line-color': getLineParameters(geo).col,
                      'line-width': getLineParameters(geo).num,
                      'line-offset': getLineParameters(geo).offset
                    }
                  },
                  'label-layer'
                );
              }

              if (!map.current?.getLayer(geo.concat('-points'))) {
                map.current?.addLayer(
                  {
                    id: geo.concat('-points'),
                    type: 'circle',
                    source: geo,
                    filter: ['==', ['geometry-type'], 'Point'],
                    paint: {
                      'circle-color': [
                        'case',
                        ['==', ['get', 'selectedTagValue'], null],
                        'red',
                        ['<', ['get', 'selectedTagValue'], 0],
                        'brown',
                        ['==', ['get', 'selectedTagValue'], 0],
                        'blue',
                        INITIAL_FILL_COLOR
                      ],
                      'circle-opacity': [
                        'case',
                        ['==', ['get', 'selectedTagValuePercent'], null],
                        0.1,
                        ['==', ['get', 'selectedTagValuePercent'], 0],
                        0.1,
                        ['get', 'selectedTagValuePercent']
                      ],
                      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 1, 18, 15],
                      'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 18, 1],
                      'circle-stroke-color': 'black',
                      'circle-stroke-width': 1
                    }
                  },
                  'label-layer'
                );
              }

              if (!map.current?.getLayer(geo.concat('-fill'))) {
                map.current?.addLayer(
                  {
                    id: geo.concat('-fill'),
                    type: 'fill',
                    source: geo,
                    filter: ['!=', ['geometry-type'], 'Point'],
                    paint: {
                      'fill-color': [
                        'case',
                        ['==', ['get', 'selectedTagValue'], null],
                        'red',
                        ['<', ['get', 'selectedTagValue'], 0],
                        'brown',
                        ['==', ['get', 'selectedTagValue'], 0],
                        'blue',
                        INITIAL_FILL_COLOR
                      ],
                      'fill-opacity': [
                        'case',
                        ['==', ['get', 'selectedTagValuePercent'], null],
                        0.1,
                        ['==', ['get', 'selectedTagValuePercent'], 0],
                        0.1,
                        ['get', 'selectedTagValuePercent']
                      ]
                    }
                  },
                  geo.concat('-line')
                );
              }

              if (!map.current?.getLayer(geo.concat('-symbol'))) {
                map.current?.addLayer(
                  {
                    id: geo.concat('-symbol'),
                    type: 'symbol',
                    source: geo.concat('-centers'),
                    layout: {
                      'text-field': [
                        'format',
                        ['get', 'name'],
                        {
                          'text-font': ['literal', ['Open Sans Bold', 'Open Sans Semibold']]
                        }
                      ],
                      'text-size': ['interpolate', ['linear'], ['zoom'], 10, 7, 18, 20],
                      'text-anchor': 'bottom',
                      'text-justify': 'center'
                    },
                    paint: {
                      'text-color': ['case', ['==', ['get', 'mark'], true], 'red', 'black'],
                      'text-opacity': [
                        'step',
                        ['zoom'],
                        ['case', ['==', ['get', 'geographicLevel'], 'structure'], 0.1, 1],
                        15,
                        ['case', ['==', ['get', 'geographicLevel'], 'structure'], 1, 1]
                      ]
                    }
                  },
                  geo.concat('-line')
                );
              }
              if (!map.current?.getLayer(geo.concat('-heatmap'))) {
                map.current?.addLayer(
                  {
                    id: geo.concat('-heatmap'),
                    type: 'heatmap',
                    source: geo.concat('-centers'),
                    paint: {
                      'heatmap-radius': [
                        'case',
                        ['==', ['get', 'selectedTagHeatMapValuePercent'], null],
                        0,
                        ['*', ['get', 'selectedTagHeatMapValuePercent'], INITIAL_HEAT_MAP_RADIUS]
                      ],
                      'heatmap-weight': [
                        'case',
                        ['==', ['get', 'selectedTagHeatMapValuePercent'], null],
                        0,
                        ['*', ['get', 'selectedTagHeatMapValuePercent'], 30]
                      ],
                      'heatmap-opacity': INITIAL_HEAT_MAP_OPACITY
                    }
                  },
                  geo.concat('-symbol')
                );
              }

              if (!map.current?.getLayer(geo.concat('-structure-heatmap'))) {
                map.current?.addLayer(
                  {
                    id: geo.concat('-structure-heatmap'),
                    type: 'heatmap',
                    source: geo.concat('-centers'),
                    paint: {
                      'heatmap-radius': ['case', ['==', ['get', 'geographicLevel'], 'structure'], 15, 0],
                      'heatmap-weight': ['case', ['==', ['get', 'geographicLevel'], 'structure'], 3, 0],
                      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.2, 16, 0],
                      'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0,
                        'rgba(0, 0, 255, 0)',
                        0.1,
                        'lightblue',
                        0.3,
                        'grey',
                        0.5,
                        'lime',
                        0.7,
                        'blue',
                        1,
                        'orange'
                      ]
                    }
                  },
                  geo.concat('-symbol')
                );
              }

              if (map.current) {
                map.current.on('mouseover', geo.concat('-symbol'), e => {
                  const features = map.current?.queryRenderedFeatures(e.point);
                  let filteredFeatures = features?.filter(feature => feature.layer.id === geo.concat('-symbol'));
                  const feature = filteredFeatures ? filteredFeatures[0] : undefined;
                  if (feature) {
                    const properties = feature.properties;
                    if (properties && (properties['selectedTagValue'] === 0 || properties['selectedTagValue'])) {
                      const selectedValue: any[] = JSON.parse(properties['selectedTagValue']);
                      let selectedTag = properties.selectedTag;
                      let selectedTagPercentageValue = properties.selectedTagValuePercent;
                      let htmlText = `<p class="text-success"><b>Location Name:</b> ${feature.properties?.name}
                                            <br> Tag: ${selectedTag} 
                                            <br> Value: ${selectedValue}
                                            <br> Percentage: ${selectedTagPercentageValue} 
                                      </p > `;
                      if (map.current) {
                        map.current.getCanvas().style.cursor = 'pointer';
                        hoverPopup.current.setLngLat(e.lngLat).setHTML(htmlText).addTo(map.current);
                      }
                    }
                  }
                });

                map.current.on('mouseleave', geo.concat('-symbol'), () => {
                  if (map.current) {
                    map.current.getCanvas().style.cursor = '';
                    hoverPopup.current.remove();
                  }
                });

                map.current.on('click', e => {
                  if (map.current) {
                    const features = map.current.queryRenderedFeatures(e.point);
                    if (features.length) {
                      //convert to location properties feature
                      const feature = features[0];
                      if (
                        feature &&
                        feature.properties &&
                        (feature.source === geo.concat('-centers') || feature.source === geo)
                      ) {
                        openModalHandler(feature.properties['identifier']);
                      }
                    }
                  }
                });
              }

              return geoLayerList;
            } else {
              return geoLayerList;
            }
          });

          updateLevelsLoaded(geographicLevelResultLayerIds.map(value => value.layer));

          let filter = chunkedData.features?.filter(feature => feature.properties?.geographicLevel === geo);

          let filteredData: PlanningLocationResponse = {
            features: filter,
            type: 'FeatureCollection',
            parents: [],
            identifier: undefined
          };

          if (filteredData.features.length > 0) {
            let planningLocationResponseGeoContainer = geographicLevelMapStateData.current.find(
              geoMapData => geoMapData.key === geo
            );

            if (planningLocationResponseGeoContainer) {
              let notAlreadyAdded = filteredData.features.filter(feature => {
                return !geographicLevelMapStateDataIds.current.has(feature.properties?.identifier);
              });
              planningLocationResponseGeoContainer.data.features =
                planningLocationResponseGeoContainer.data.features.concat(notAlreadyAdded);
              notAlreadyAdded.forEach(feature => {
                geographicLevelMapStateDataIds.current.add(feature.properties?.identifier);
              });
            } else {
              planningLocationResponseGeoContainer = { key: geo, data: filteredData };

              geographicLevelMapStateData.current.push(planningLocationResponseGeoContainer);
              planningLocationResponseGeoContainer.data.features.forEach(feature => {
                geographicLevelMapStateDataIds.current.add(feature.properties?.identifier);
              });
            }

            if (map.current?.getSource(geo)) {
              if (planningLocationResponseGeoContainer) {
                (map.current?.getSource(geo) as GeoJSONSource).setData(planningLocationResponseGeoContainer.data);

                if (map.current) {
                  fitCollectionToBounds(map.current, planningLocationResponseGeoContainer.data);
                }
              }
            }
            if (map.current?.getSource(geo.concat('-centers'))) {
              if (planningLocationResponseGeoContainer) {
                let centers = getFeatureCentresFromLocation(planningLocationResponseGeoContainer.data);

                let centreFeatureCollection: PlanningLocationResponse = {
                  identifier: undefined,
                  features: centers,
                  type: 'FeatureCollection',
                  parents: []
                };
                (map.current?.getSource(geo.concat('-centers')) as GeoJSONSource).setData(centreFeatureCollection);
              }
            }
          }
        });
      }
    }
  }, [
    selectedMetadata,
    selectedHeatMapMetadata,
    chunkedData,
    openModalHandler,
    updateLevelsLoaded,
    geographicLevelResultLayerIds,
    map
  ]);

  useEffect(() => {
    setMetadataList(getMetadataListFromMapData(mapData));
  }, [mapData]);

  useEffect(() => {
    geographicLevelResultLayerIds.forEach(geoObj => {
      if (map.current) {
        let geo = geoObj.layer;

        let sourceCentres: any = map.current.getSource(geo.concat('-centers'));

        let sourceData: PlanningLocationResponse = {
          type: (sourceCentres._data as any)['type'],
          features: (sourceCentres._data as any)['features'],
          parents: (sourceCentres._data as any)['parents'],
          identifier: undefined
        };

        let tagStats: any;
        tagStats = getTagStats(sourceData);
        sourceData.features.forEach(feature => {
          feature = updateFeaturesWithTagStats(
            feature,
            tagStats,
            selectedMetadata,
            'selectedTagValuePercent',
            'selectedTagValue',
            'selectedTag'
          );
          updateFeaturesWithTagStats(
            feature,
            tagStats,
            selectedHeatMapMetadata,
            'selectedTagHeatMapValuePercent',
            'selectedTagHeatMapValue',
            'selectedHeatMapTag'
          );
        });

        if (map.current?.getSource(geo.concat('-centers'))) {
          (map.current?.getSource(geo.concat('-centers')) as GeoJSONSource).setData(sourceData);
        }

        let source: any = map.current.getSource(geo);

        let fillSourceData: PlanningLocationResponse = {
          type: (source._data as any)['type'],
          features: (source._data as any)['features'],
          parents: (source._data as any)['parents'],
          identifier: undefined
        };
        fillSourceData.features.forEach(feature => {
          feature = updateFeaturesWithTagStats(
            feature,
            tagStats,
            selectedMetadata,
            'selectedTagValuePercent',
            'selectedTagValue',
            'selectedTag'
          );
          updateFeaturesWithTagStats(
            feature,
            tagStats,
            selectedHeatMapMetadata,
            'selectedTagHeatMapValuePercent',
            'selectedTagHeatMapValue',
            'selectedHeatMapTag'
          );
        });

        if (map.current?.getSource(geo)) {
          (map.current?.getSource(geo) as GeoJSONSource).setData(fillSourceData);
        }
      }
    });
  }, [selectedHeatMapMetadata, selectedMetadata, geographicLevelResultLayerIds, map]);

  useEffect(() => {
    if (map !== undefined && map.current !== undefined) {
      map.current.on('move', () => {
        if (map !== undefined && map.current !== undefined) {
          setLng(Number(map.current.getCenter().lng.toPrecision(4)));
          setLat(Number(map.current.getCenter().lat.toPrecision(4)));
          setZoom(Number(map.current.getZoom().toPrecision(3)));
        }
      });
    }
  });

  useEffect(() => {
    geographicLevelResultLayerIds.forEach(geographicLevelResultLayerId => {
      if (map.current?.getSource(geographicLevelResultLayerId.layer)) {
        if (map.current?.getLayer(geographicLevelResultLayerId.layer.concat('-fill'))) {
          if (map.current?.getPaintProperty(geographicLevelResultLayerId.layer.concat('-fill'), 'fill-color')) {
            let expression: Expression = map.current?.getPaintProperty(
              geographicLevelResultLayerId.layer.concat('-fill'),
              'fill-color'
            );
            expression[7] = color.hex;
            map.current?.setPaintProperty(geographicLevelResultLayerId.layer.concat('-fill'), 'fill-color', expression);
          }
        }
        if (map.current?.getLayer(geographicLevelResultLayerId.layer.concat('-points'))) {
          if (map.current?.getPaintProperty(geographicLevelResultLayerId.layer.concat('-points'), 'circle-color')) {
            let expression: Expression = map.current?.getPaintProperty(
              geographicLevelResultLayerId.layer.concat('-points'),
              'circle-color'
            );
            expression[7] = color.hex;
            map.current?.setPaintProperty(
              geographicLevelResultLayerId.layer.concat('-points'),
              'circle-color',
              expression
            );
          }
        }
      }
    });
  }, [color, geographicLevelResultLayerIds, map]);

  const showLayer = useCallback(
    (show: any, layer: string) => {
      if (map.current?.getLayer(layer.concat('-fill'))) {
        map.current?.setLayoutProperty(layer.concat('-fill'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-line'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-symbol'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-points'), 'visibility', show ? 'visible' : 'none');
      }
    },
    [map]
  );

  useEffect(() => {
    geographicLevelResultLayerIds.forEach(geographicLevelResultLayerId => {
      showLayer(geographicLevelResultLayerId.active, geographicLevelResultLayerId.layer);
    });
  }, [geographicLevelResultLayerIds, showLayer]);

  const addParentMapData = useCallback(
    (filteredData: PlanningParentLocationResponse) => {
      if (map.current) {
        if (map.current?.getSource(PARENT_SOURCE)) {
          if (map.current?.getSource(PARENT_SOURCE).type === 'geojson') {
            (map.current?.getSource(PARENT_SOURCE) as GeoJSONSource).setData(filteredData);
          }
        }
        if (map.current?.getSource(PARENT_LABEL_SOURCE)) {
          if (map.current?.getSource(PARENT_LABEL_SOURCE).type === 'geojson') {
            let centers = getFeatureCentresFromLocation(filteredData);

            let centreFeatureCollection: PlanningLocationResponse = {
              identifier: undefined,
              features: centers,
              type: 'FeatureCollection',
              parents: []
            };
            (map.current?.getSource(PARENT_LABEL_SOURCE) as GeoJSONSource).setData(centreFeatureCollection);
          }
        }
      }
    },
    [map]
  );

  useEffect(() => {
    setParentMapStateData(parentMapData);
  }, [parentMapData]);

  useEffect(() => {
    if (parentMapStateData && parentMapStateData.features.length > 0) {
      addParentMapData(parentMapStateData);
    }
  }, [parentMapStateData, addParentMapData]);

  const updateFeaturesWithTagStats = (
    feature: RevealFeature | Feature<Point | MultiPolygon | Polygon>,
    tagStats: any,
    tag: string | undefined,
    percentageField: string,
    valueField: string,
    tagField: string
  ) => {
    if (feature) {
      feature.properties?.metadata?.forEach((element: any) => {
        if (feature?.properties) {
          if (tag) {
            if (element.type === tag && tagStats.max && tagStats.max[tag]) {
              feature.properties[valueField] = element.value;
              feature.properties[tagField] = element.type;
              let percentage;
              if (element.value < 0) {
                percentage = (-1 * element.value) / (-1 * tagStats.min[tag]);
              } else {
                percentage = element.value / tagStats.max[tag];
              }
              feature.properties[percentageField] = percentage * 0.8;

              feature.properties.selectedTagValueMin = tagStats.min[tag];
              feature.properties.selectedTagValueMax = tagStats.max[tag];
            }
          } else {
            delete feature.properties[valueField];
            delete feature.properties[tagField];
            delete feature.properties[percentageField];
            delete feature.properties.selectedTagValueMin;
            delete feature.properties.selectedTagValueMax;
          }
        }
      });
      if (
        !feature.properties?.metadata?.some((element: any) => {
          if (feature?.properties) {
            return element.type === tag;
          }
          return false;
        })
      ) {
        if (feature?.properties) {
          delete feature.properties[valueField];
          delete feature.properties[tagField];
          delete feature.properties[percentageField];
          delete feature.properties.selectedTagValueMin;
          delete feature.properties.selectedTagValueMax;
        }
      }
    }
    return feature;
  };

  useEffect(() => {
    if (geographicLevelResultLayerIds && geographicLevelResultLayerIds.length > 0) {
      setDrawnMapLevel(geographicLevelResultLayerIds[0].layer);
    }
  }, [geographicLevelResultLayerIds]);

  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">
      <div style={{ position: 'absolute', zIndex: 2, width: '100%' }} className="mx-0 px-0">
        <div style={{ float: 'left', position: 'relative' }} className="sidebar-adjust ">
          <div>
            <Button
              style={{ width: '75px' }}
              onClick={() => {
                setShowMapControls(!showMapControls);
              }}
              className="rounded"
              size="sm"
              variant="primary"
            >
              {showMapControls ? 'Hide' : 'Show'}{' '}
            </Button>
          </div>
          {showMapControls && (
            <>
              {geographicLevelResultLayerIds.length > 0 && (
                <div style={{ paddingTop: '1em' }}>
                  <Button
                    style={{ width: '75px', fontSize: 'smaller' }}
                    onClick={() => setShowGeoLevelStyle(!showGeoLevelStyle)}
                    className="rounded"
                    size="sm"
                    variant="success"
                  >
                    {(showGeoLevelStyle ? 'Hide' : '') + ' Level'}{' '}
                  </Button>
                </div>
              )}

              {metadataList && (
                <div style={{ paddingTop: '1em' }}>
                  <Button
                    style={{ width: '75px', fontSize: 'smaller' }}
                    onClick={() => setShowMetaStyle(!showMetaStyle)}
                    className="rounded"
                    size="sm"
                    variant="success"
                  >
                    {(showMetaStyle ? 'Hide' : '') + ' Meta'}{' '}
                  </Button>
                </div>
              )}
              {metadataList && (
                <div style={{ paddingTop: '1em' }}>
                  <Button
                    style={{ width: '75px', fontSize: 'smaller' }}
                    onClick={() => setShowHeatMapStyle(!showHeatMapStyle)}
                    className="rounded"
                    size="sm"
                    variant="success"
                  >
                    {(showHeatMapStyle ? 'Hide' : '') + ' Heatmap'}{' '}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {showMapControls && (
          <div>
            {showGeoLevelStyle && geographicLevelResultLayerIds.length > 0 && (
              <div style={{ float: 'left' }} className="sidebar-adjust-list text-dark bg-light p-2 rounded">
                <p
                  className="lead mb-1"
                  onClick={() => {
                    setShowLayerSelector(!showLayerSelector);
                  }}
                >
                  Geographic Levels{' '}
                  {showLayerSelector ? (
                    <FontAwesomeIcon className="ms-2" icon="sort-up" />
                  ) : (
                    <FontAwesomeIcon className="ms-2" icon="sort-down" />
                  )}
                </p>

                {showLayerSelector && (
                  <div>
                    {geographicLevelResultLayerIds.map(layer => {
                      return (
                        <Form.Check
                          key={layer.layer}
                          label={layer.layer}
                          value={layer.layer}
                          type="checkbox"
                          checked={layer.active}
                          onChange={e =>
                            setGeographicLevelResultLayerIds(layerItems => {
                              let newItems: { layer: string; active: boolean }[] = [];
                              layerItems.forEach(newItem => {
                                newItems.push(newItem);
                              });
                              let item = newItems.find(layerItem => layerItem.layer === layer.layer);
                              if (item) {
                                item.active = e.target.checked;
                              }
                              return newItems;
                            })
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {showMetaStyle && metadataList && (
              <div style={{ float: 'left' }} className="sidebar-adjust-list text-dark bg-light p-2 rounded">
                <p
                  className="lead mb-1"
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                  }}
                >
                  Metadata
                </p>

                <div>
                  <Form.Select
                    style={{ display: 'inline-block' }}
                    onChange={e => setSelectedMetadata(e.target.value)}
                    value={selectedMetadata}
                  >
                    <option value={''}>Select Metadata Tag...</option>
                    {metadataList &&
                      Array.from(metadataList).map(metaDataItem => {
                        return (
                          <option key={metaDataItem} value={metaDataItem}>
                            {metaDataItem}
                          </option>
                        );
                      })}
                  </Form.Select>
                  {showColorPicker && (
                    <div>
                      <ColorPicker
                        width={fullScreen ? 287 : 190}
                        color={color}
                        onChange={setColor}
                        hideHEX={true}
                        hideHSV={true}
                        hideRGB={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* enable when needed by setting false to true */}
            {showHeatMapStyle && metadataList && true && (
              <div style={{ float: 'left' }} className="sidebar-adjust-list text-dark bg-light p-2 rounded">
                <p className="lead mb-1" onClick={() => setShowHeatMapToggles(!showHeatMapToggles)}>
                  HeatMap
                </p>

                <div>
                  <Form.Select
                    style={{ display: 'inline-block' }}
                    onChange={e => setSelectedHeatMapMetadata(e.target.value)}
                    value={selectedHeatMapMetadata}
                  >
                    <option value={''}>Select Metadata Tag...</option>
                    {metadataList &&
                      Array.from(metadataList).map(metaDataItem => {
                        return (
                          <option key={metaDataItem} value={metaDataItem}>
                            {metaDataItem}
                          </option>
                        );
                      })}
                  </Form.Select>
                  {showHeatMapToggles && (
                    <>
                      <b>Opacity</b>
                      <Form.Range
                        min={0}
                        max={100}
                        value={heatMapOpacity * 100}
                        onChange={e => {
                          geographicLevelResultLayerIds.forEach(layer => {
                            if (map.current?.getLayer(layer.layer.concat('-heatmap'))) {
                              if (
                                map.current?.getPaintProperty(layer.layer.concat('-heatmap'), 'heatmap-opacity') !==
                                null
                              ) {
                                setHeatMapOpacity(Number(e.target.value) / 100);
                                map.current?.setPaintProperty(
                                  layer.layer.concat('-heatmap'),
                                  'heatmap-opacity',
                                  Number(e.target.value) / 100
                                );
                              }
                            }
                          });
                        }}
                      />
                      <b>Radius</b>
                      <Form.Range
                        min={0}
                        value={heatMapRadius}
                        max={100}
                        onChange={e => {
                          geographicLevelResultLayerIds.forEach(layer => {
                            if (map.current?.getLayer(layer.layer.concat('-heatmap'))) {
                              if (map.current?.getPaintProperty(layer.layer.concat('-heatmap'), 'heatmap-radius')) {
                                setHeatmapRadius(Number(e.target.value));
                                let expression: Expression = map.current?.getPaintProperty(
                                  layer.layer.concat('-heatmap'),
                                  'heatmap-radius'
                                );
                                expression[3][2] = Number(e.target.value);
                                map.current?.setPaintProperty(
                                  layer.layer.concat('-heatmap'),
                                  'heatmap-radius',
                                  expression
                                );
                              }
                            }
                          });
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="clearButton">
          <p className="small text-dark bg-white p-2 rounded">
            Lat: {lat} Lng: {lng} Zoom: {zoom}
          </p>
          <Button
            onClick={() => {
              fullScreenHandler();
              setTimeout(() => {
                map.current?.resize();
                document.getElementById('mapRow')?.scrollIntoView({ behavior: 'smooth' });
              }, 0);
            }}
            className="mb-2 float-end"
          >
            Full Screen
          </Button>
        </div>
      </div>
      {/* enable when needed by setting false to true */}
      {geographicLevelResultLayerIds &&
        true &&
        geographicLevelResultLayerIds.filter(geographicLevelResultLayerId => geographicLevelResultLayerId.active)
          .length > 0 && (
          <Container
            style={{
              right: '2%',
              bottom: '3%',
              position: 'absolute',
              zIndex: 2,
              minWidth: '15%',
              width: '15%',
              maxWidth: '30%'
            }}
            className="sidebar-adjust-list text-dark bg-light p-2 rounded"
            onClick={() => setShowStats(!showStats)}
          >
            <p className="lead mb-1" style={{ fontSize: 'small' }}>
              <u>
                <b>Stats</b>
              </u>
            </p>

            {showStats &&
              geographicLevelMapStateData.current?.map(stateData => {
                return (
                  <p key={stateData.key}>
                    <b>{stateData.key}:</b> {stateData.data.features.length}
                  </p>
                );
              })}

            {showStats &&
              entityTags
                .filter(entityTag => entityTag.simulationDisplay)
                .map(entityTag => {
                  return (
                    <p key={entityTag.identifier}>
                      <b>{entityTag.tag}:</b>
                      {stats[entityTag.tag]}
                    </p>
                  );
                })}
          </Container>
        )}
      {showMapDrawnModal && (
        <ActionDialog
          closeHandler={() => setShowMapDrawnModal(false)}
          title={'Selected Locations'}
          footer={
            <>
              <Button
                onClick={() => {
                  if (mapBoxDraw.current) {
                    mapBoxDraw.current?.deleteAll();
                  }
                  setShowMapDrawnModal(false);
                }}
              >
                <FontAwesomeIcon className="mx-1" icon="trash" />
              </Button>
              <Button
                onClick={_ => {
                  updateSelectedLocations(mapDrawMouseOverEvent);
                  setShowMapDrawnModal(false);
                }}
              >
                update
              </Button>
              <Button onClick={() => setShowMapDrawnModal(false)}>close</Button>
            </>
          }
          element={
            <Container fluid>
              <Row className="my-3">
                <Col>
                  <Form.Group>
                    <Form.Label>{'Select Level for which the Drawn Polygon to apply to'}</Form.Label>

                    <Form.Select
                      style={{ display: 'inline-block' }}
                      onChange={e => {
                        setDrawnMapLevel(e.target.value);
                      }}
                    >
                      <option key="selectDrawLayer" value={'select layer'}>
                        {'Select layer...'}
                      </option>
                      {geographicLevelResultLayerIds &&
                        geographicLevelResultLayerIds.map(geographicLevelResultLayerId => {
                          return (
                            <option key={geographicLevelResultLayerId.layer} value={geographicLevelResultLayerId.layer}>
                              {geographicLevelResultLayerId.layer}
                            </option>
                          );
                        })}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="my-3">
                <Col>
                  <Form.Group>
                    <Form.Check
                      className="float-left"
                      type="switch"
                      id="custom-switch"
                      label="Should the selection apply to children locations?"
                      defaultChecked={true}
                      onChange={e => setShouldApplyToChildren(e.target.checked)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          }
          size={'lg'}
        />
      )}

      <div id="mapContainer" ref={mapContainer} style={{ height: fullScreen ? '95vh' : '75vh', width: '100%' }} />
    </Container>
  );
};
export default SimulationMapView;
