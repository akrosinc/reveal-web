import { EventData, GeoJSONSource, MapLayerEventType, Popup } from 'mapbox-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { MAPBOX_STYLE_STREETS } from '../../../../constants';
import {
  createLocationLabel,
  disableMapInteractions,
  fitCollectionToBounds,
  getFeatureCentresFromLocation,
  getGeoListFromMapData,
  getPolygonCenter,
  getTagStats,
  initSimulationMap,
  PARENT_LABEL_SOURCE,
  PARENT_SOURCE
} from '../../../../utils';
import { PlanningLocationResponse, PlanningParentLocationResponse } from '../../providers/types';
import { bbox, Feature, MultiPoint, MultiPolygon, Point, pointsWithinPolygon, Polygon, Properties } from '@turf/turf';
import { Color, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { Children } from '../Simulation';
import ActionDialog from '../../../../components/Dialogs/ActionDialog';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import styles from './SimulationMapView.module.css';
import Spinner from 'react-bootstrap/Spinner';

import { FeatureCollection, Geometry } from 'geojson';

// UTISLS
import {
  getLineParameters,
  updateFeaturesWithTagStatsAndColorAndTransparency,
  updateSelectedTag,
  updateLayerProperty,
  updateSelectedLayerProperty
} from './SimulationMapViewUtils';
// INTERFACE
import { SimulationMapViewProps, UserDefinedLayer, UserDefinedNames } from './SimulationMapViewModels';
// CONTANTS
import {
  INITIAL_FILL_COLOR,
  INITIAL_HEAT_MAP_OPACITY,
  INITIAL_HEAT_MAP_RADIUS,
  INITIAL_LINE_COLOR
} from './SimulationMapViewConstants';
import StatisticsPanel from './components/StatisticsPanel/StatisticsPanel';
import DataSetPanel from './components/DataSetPanel/DataSetPanel';
import mapboxgl from 'mapbox-gl';

library.add(faCaretRight, faCaretLeft);

// DATASET REFACTORED GET COLOR FUNCTION
export const getBackgroundStyle = (value: { r: number; g: number; b: number } | null) => {
  if (value != null) {
    return `rgb(${value.r}, ${value.g}, ${value.b})`;
  } else {
    return 'rgb(255, 255, 255)'; // Default solid white
  }
};

const SimulationMapView = ({
  polygons,
  loading,
  leftOpenHandler,
  rightOpenHandler,
  leftOpenState,
  rightOpenState,
  fullScreen,
  toLocation,
  entityTags,
  parentMapData,
  chunkedData,
  resetMap,
  setResetMap,
  resultsLoadingState,
  parentsLoadingState,
  stats,
  map,
  updateMarkedLocations,
  parentChild,
  analysisLayerDetails,
  selectedLoaction
}: SimulationMapViewProps) => {
  const [defColor] = useColor('hex', INITIAL_FILL_COLOR);

  const mapContainer = useRef<any>();
  const [color, setColor] = useColor('hex', INITIAL_FILL_COLOR);
  const [initialLineColor] = useColor('hex', INITIAL_LINE_COLOR);

  const [lng, setLng] = useState(20.33);
  const [lat, setLat] = useState(4.44);
  const [zoom, setZoom] = useState(2.5);

  // DATASET MIGRATION TO PARENT

  const hoverPopup = useRef<Popup>(
    new Popup({
      closeOnClick: false,
      closeButton: false,
      offset: 20
    })
  );
  const [parentMapStateData, setParentMapStateData] = useState<PlanningParentLocationResponse>();

  const [userDefinedLayers, setUserDefinedLayers] = useState<UserDefinedLayer[]>([]);
  const [userDefinedNames, setUserDefinedNames] = useState<UserDefinedNames[]>([]);

  const [showMapDrawnModal, setShowMapDrawnModal] = useState(false);

  const [markedMapBoxFeatures, setMarkedMapBoxFeatures] = useState<Feature<Polygon | MultiPolygon, Properties>[]>([]);
  const mapBoxDraw = useRef<MapboxDraw>();
  const [drawnMapLevel, setDrawnMapLevel] = useState<string>();
  const [shouldApplyToChildren, setShouldApplyToChildren] = useState(true);
  const [shouldApplyToAll, setShouldApplyToAll] = useState(false);
  const [selectedUserDefinedLayer, setSelectedUserDefinedLayer] = useState<UserDefinedLayer | undefined>();

  const [showUserDefinedSettingsPanel, setShowUserDefinedSettingsPanel] = useState(false);

  useEffect(() => {
    if (map.current) return;
    initializeMap();
  });

  useEffect(() => {
    if (map.current) {
      if (
        resultsLoadingState === 'notstarted' ||
        resultsLoadingState === 'complete' ||
        resultsLoadingState === 'error'
      ) {
        disableMapInteractions(map.current, false);
      } else {
        disableMapInteractions(map.current, true);
      }
    }
  }, [resultsLoadingState, parentsLoadingState, map]);

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

  const updateSelectedLocations3 = useCallback(() => {
    let selectedLocations: Feature<Polygon | MultiPolygon, Properties>[] = [];

    if (markedMapBoxFeatures) {
      selectedLocations = markedMapBoxFeatures.filter((feature: any) => {
        if (feature != null && feature['properties'] && feature['properties']['identifier']) {
          return (
            (drawnMapLevel !== undefined && feature['properties']['identifier'] === drawnMapLevel) || shouldApplyToAll
          );
        }
        return false;
      });
    }

    if (markedMapBoxFeatures) {
      userDefinedLayers.forEach(layer => {
        let sourceCentres: any = map.current?.getSource(layer.layer + '-centers');

        if (sourceCentres && sourceCentres._data) {
          let sourceFeatures = (sourceCentres._data as any)['features'];

          let sourceData: FeatureCollection<Point, Properties> = {
            type: 'FeatureCollection',
            features: sourceFeatures
          };

          let sourceFeaturesBelow: Feature<Point, Properties>[] = [];
          let featuresToMark: string[] = [];
          selectedLocations.forEach(feature => {
            if (feature && feature.properties && feature.properties.identifier) {
              featuresToMark.push(feature.properties.identifier);
            }

            if (shouldApplyToChildren) {
              sourceFeaturesBelow.push(
                ...sourceFeatures.filter((sourceDataFeature: any) => {
                  if (sourceDataFeature.properties && sourceDataFeature.properties.geographicLevelNodeNumber) {
                    return (
                      sourceDataFeature.properties.geographicLevelNodeNumber >=
                      feature?.properties?.geographicLevelNodeNumber
                    );
                  }
                  return false;
                })
              );
            }
          });
          let sourceDataBelow: FeatureCollection<Point, Properties> = {
            type: 'FeatureCollection',
            features: sourceFeaturesBelow
          };

          selectedLocations.forEach(selectedLocation => {
            let featuresToMarkArr = pointsWithinPolygon(sourceDataBelow, selectedLocation);
            if (featuresToMarkArr && featuresToMarkArr.features) {
              const markedFeatureIds = featuresToMarkArr.features
                .filter(markedFeature => markedFeature.properties && markedFeature.properties.identifier)
                .map(markedFeature => markedFeature.properties?.identifier);
              if (markedFeatureIds) {
                featuresToMark.push(...markedFeatureIds);
              }
            }
          });

          sourceData.features?.forEach(sourceDataFeature => {
            if (sourceDataFeature.properties && sourceDataFeature.properties.identifier) {
              if (featuresToMark.includes(sourceDataFeature.properties.identifier)) {
                sourceDataFeature.properties['mark'] = true;
                if (sourceDataFeature.properties.identifier) {
                  updateMarkedLocations(
                    sourceDataFeature.properties.identifier,
                    sourceDataFeature.properties.ancestry,
                    true
                  );
                }
              }
            }
          });
          if (map.current?.getSource(layer.layer + '-centers')) {
            (map.current?.getSource(layer.layer + '-centers') as GeoJSONSource).setData(sourceData);
          }
        }
      });
    }

    //
  }, [
    userDefinedLayers,
    shouldApplyToChildren,
    drawnMapLevel,
    markedMapBoxFeatures,
    shouldApplyToAll,
    updateMarkedLocations,
    map
  ]);

  const initializeMap = useCallback(() => {
    map.current = initSimulationMap(mapContainer, [lng, lat], zoom, 'bottom-right', undefined, e => {
      if (map.current) {
        let source: any = map.current?.getSource('mark-source') as GeoJSONSource;

        if (source._data) {
          if (source._data.features?.length > 0) {
            (map.current?.getSource('mark-source') as GeoJSONSource).setData({
              type: 'FeatureCollection',
              features: []
            });
          } else {
            const features = map.current.queryRenderedFeatures(e.point);
            let filteredfeatures = features.filter(feature => feature.layer.id.endsWith('-fill'));

            let acc: any[] = [];
            let accKeyed: { [key: string]: any } = {};

            filteredfeatures.forEach(feature => {
              const source: any = map.current?.getSource(feature.source) as GeoJSONSource;

              let data = source._data as any;
              let layerFeatures = data['features'];

              if (feature && feature.properties) {
                const items = layerFeatures.filter(
                  (layerFeature: any) =>
                    feature &&
                    feature.properties &&
                    feature.properties.identifier &&
                    layerFeature.properties &&
                    layerFeature.properties.identifier === feature.properties.identifier
                );
                items.forEach((item: any) => {
                  accKeyed[item.properties.identifier] = item;
                });
              }
            });
            Object.keys(accKeyed).forEach((key: string) => {
              acc.push(accKeyed[key]);
            });

            setMarkedMapBoxFeatures(acc);
            setShowMapDrawnModal(true);
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

    map.current.addControl(mapBoxDraw.current, 'bottom-right');

    map.current?.on(
      'mouseover',
      'gl-draw-polygon-fill-inactive.hot',
      (e: MapLayerEventType['mouseover'] & EventData) => {
        if (e.features) {
          let acc: Feature<Polygon | MultiPolygon, Properties>[] = [];

          userDefinedLayers
            .filter(layer => layer.active)
            .forEach(layer => {
              let sourceCentres: any = map.current?.getSource(layer.layer + '-centers');
              let sourceFill: any = map.current?.getSource(layer.layer);

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

                    let a: Feature<Point | MultiPoint, Properties>[] = pointsWithinPolygon(
                      sourceData,
                      drawFeature
                    ).features.filter(feature => feature.properties && feature.properties.identifier);

                    a.forEach(point => {
                      let polygon = (sourceFill._data as any)['features'].filter(
                        (polygonFeature: Feature<Polygon | MultiPolygon, Properties>) => {
                          if (
                            polygonFeature &&
                            polygonFeature.properties &&
                            polygonFeature.properties.identifier &&
                            point &&
                            point.properties &&
                            point.properties.identifier
                          ) {
                            return point.properties.identifier === polygonFeature.properties.identifier;
                          }
                          return false;
                        }
                      );
                      if (polygon && polygon.length && polygon.length > 0) {
                        acc.push(...polygon);
                      }
                    });
                  }
                });
              }
            });
          setMarkedMapBoxFeatures(acc);
          setShowMapDrawnModal(true);
        }
      }
    );
    map.current?.setStyle(MAPBOX_STYLE_STREETS);
  }, [lat, lng, map, zoom, userDefinedLayers]);

  useEffect(() => {
    if (resetMap) {
      initializeMap();
      setResetMap(false);
      setUserDefinedLayers([]);
      setUserDefinedNames([]);
    }
  }, [resetMap, initializeMap, setResetMap]);

  // useEffect(() => {
  //   if (toLocation && map && map.current && selectedLoaction) {
  //     map.current?.fitBounds(JSON.parse(JSON.stringify(bbox(selectedLoaction))));

  //     if (map.current.getSource('bounds-border')) {
  //       map.current.removeLayer('bounds-border');
  //       map.current.removeSource('bounds-border');
  //     }
  //     map.current.addSource('bounds-border', {
  //       type: 'geojson',
  //       data: {
  //         type: 'Feature',
  //         geometry: selectedLoaction.geometry,
  //         properties: {}
  //       }
  //     });

  //     map.current?.addLayer(
  //       {
  //         id: 'bounds-border',
  //         type: 'fill',
  //         source: 'bounds-border',
  //         paint: {
  //           // 'line-color': '#FF0000',
  //           // 'line-width': 2
  //           'fill-outline-color': 'rgba(255, 000, 000, 1)',
  //           'fill-color': 'rgba(255, 000, 000, 0.4)'
  //         }
  //       },
  //       'label-layer'
  //     );
  //   }
  // }, [toLocation, map, selectedLoaction]);

  // useEffect(() => {
  //   if (map && map.current && polygons && selectedLoaction) {
  //     console.log(selectedLoaction, 'selectedLocation');
  //     map.current?.fitBounds(JSON.parse(JSON.stringify(bbox(selectedLoaction))));

  //     polygons.forEach(polygon => {
  //       const { center } = getPolygonCenter(polygon.geometry);
  //       createLocationLabel(map.current!, polygon, center);
  //     });

  //     const geoJsonData: Feature<Geometry, Properties>[] = polygons.map(polygon => ({
  //       type: 'Feature',
  //       geometry: polygon.geometry,
  //       properties: {
  //         id: polygon.identifier // Unique identifier for interactions
  //       }
  //     }));

  //     // Update existing source or add new one
  //     if (map.current?.getSource('polygons-source')) {
  //       (map.current.getSource('polygons-source') as GeoJSONSource).setData({
  //         type: 'FeatureCollection',
  //         features: geoJsonData
  //       });
  //     } else {
  //       map.current?.addSource('polygons-source', {
  //         type: 'geojson',
  //         data: {
  //           type: 'FeatureCollection',
  //           features: geoJsonData
  //         }
  //       });

  //       // Add a single layer for all polygons
  //       map.current?.addLayer({
  //         id: 'polygons-layer',
  //         type: 'fill',
  //         source: 'polygons-source',
  //         paint: {
  //           'fill-outline-color': 'rgba(255, 0, 0, 1)',
  //           'fill-color': 'rgba(189, 195, 199, 0.4)'
  //         }
  //       });
  //     }

  //     if (map && map.current && polygons && selectedLoaction) {
  //       // console.log(map.current.getStyle().layers, 'Available Layers');
  //       // Your existing logic
  //     }

  //     // Handle click event on polygons
  //     map.current?.on('click', 'polygons-layer', e => {
  //       const clickedPolygon = e.features ? e.features[0] : null;
  //       if (!clickedPolygon) return;
  //       const polygonId = clickedPolygon.properties?.id;

  //       // Reset colors for all polygons
  //       polygons.forEach(polygon => {
  //         if (map.current?.getLayer(polygon.identifier)) {
  //           map.current?.setPaintProperty(polygon.identifier, 'fill-color', 'rgba(189, 195, 199, 0.4)');
  //         }
  //       });

  //       // Highlight the selected polygon
  //       // console.log('Polygon clicked:', polygonId === map.current?.getLayer((polygonId + 'Label') as string).id);

  //       // map.current?.setPaintProperty(polygonId, 'fill-color', 'rgba(255, 0, 0, 0.8)');
  //     });
  //   }
  // }, [map, polygons, selectedLoaction]);

  useEffect(() => {
    if (map && map.current && polygons && selectedLoaction) {
      map.current?.fitBounds(JSON.parse(JSON.stringify(bbox(selectedLoaction.geometry))));
      // Iterate over all polygons
      polygons.forEach(polygon => {
        const { center } = getPolygonCenter(polygon.geometry);
        createLocationLabel(map.current!, polygon, center);

        // console.log('polygon', polygon);

        // Add or update the polygon source
        if (map.current?.getSource(polygon.identifier)) {
          // Update existing source
          (map.current.getSource(polygon.identifier) as GeoJSONSource).setData({
            type: 'Feature',
            geometry: polygon.geometry,
            properties: polygon.identifier
          });
        } else {
          // Add new source
          map.current?.addSource(polygon.identifier, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: polygon.geometry,
              properties: polygon.identifier
            }
          });

          // Add layer for the source
          map.current?.addLayer({
            id: polygon.identifier,
            type: 'fill',
            source: polygon.identifier,
            paint: {
              'fill-outline-color': 'rgba(255, 0, 0, 1)', // Border color
              'fill-color': 'rgba(189, 195, 199, 0.4)' // Fill color
            }
          });
        }
      });
    }
  }, [map, polygons, selectedLoaction]);

  //  LISTENER
  // useEffect(() => {
  //   // polygons?.forEach(polygon => {
  //   if (!selectedLoaction) {
  //     return;
  //   }
  //   map.current?.on('click', selectedLoaction.identifier, e => {
  //     map.current?.fitBounds(JSON.parse(JSON.stringify(bbox(selectedLoaction.geometry))));

  //     console.log('Polygon clicked:', e.features);

  //     // map.current?.setPaintProperty(e.features?.[0].source as string, 'fill-color', 'rgba(147, 250, 165, 0.6)');

  //     // Reset all polygons to default color
  //     // polygons.forEach(({ identifier }) => {
  //     //   map.current?.setPaintProperty(identifier, 'fill-color', 'rgba(189, 195, 199, 0.4)');
  //     // });
  //     // Highlight the clicked polygon
  //     // console.log('Polygon clicked:', polygon.identifier, e.features);
  //     // map.current?.setPaintProperty(polygon.identifier, 'fill-color', 'rgba(147, 250, 165, 0.6)'); // Highlight fill color
  //     // Optionally, handle any custom logic for the selected polygon
  //   });
  //   // });
  // }, [map, selectedLoaction]);

  useEffect(() => {
    if (chunkedData) {
      if (
        chunkedData?.features?.length > 0 &&
        (!chunkedData?.parents ||
          chunkedData?.parents?.length === 0 ||
          (chunkedData.source && chunkedData.source === 'uploadHandler'))
      ) {
        let layerList: Set<string>;

        layerList = new Set<string>();
        analysisLayerDetails.forEach(analysisLayerDetail => layerList.add(analysisLayerDetail.labelName));
        let layer: string = analysisLayerDetails[analysisLayerDetails.length - 1].labelName;
        let geoColor = analysisLayerDetails[analysisLayerDetails.length - 1].color;
        let geoList: Set<string>;
        geoList = getGeoListFromMapData(chunkedData);
        geoList.forEach(geo => {
          let finalLayer = layer.concat('-').concat(geo);

          let initData: PlanningLocationResponse = {
            parents: [],
            features: [],
            type: 'FeatureCollection',
            identifier: undefined
          };

          if (!map.current?.getSource(finalLayer)) {
            map.current?.addSource(finalLayer, {
              type: 'geojson',
              data: initData,
              tolerance: 0.75
            });
          }

          if (!map.current?.getSource(finalLayer.concat('-points'))) {
            map.current?.addSource(finalLayer.concat('-points'), {
              type: 'geojson',
              data: initData,
              tolerance: 0.75
            });
          }

          if (!map.current?.getSource(finalLayer.concat('-centers'))) {
            map.current?.addSource(finalLayer.concat('-centers'), {
              type: 'geojson',
              data: initData,
              tolerance: 0.75
            });
          }

          if (!map.current?.getLayer(finalLayer.concat('-line'))) {
            map.current?.addLayer(
              {
                id: finalLayer.concat('-line'),
                type: 'line',
                source: finalLayer,
                paint: {
                  'line-color': [
                    'case',
                    ['==', ['get', 'selectedLineColor'], null],
                    'black',
                    ['get', 'selectedLineColor']
                  ],
                  'line-width': ['case', ['==', ['get', 'selectedLineWidth'], null], 1, ['get', 'selectedLineWidth']],
                  'line-offset': getLineParameters(finalLayer).offset
                }
              },
              'label-layer'
            );
          }

          if (!map.current?.getLayer(finalLayer.concat('-points'))) {
            map.current?.addLayer(
              {
                id: finalLayer.concat('-points'),
                type: 'circle',
                source: finalLayer,
                filter: ['==', ['geometry-type'], 'Point'],
                paint: {
                  'circle-color': [
                    'case',
                    ['==', ['get', 'selectedTagValue'], null],
                    geoColor.hex,
                    ['<', ['get', 'selectedTagValue'], 0],
                    geoColor.hex,
                    ['==', ['get', 'selectedTagValue'], 0],
                    geoColor.hex,
                    ['get', 'colorField']
                  ],
                  'circle-opacity': [
                    'case',
                    ['==', ['get', 'selectedTagValuePercent'], null],
                    0,
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

          if (!map.current?.getLayer(finalLayer.concat('-fill'))) {
            map.current?.addLayer(
              {
                id: finalLayer.concat('-fill'),
                type: 'fill',
                source: finalLayer,
                filter: ['!=', ['geometry-type'], 'Point'],
                paint: {
                  'fill-color': [
                    'case',
                    ['all', ['==', ['get', 'selectedTag'], null], ['==', ['get', 'selectedColor'], null]],
                    geoColor.hex,
                    ['get', 'selectedColor']
                  ],

                  'fill-opacity': [
                    'case',

                    ['all', ['==', ['get', 'selectedTag'], null], ['==', ['get', 'selectedColor'], null]],
                    0.1,
                    ['any', ['==', ['get', 'selectedTagValue'], null], ['==', ['get', 'selectedTagValue'], 0]],
                    0,
                    ['/', ['get', 'selectedTransparency'], 100]
                  ]
                }
              },
              finalLayer.concat('-line')
            );
          }

          if (!map.current?.getLayer(finalLayer.concat('-symbol'))) {
            map.current?.addLayer(
              {
                id: finalLayer.concat('-symbol'),
                type: 'symbol',
                filter: ['all', ['!=', ['get', 'selectedTagValue'], null], ['==', ['get', 'reachedMax'], null]],
                source: finalLayer.concat('-centers'),
                layout: {
                  'text-field': [
                    'format',
                    ['get', 'name'],
                    {
                      'text-font': ['literal', ['Open Sans Bold', 'Open Sans Semibold']]
                    }
                  ],
                  'text-size': ['interpolate', ['linear'], ['zoom'], 5, 2, 7, 10, 10, 12, 18, 20],
                  'text-anchor': 'top',
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
              finalLayer.concat('-line')
            );
          }
          if (!map.current?.getLayer(finalLayer.concat('-null-symbol'))) {
            map.current?.addLayer(
              {
                id: finalLayer.concat('-null-symbol'),
                type: 'symbol',
                filter: [
                  'any',
                  ['==', ['get', 'selectedTagValue'], null],
                  ['==', ['get', 'selectedTagValue'], 0],
                  ['==', ['get', 'reachedMax'], 'true']
                ],
                source: finalLayer.concat('-centers'),
                layout: {
                  'text-field': [
                    'format',
                    ['get', 'name'],
                    {
                      'text-font': ['literal', ['Open Sans Bold', 'Open Sans Semibold']]
                    }
                  ],
                  'text-size': ['interpolate', ['linear'], ['zoom'], 5, 5, 7, 10, 10, 12, 18, 20],
                  'text-anchor': 'top',
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
                  ],
                  'text-halo-color': [
                    'case',
                    ['==', ['get', 'reachedMax'], 'true'],
                    '#e8ad89',
                    ['case', ['==', ['get', 'selectedTagValue'], null], '#d9c1c1', '#bbd3f1']
                  ],
                  'text-halo-width': 100
                }
              },
              finalLayer.concat('-line')
            );
          }

          if (!map.current?.getLayer(finalLayer.concat('-heatmap'))) {
            map.current?.addLayer(
              {
                id: finalLayer.concat('-heatmap'),
                type: 'heatmap',
                source: finalLayer.concat('-centers'),
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
              finalLayer.concat('-symbol')
            );
          }

          if (!map.current?.getLayer(finalLayer.concat('-structure-heatmap'))) {
            map.current?.addLayer(
              {
                id: finalLayer.concat('-structure-heatmap'),
                type: 'heatmap',
                source: finalLayer.concat('-centers'),
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
              finalLayer.concat('-symbol')
            );
          }
          if (!map.current?.getLayer(finalLayer.concat('-operational-heatmap'))) {
            map.current?.addLayer(
              {
                id: finalLayer.concat('-operational-heatmap'),
                type: 'heatmap',
                source: finalLayer.concat('-centers'),
                paint: {
                  'heatmap-radius': ['case', ['==', ['get', 'geographicLevel'], 'operational'], 15, 0],
                  'heatmap-weight': ['case', ['==', ['get', 'geographicLevel'], 'operational'], 3, 0],
                  'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.2, 16, 0],
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(0, 0, 255, 0)',
                    0.1,
                    'red',
                    0.3,
                    'purple',
                    0.5,
                    'pink',
                    0.7,
                    'grey',
                    1,
                    'green'
                  ]
                }
              },
              finalLayer.concat('-symbol')
            );
          }

          if (map.current) {
            if (map.current?.getLayer(finalLayer.concat('-symbol'))) {
              map.current.on('mouseover', finalLayer.concat('-symbol'), e => {
                const features = map.current?.queryRenderedFeatures(e.point);
                let filteredFeatures = features?.filter(feature => feature.layer.id.endsWith('-fill'));
                const feature = filteredFeatures ? filteredFeatures[0] : undefined;
                let tagData = filteredFeatures
                  ?.map(feature => {
                    const properties = feature.properties;
                    let htmlText = '';
                    if (properties) {
                      let selectedTag = properties.selectedTag;
                      if (properties['selectedTagValue'] === 0 || properties['selectedTagValue']) {
                        const selectedValue: any[] = JSON.parse(properties['selectedTagValue']);

                        let selectedTagPercentageValue = properties.selectedTagValuePercent;
                        let percDisplay = 0;
                        try {
                          let perc = parseFloat(selectedTagPercentageValue);
                          percDisplay = Math.trunc(Math.round(perc * 100));
                        } catch (e) {}
                        htmlText = `
                                              <br> Layer: ${feature.layer.id?.split('-')[0]}
                                              <br> Tag: ${selectedTag}
                                              <br> Value: ${selectedValue}
                                              <br> Percentile: ${percDisplay}%

                                        `;
                      }
                    }
                    return htmlText;
                  })
                  .reverse()
                  .join('<br>');
                if (feature) {
                  const properties = feature.properties;
                  if (properties && (properties['selectedTagValue'] === 0 || properties['selectedTagValue'])) {
                    let htmlText = `<p class="text-success"><b>Location Name:</b> ${feature.properties?.name}
                                              ${tagData}
                                        </p > `;
                    if (map.current) {
                      map.current.getCanvas().style.cursor = 'pointer';
                      hoverPopup.current.setLngLat(e.lngLat).setHTML(htmlText).addTo(map.current);
                    }
                  }
                }
              });

              map.current.on('mouseleave', finalLayer.concat('-symbol'), () => {
                if (map.current) {
                  map.current.getCanvas().style.cursor = '';
                  hoverPopup.current.remove();
                }
              });
            }
          }

          let filter = chunkedData.features?.filter(feature => feature.properties?.geographicLevel === geo);

          let layerSize = 0;
          let filteredData: PlanningLocationResponse = {
            features: filter,
            type: 'FeatureCollection',
            parents: [],
            identifier: undefined
          };

          if (filteredData.features.length > 0) {
            let planningLocationResponseGeoContainer = { key: finalLayer, data: filteredData };

            if (map.current?.getSource(finalLayer)) {
              if (planningLocationResponseGeoContainer) {
                let existingSource = map.current?.getSource(finalLayer) as any;

                let newFeatureList: Feature<Polygon | Point | MultiPolygon, Properties>[] = [];
                let existingData = existingSource._data;
                existingData.features.forEach((feature: Feature<Polygon | Point | MultiPolygon, Properties>) => {
                  newFeatureList.push({
                    type: 'Feature',
                    id: feature.id,
                    properties: feature.properties,
                    geometry: feature.geometry
                  });
                });
                filter.forEach(filteredItem => {
                  newFeatureList.push({
                    type: 'Feature',
                    id: filteredItem.id,
                    properties: filteredItem.properties,
                    geometry: filteredItem.geometry
                  });
                });
                layerSize = newFeatureList.length;

                let esfilteredData: PlanningLocationResponse = {
                  features: newFeatureList,
                  type: 'FeatureCollection',
                  parents: [],
                  identifier: undefined
                };

                (map.current?.getSource(finalLayer) as GeoJSONSource).setData(esfilteredData);

                if (map.current) {
                  fitCollectionToBounds(map.current, planningLocationResponseGeoContainer.data);
                }
              }
            }
            if (map.current?.getSource(finalLayer.concat('-centers'))) {
              if (planningLocationResponseGeoContainer) {
                let centers = getFeatureCentresFromLocation(planningLocationResponseGeoContainer.data);

                let existingCenterSource = map.current?.getSource(finalLayer.concat('-centers')) as any;

                let newFeatureList: Feature<Polygon | Point | MultiPolygon, Properties>[] = [];
                let existingData = existingCenterSource._data;
                existingData.features.forEach((feature: Feature<Polygon | Point | MultiPolygon, Properties>) => {
                  newFeatureList.push({
                    type: 'Feature',
                    id: feature.id,
                    properties: feature.properties,
                    geometry: feature.geometry
                  });
                });
                centers.forEach(centre => {
                  newFeatureList.push({
                    type: 'Feature',
                    id: centre.id,
                    properties: centre.properties,
                    geometry: centre.geometry
                  });
                });

                let centreFeatureCollection: PlanningLocationResponse = {
                  features: newFeatureList,
                  type: 'FeatureCollection',
                  parents: [],
                  identifier: undefined
                };
                (map.current?.getSource(finalLayer.concat('-centers')) as GeoJSONSource).setData(
                  centreFeatureCollection
                );
              }
            }
          }

          setUserDefinedLayers(userDefinedLayers => {
            if (!userDefinedLayers.map(userDefinedLayer => userDefinedLayer.layer).includes(finalLayer)) {
              userDefinedLayers.push({
                layer: finalLayer,
                key: finalLayer,
                geo: geo,
                layerName: layer,
                active: true,
                col: geoColor,
                size: layerSize
              });
              return userDefinedLayers;
            } else {
              userDefinedLayers.forEach(userDefinedLayer => {
                if (userDefinedLayer.layer === finalLayer) {
                  userDefinedLayer.size = layerSize;
                }
              });

              return userDefinedLayers;
            }
          });
        });

        let uniqueTags: Set<string> = new Set<string>();
        chunkedData.features?.forEach(feature => {
          if (feature.properties && feature.properties.metadata) {
            let metaList = feature.properties.metadata;
            if (metaList) {
              metaList.forEach((meta: any) => uniqueTags.add(meta.type));
            }
          }
        });

        setUserDefinedNames(userDefinedNames => {
          let finLayer = layer;

          let newUserDefinedLayerNames: {
            layer: string;
            key: string;
            layerName: string;
            active: boolean;
            col: Color;
            tagList?: Set<any>;
          }[] = [];

          userDefinedNames.forEach(userDefinedLayerName => {
            newUserDefinedLayerNames.push(userDefinedLayerName);
          });

          if (!userDefinedNames.map(userDefinedLayer => userDefinedLayer.layer).includes(finLayer)) {
            newUserDefinedLayerNames.push({
              layer: finLayer,
              key: finLayer,
              layerName: finLayer,
              active: true,
              col: geoColor,
              tagList: uniqueTags
            });
          }
          return newUserDefinedLayerNames;
        });
      }
    }
  }, [chunkedData, map, analysisLayerDetails, userDefinedLayers]);

  useEffect(() => {
    if (map.current) {
      if (selectedUserDefinedLayer) {
        userDefinedLayers
          .filter(userDefinedLayer => userDefinedLayer.layerName === selectedUserDefinedLayer.key)
          .forEach(userDefinedLayer => {
            let geo = userDefinedLayer.layer;
            let sourceCentres: any = map.current?.getSource(geo.concat('-centers'));

            let sourceData: PlanningLocationResponse = {
              type: (sourceCentres._data as any)['type'],
              features: (sourceCentres._data as any)['features'],
              parents: (sourceCentres._data as any)['parents'],
              identifier: undefined
            };

            let tagStats: any;
            tagStats = getTagStats(sourceData);
            sourceData.features.forEach(feature => {
              if (feature && feature.properties) {
                feature.properties['selectedTransparency'] =
                  userDefinedLayer.transparency !== undefined && userDefinedLayer.transparency !== null
                    ? userDefinedLayer.transparency
                    : 10;

                feature.properties['selectedLineWidth'] =
                  userDefinedLayer.lineWidth !== undefined && userDefinedLayer.lineWidth !== null
                    ? userDefinedLayer.lineWidth
                    : 1;

                feature.properties['selectedLineColor'] =
                  userDefinedLayer.lineColor !== undefined && userDefinedLayer.lineColor !== null
                    ? userDefinedLayer.lineColor
                    : INITIAL_LINE_COLOR;
              }
            });
            if (userDefinedLayer.selectedTag) {
              sourceData.features = sourceData.features.map(feature =>
                updateFeaturesWithTagStatsAndColorAndTransparency(
                  feature,
                  tagStats,
                  userDefinedLayer.selectedTag,
                  'selectedTagValuePercent',
                  'selectedTagValue',
                  'selectedTag',
                  'selectedColor',

                  selectedUserDefinedLayer.col
                )
              );
            }

            if (map.current?.getSource(geo.concat('-centers'))) {
              (map.current?.getSource(geo.concat('-centers')) as GeoJSONSource).setData(sourceData);
            }

            let source: any = map.current?.getSource(geo);

            let fillSourceData: PlanningLocationResponse = {
              type: (source._data as any)['type'],
              features: (source._data as any)['features'],
              parents: (source._data as any)['parents'],
              identifier: undefined
            };
            fillSourceData.features = fillSourceData.features.map(feature =>
              updateFeaturesWithTagStatsAndColorAndTransparency(
                feature,
                tagStats,
                userDefinedLayer.selectedTag,
                'selectedTagValuePercent',
                'selectedTagValue',
                'selectedTag',
                'selectedColor',

                selectedUserDefinedLayer.col
              )
            );

            if (map.current?.getSource(geo)) {
              (map.current?.getSource(geo) as GeoJSONSource).setData(fillSourceData);
            }
          });
      }
    }
  }, [selectedUserDefinedLayer, userDefinedLayers, map, userDefinedNames]);

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

  const showLayer = useCallback(
    (show: any, layer: string) => {
      if (map.current?.getLayer(layer.concat('-fill'))) {
        map.current?.setLayoutProperty(layer.concat('-operational-heatmap'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-structure-heatmap'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-fill'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-line'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-symbol'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-null-symbol'), 'visibility', show ? 'visible' : 'none');
        map.current?.setLayoutProperty(layer.concat('-points'), 'visibility', show ? 'visible' : 'none');
      }
    },
    [map]
  );

  useEffect(() => {
    userDefinedLayers.forEach(userDefinedLayers => {
      showLayer(userDefinedLayers.active, userDefinedLayers.layer);
    });
  }, [userDefinedLayers, showLayer]);

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

  const getOptions = useCallback(() => {
    return (
      <>
        {markedMapBoxFeatures &&
          markedMapBoxFeatures
            .filter((feature: any) => feature.properties !== undefined)
            .map((feature: any) => {
              return (
                <option key={feature.properties?.name} value={feature.properties?.identifier}>
                  {feature.properties?.name} - {feature.properties?.geographicLevel}
                </option>
              );
            })}
      </>
    );
  }, [markedMapBoxFeatures]);

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>, layerName: string) => {
    const newSelectedTag = e.target.value;

    setUserDefinedNames(prevNames => updateSelectedTag(prevNames, layerName, newSelectedTag));
    setUserDefinedLayers(prevLayers => updateSelectedTag(prevLayers, layerName, newSelectedTag));
  };

  // Handlers for each specific property change
  const handleTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setUserDefinedLayers(userDefinedLayers =>
      updateLayerProperty(userDefinedLayers, selectedUserDefinedLayer?.key || '', 'transparency', newValue)
    );
  };

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setUserDefinedLayers(userDefinedLayers =>
      updateLayerProperty(userDefinedLayers, selectedUserDefinedLayer?.key || '', 'lineWidth', newValue)
    );
  };

  const handleColorChange = (color: any) => {
    const newColor = color.hex;
    setUserDefinedLayers(userDefinedLayers =>
      updateLayerProperty(userDefinedLayers, selectedUserDefinedLayer?.key || '', 'lineColor', newColor)
    );
    setSelectedUserDefinedLayer(prevLayer => updateSelectedLayerProperty(prevLayer, 'lineColor', color.toString()));
    setColor(color); // Update color state
  };

  return (
    <Container fluid style={{ position: 'relative' }} className={`mx-0 px-0 ${styles.mapContainer}`}>
      {loading === 'started' && (
        <div className={styles.backDrop}>
          <Spinner animation="grow" variant="success" className={styles.spinner} />
        </div>
      )}
      <button className={`${styles.buttonDrawer} ${styles.left}`} style={{}} onClick={leftOpenHandler}>
        <FontAwesomeIcon className={`${styles.customIcon}`} icon={leftOpenState ? faCaretLeft : faCaretRight} />
      </button>
      <button className={`${styles.buttonDrawer} ${styles.right}`} style={{}} onClick={rightOpenHandler}>
        <FontAwesomeIcon className={`${styles.customIcon}`} icon={rightOpenState ? faCaretRight : faCaretLeft} />
      </button>
      <div style={{ position: 'absolute', zIndex: 2, width: 'fit-content' }} className="mx-0 px-0">
        <div style={{ float: 'left', position: 'relative' }} className="sidebar-adjust "></div>

        {/* DATA SETS RESULT PANEL */}
        {userDefinedLayers.length > 0 && (
          <DataSetPanel
            userDefinedLayers={userDefinedLayers}
            setUserDefinedLayers={setUserDefinedLayers}
            defColor={defColor}
            setColor={setColor}
            initialLineColor={initialLineColor}
            showUserDefinedSettingsPanel={showUserDefinedSettingsPanel}
            setShowUserDefinedSettingsPanel={setShowUserDefinedSettingsPanel}
            selectedUserDefinedLayer={selectedUserDefinedLayer}
            setSelectedUserDefinedLayer={setSelectedUserDefinedLayer}
            userDefinedNames={userDefinedNames}
            handleTagChange={handleTagChange}
            handleLineWidthChange={handleLineWidthChange}
            handleTransparencyChange={handleTransparencyChange}
            handleColorChange={handleColorChange}
            color={color}
          />
        )}
      </div>

      {/* LANG LAT ZOOM */}
      <div className={`mx-0 px-0 ${styles.langLatContainer}`}>
        <div className={`${styles.langLatContent}`}>
          <p>Lat: {lat}</p> <p>Lng: {lng}</p> <p>Zoom: {zoom}</p>
        </div>
      </div>

      {/* STATISTICS PANEL ON THE RIGHT */}
      {userDefinedLayers && userDefinedLayers.length > 0 && (
        <StatisticsPanel
          userDefinedLayers={userDefinedLayers}
          userDefinedNames={userDefinedNames}
          stats={stats}
          entityTags={entityTags}
        />
      )}

      {/* LEFT CLICK FORM */}
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
                  updateSelectedLocations3();

                  if (mapBoxDraw.current) {
                    mapBoxDraw.current?.deleteAll();
                  }

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
                    <Form.Check
                      className="float-left"
                      type="switch"
                      id="custom-switch"
                      label="Should the selection apply to all locations?"
                      defaultChecked={false}
                      onChange={e => setShouldApplyToAll(e.target.checked)}
                    />
                  </Form.Group>
                  {!shouldApplyToAll && (
                    <Form.Group>
                      <Form.Label>{'Select Location for which the Drawn Polygon to apply to'}</Form.Label>

                      <Form.Select
                        style={{ display: 'inline-block' }}
                        onChange={e => {
                          setDrawnMapLevel(e.target.value);
                        }}
                      >
                        <option key="selectDrawLayer" value={'select layer'}>
                          {'Select layer...'}
                        </option>
                        {getOptions()}
                      </Form.Select>
                    </Form.Group>
                  )}
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

      <div id="mapContainer" ref={mapContainer} style={{ height: fullScreen ? '90vh' : '75vh', width: '100%' }} />
    </Container>
  );
};
export default SimulationMapView;
