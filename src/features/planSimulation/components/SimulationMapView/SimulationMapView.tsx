import { EventData, GeoJSONSource, LngLatBounds, Map as MapBoxMap, MapLayerEventType, Popup } from 'mapbox-gl';
import Draggable from 'react-draggable';
import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Accordion, Button, Col, Container, Form, FormGroup, Row, Tab, Tabs } from 'react-bootstrap';
import { MAPBOX_STYLE_STREETS } from '../../../../constants';
import {
  disableMapInteractions,
  fitCollectionToBounds,
  getFeatureCentresFromLocation,
  getGeoListFromMapData,
  getTagStats,
  initSimulationMap,
  PARENT_LABEL_SOURCE,
  PARENT_SOURCE
} from '../../../../utils';
import {
  EntityTag,
  PlanningLocationResponse,
  PlanningParentLocationResponse,
  RevealFeature
} from '../../providers/types';
import { hex, hsv } from 'color-convert';
import {
  Feature,
  FeatureCollection,
  MultiPoint,
  MultiPolygon,
  Point,
  pointsWithinPolygon,
  Polygon,
  Properties
} from '@turf/turf';
import { ColorPicker, Color, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Children, StatsLayer } from '../Simulation';
import ActionDialog from '../../../../components/Dialogs/ActionDialog';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { AnalysisLayer } from '../Simulation';

interface Props {
  fullScreenHandler: () => void;
  fullScreen: boolean;
  toLocation: LngLatBounds | undefined;
  entityTags: EntityTag[];
  parentMapData: PlanningParentLocationResponse | undefined;
  setMapDataLoad: (data: PlanningLocationResponse) => void;
  chunkedData: PlanningLocationResponse;
  resetMap: boolean;
  setResetMap: (resetMap: boolean) => void;
  resultsLoadingState: 'notstarted' | 'error' | 'started' | 'complete';
  parentsLoadingState: 'notstarted' | 'error' | 'started' | 'complete';
  stats: StatsLayer;
  map: MutableRefObject<MapBoxMap | undefined>;
  updateMarkedLocations: (identifier: string, ancestry: string[], marked: boolean) => void;
  parentChild: { [parent: string]: Children };
  analysisLayerDetails: AnalysisLayer[];
}

const lineParameters: any = {
  countryx: { col: 'red', num: 1, offset: 2.5 },
  countyx: { col: 'blue', num: 1, offset: 2.5 },
  subcountyx: { col: 'darkblue', num: 1, offset: 6 },
  wardx: { col: 'yellow', num: 2, offset: 3 },
  catchmentx: { col: 'purple', num: 3, offset: 1 }
};

export const getBackgroundStyle = (value: { r: number; g: number; b: number } | null) => {
  if (value != null) {
    return (
      'linear-gradient(to right, rgba(' +
      value.r +
      ', ' +
      value.g +
      ', ' +
      value.b +
      ', 0), rgba(' +
      value.r +
      ',' +
      value.g +
      ', ' +
      value.b +
      ', 1)'
    );
  } else {
    return 'linear-gradient(to right, rgba(255,255,255, 0.5), rgba(255,255,255, 0.5)';
  }
};

const SimulationMapView = ({
  fullScreenHandler,
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
  analysisLayerDetails
}: Props) => {
  const INITIAL_HEAT_MAP_RADIUS = 50;
  const INITIAL_HEAT_MAP_OPACITY = 0.2;
  const INITIAL_FILL_COLOR = '#005512';
  const INITIAL_LINE_COLOR = '#000000';

  const [defColor] = useColor('hex', INITIAL_FILL_COLOR);

  const mapContainer = useRef<any>();
  const [color, setColor] = useColor('hex', INITIAL_FILL_COLOR);
  const [initialLineColor] = useColor('hex', INITIAL_LINE_COLOR);

  const [lng, setLng] = useState(28.33);
  const [lat, setLat] = useState(-15.44);
  const [zoom, setZoom] = useState(10);
  const [showUserDefineLayerSelector, setShowUserDefineLayerSelector] = useState(false);

  const hoverPopup = useRef<Popup>(
    new Popup({
      closeOnClick: false,
      closeButton: false,
      offset: 20
    })
  );
  const [showMapControls, setShowMapControls] = useState<boolean>(true);
  const [showUserDefinedLayerStyle, setShowUserDefinedLayerStyle] = useState<Boolean>(false);
  const [parentMapStateData, setParentMapStateData] = useState<PlanningParentLocationResponse>();

  const [showStats, setShowStats] = useState(true);
  const [userDefinedLayers, setUserDefinedLayers] = useState<
    {
      layer: string;
      key: string;
      geo: string;
      layerName: string;
      active: boolean;
      col: Color;
      tagList?: Set<any>;
      selectedTag?: string;
      transparency?: number;
      size?: number;
      lineWidth?: number;
      lineColor?: string;
    }[]
  >([]);
  const [userDefinedNames, setUserDefinedNames] = useState<
    {
      layer: string;
      key: string;
      layerName: string;
      active: boolean;
      col: Color;
      tagList?: Set<any>;
      selectedTag?: string;
    }[]
  >([]);

  const [showMapDrawnModal, setShowMapDrawnModal] = useState(false);

  const [markedMapBoxFeatures, setMarkedMapBoxFeatures] = useState<Feature<Polygon | MultiPolygon, Properties>[]>([]);
  const mapBoxDraw = useRef<MapboxDraw>();
  const [drawnMapLevel, setDrawnMapLevel] = useState<string>();
  const [shouldApplyToChildren, setShouldApplyToChildren] = useState(true);
  const [shouldApplyToAll, setShouldApplyToAll] = useState(false);
  const [selectedUserDefinedLayer, setSelectedUserDefinedLayer] = useState<
    { key: string; col: Color; transparency?: number; lineColor: Color } | undefined
  >();
  const [showUserDefinedSettingsPanel, setShowUserDefinedSettingsPanel] = useState(false);
  const getLineParameters = (level: string) => {
    let newlevel = level
      .split('-')
      .filter((item, index) => index > 0)
      .join('-');
    if (lineParameters[newlevel]) {
      return lineParameters[newlevel];
    } else {
      return { col: 'black', num: 1, offset: 0 };
    }
  };

  const getTransparencyValue = (
    value: {
      layer: string;
      key: string;
      geo: string;
      layerName: string;
      active: boolean;
      col: Color;
      tagList?: Set<any>;
      selectedTag?: string;
      transparency?: number;
    }[],
    selectedValue: { key: string; col: Color; transparency?: number } | undefined
  ) => {
    let transparency = 10;
    if (value) {
      const filterElement = value.filter(userDefinedLayer => userDefinedLayer.layerName === selectedValue?.key)[0];
      if (filterElement && filterElement.transparency !== undefined && filterElement.transparency !== null) {
        transparency = filterElement.transparency;
      }
    }
    return transparency;
  };

  const getLineWidthValue = (
    value: {
      layer: string;
      key: string;
      geo: string;
      layerName: string;
      active: boolean;
      col: Color;
      tagList?: Set<any>;
      selectedTag?: string;
      transparency?: number;
      lineWidth?: number;
    }[],
    selectedValue: { key: string; col: Color; transparency?: number } | undefined
  ) => {
    let lineWidth = 1;
    if (value) {
      const filterElement = value.filter(userDefinedLayer => userDefinedLayer.layerName === selectedValue?.key)[0];
      if (filterElement && filterElement.lineWidth !== undefined && filterElement.lineWidth !== null) {
        lineWidth = filterElement.lineWidth;
      }
    }
    return lineWidth;
  };

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
    map.current = initSimulationMap(mapContainer, [lng, lat], zoom, 'bottom-left', undefined, e => {
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

    map.current.addControl(mapBoxDraw.current, 'bottom-left');

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

  useEffect(() => {
    if (toLocation && map && map.current) map.current?.fitBounds(toLocation);
  }, [toLocation, map]);

  useEffect(() => {
    if (chunkedData) {
      if (
        chunkedData?.features.length > 0 &&
        (!chunkedData?.parents ||
          chunkedData?.parents.length === 0 ||
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

                  // 'fill-color': [
                  //   'case',
                  //   ['>', ['length', ['get', 'metadata']], 0],
                  //   ['case', ['==', ['get', 'selectedColor'], null], geoColor.hex, ['get', 'selectedColor']],
                  //   ['all', ['==', ['get', 'selectedTagValue'], null], ['!=', ['get', 'selectedTag'], null]],
                  //   'black',
                  //   ['<', ['get', 'selectedTagValue'], 0],
                  //   geoColor.hex,
                  //   ['==', ['get', 'selectedTagValue'], 0],
                  //   geoColor.hex,
                  //   ['get', 'selectedColor']
                  // ],
                  'fill-opacity': [
                    'case',

                    ['all', ['==', ['get', 'selectedTag'], null], ['==', ['get', 'selectedColor'], null]],
                    0.1,
                    ['any', ['==', ['get', 'selectedTagValue'], null], ['==', ['get', 'selectedTagValue'], 0]],
                    0,
                    ['/', ['get', 'selectedTransparency'], 100]
                    // ['all', ['==', ['get', 'selectedTagValue'], null], ['<=', ['length', ['get', 'metadata']], 0]],
                    // 0,
                    // ['==', ['get', 'selectedTagValue'], 0],
                    // 0,
                    // ['==', ['get', 'selectedTransparency'], null],
                    // 0,
                    // ['/', ['get', 'selectedTransparency'], 100]
                  ]
                }
              },
              finalLayer.concat('-line')
            );
          }

          // if (!map.current?.getLayer(finalLayer.concat('-fill-extrusion'))) {
          //   map.current?.addLayer(
          //     {
          //       id: finalLayer.concat('-fill-extrusion'),
          //       type: 'fill-extrusion',
          //       source: finalLayer,
          //       filter: ['!=', ['geometry-type'], 'Point'],
          //       paint: {
          //         'fill-extrusion-color': [
          //           'case',
          //           ['==', ['get', 'selectedTagValue'], null],
          //           geoColor.hex,
          //           ['<', ['get', 'selectedTagValue'], 0],
          //           geoColor.hex,
          //           ['==', ['get', 'selectedTagValue'], 0],
          //           geoColor.hex,
          //           ['get', 'selectedColor']
          //         ],
          //         'fill-extrusion-base': 0,
          //         'fill-extrusion-height': [
          //           'case',
          //           ['==', ['get', 'selectedTagValuePercent'], null],
          //           0,
          //           ['<', ['get', 'selectedTagValuePercent'], 0],
          //           0,
          //           ['==', ['get', 'selectedTagValuePercent'], 0],
          //           0,
          //           ['*', ['get', 'selectedTagValuePercent'], 10000]
          //         ],
          //         'fill-extrusion-opacity': 1
          //       }
          //     },
          //     finalLayer.concat('-line')
          //   );
          // }

          // if (!map.current?.getLayer(finalLayer.concat('-null-symbol'))) {
          //   map.current?.loadImage(logo, (error: any, image: any) => {
          //     map.current?.addImage('store-icon', image);
          //     map.current?.addLayer(
          //       {
          //         id: finalLayer.concat('-null-symbol'),
          //         type: 'symbol',
          //         filter: ['==', ['get', 'selectedTagValue'], null],
          //         source: finalLayer.concat('-centers'),
          //         layout: {
          //           'text-field': [
          //             'format',
          //             ['get', 'name'],
          //             {
          //               'text-font': ['literal', ['Open Sans Bold', 'Open Sans Semibold']]
          //             }
          //           ],
          //           'text-size': ['interpolate', ['linear'], ['zoom'], 5, 5, 7, 10, 10, 12, 18, 20],
          //           'text-anchor': 'top',
          //           'text-justify': 'center',
          //           'icon-image': 'store-icon',
          //           'icon-size': 0.1,
          //           'icon-anchor': 'bottom'
          //         },
          //         paint: {
          //           'icon-color': ['case', ['==', ['get', 'selectedColor'], null], 'blue', 'red']
          //         }
          //       },
          //       finalLayer.concat('-line')
          //     );
          //   });
          // }
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

  const getProcessedUserDefinedLayers = (
    userDefinedLayers: {
      layer: string;
      key: string;
      geo: string;
      layerName: string;
      active: boolean;
      col: Color;
      size?: number;
    }[]
  ): {
    list:
      | { layer: string; key: string; geo: string; layerName: string; active: boolean; col: Color; size?: number }[]
      | undefined;
    key: string;
    color: Color;
  }[] => {
    let processedUserDefinedLayerSet = new Map<
      string,
      { layer: string; key: string; geo: string; layerName: string; active: boolean; col: Color; size?: number }[]
    >();
    userDefinedLayers.forEach(layer => {
      let arr;
      let arr2: {
        layer: string;
        key: string;
        geo: string;
        layerName: string;
        active: boolean;
        col: Color;
        size?: number;
      }[] = [];
      if (processedUserDefinedLayerSet.has(layer.layerName) && processedUserDefinedLayerSet.get(layer.layerName)) {
        arr = processedUserDefinedLayerSet.get(layer.layerName);
        if (arr) {
          arr.forEach(item => arr2.push(item));
        }
      }

      arr2.push(layer);
      processedUserDefinedLayerSet.set(layer.layerName, arr2);
    });

    const map1 = Array.from(processedUserDefinedLayerSet.keys())
      .filter(key => processedUserDefinedLayerSet.has(key))
      .map((key: string) => {
        let col: Color = defColor;
        // @ts-ignore
        let item = processedUserDefinedLayerSet.get(key) ? processedUserDefinedLayerSet.get(key)[0] : undefined;
        if (item) {
          col = item.col;
        }
        return {
          key: key,
          list: processedUserDefinedLayerSet.get(key),
          color: col
        };
      });
    return map1;
  };

  const getProcessedUserDefinedLayersReact = useCallback((): {
    list:
      | {
          layer: string;
          key: string;
          geo: string;
          layerName: string;
          active: boolean;
          col: Color;
          size?: number;
          tagList?: Set<any>;
        }[]
      | undefined;
    key: string;
    color: Color;
  }[] => {
    let processedUserDefinedLayerSet = new Map<
      string,
      { layer: string; key: string; geo: string; layerName: string; active: boolean; col: Color; size?: number }[]
    >();

    userDefinedLayers.forEach(layer => {
      let arra;
      let arr2: {
        layer: string;
        key: string;
        geo: string;
        layerName: string;
        active: boolean;
        col: Color;
        size?: number;
        tagList?: Set<any>;
      }[] = [];
      if (processedUserDefinedLayerSet.has(layer.layerName) && processedUserDefinedLayerSet.get(layer.layerName)) {
        arra = processedUserDefinedLayerSet.get(layer.layerName);
        if (arra) {
          arra.forEach(item => arr2.push(item));
        }
      }

      arr2.push(layer);
      processedUserDefinedLayerSet.set(layer.layerName, arr2);
    });

    const map1 = Array.from(processedUserDefinedLayerSet.keys())
      .filter(key => processedUserDefinedLayerSet.has(key))
      .map((key: string) => {
        let col: Color = defColor;
        // @ts-ignore
        let item = processedUserDefinedLayerSet.get(key) ? processedUserDefinedLayerSet.get(key)[0] : undefined;
        if (item) {
          col = item.col;
        }
        return {
          key: key,
          list: processedUserDefinedLayerSet.get(key),
          color: col
        };
      });
    return map1;
  }, [userDefinedLayers, defColor]);

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
              sourceData.features.forEach(feature => {
                updateFeaturesWithTagStatsAndColorAndTransparency(
                  feature,
                  tagStats,
                  userDefinedLayer.selectedTag,
                  'selectedTagValuePercent',
                  'selectedTagValue',
                  'selectedTag',
                  'selectedColor',

                  selectedUserDefinedLayer.col
                );
              });
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
            fillSourceData.features.forEach(feature => {
              updateFeaturesWithTagStatsAndColorAndTransparency(
                feature,
                tagStats,
                userDefinedLayer.selectedTag,
                'selectedTagValuePercent',
                'selectedTagValue',
                'selectedTag',
                'selectedColor',

                selectedUserDefinedLayer.col
              );
            });

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

  const updateFeaturesWithTagStatsAndColorAndTransparency = (
    feature: RevealFeature | Feature<Point | MultiPolygon | Polygon>,
    tagStats: any,
    tag: string | undefined,
    percentageField: string,
    valueField: string,
    tagField: string,
    colorField: string,
    color: Color
  ) => {
    if (feature) {
      feature.properties?.metadata?.forEach((element: any) => {
        if (feature?.properties) {
          if (tag) {
            feature.properties[tagField] = element.type;
            if (element.type === tag && tagStats.max && tagStats.max[tag]) {
              delete feature.properties['reachedMax'];
              if (!(element.value >= 0x10000000000000000 || element.value < -0x10000000000000000)) {
                feature.properties[valueField] = element.value;
              } else {
                feature.properties['reachedMax'] = 'true';
              }

              let percentage: any;
              if (element.value < 0) {
                percentage = (-1 * element.value) / (-1 * tagStats.min[tag]);
              } else {
                percentage = element.value / tagStats.max[tag];
              }

              feature.properties[percentageField] = percentage;

              if (!(tagStats.min[tag] >= 0x10000000000000000 || tagStats.min[tag] < -0x10000000000000000)) {
                feature.properties.selectedTagValueMin = tagStats.min[tag];
              }

              if (!(tagStats.max[tag] >= 0x10000000000000000 || tagStats.max[tag] < -0x10000000000000000)) {
                feature.properties.selectedTagValueMax = tagStats.min[tag];
              }

              let [h, s, v] = hex.hsv(color.hex);
              const colorField1 = s * feature.properties[percentageField];

              let hexVal = hsv.hex([h, colorField1, v]);

              feature.properties[colorField] = '#'.concat(hexVal);
            }
          } else {
            delete feature.properties[valueField];
            delete feature.properties[tagField];
            delete feature.properties[percentageField];
            delete feature.properties.selectedTagValueMin;
            delete feature.properties.selectedTagValueMax;
            delete feature.properties[colorField];
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
          feature['properties'][tagField] = tag;
        }
      }
    }
    return feature;
  };

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

  // useEffect(() => {
  //   setUserDefinedLayers(userDefinedLayers => {
  //     let newUserDefinedLayers: {
  //       layer: string;
  //       key: string;
  //       geo: string;
  //       layerName: string;
  //       active: boolean;
  //       col: Color;
  //       tagList?: Set<any>;
  //       selectedTag?: string;
  //       transparency?: number;
  //       lineColor?: string;
  //     }[] = [];
  //     userDefinedLayers.forEach(userDefinedLayer => {
  //       if (selectedUserDefinedLayer && userDefinedLayer.layerName === selectedUserDefinedLayer.key) {
  //         userDefinedLayer.lineColor = color.hex;
  //       }
  //
  //       newUserDefinedLayers.push(userDefinedLayer);
  //     });
  //     return newUserDefinedLayers;
  //   });
  // }, [color, selectedUserDefinedLayer]);

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
              {userDefinedLayers.length > 0 && (
                <div style={{ paddingTop: '1em' }}>
                  <Button
                    style={{ width: '75px', fontSize: 'smaller' }}
                    onClick={() => setShowUserDefinedLayerStyle(!showUserDefinedLayerStyle)}
                    className="rounded"
                    size="sm"
                    variant="success"
                  >
                    {(showUserDefinedLayerStyle ? 'Hide' : '') + ' Result Sets'}{' '}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {showMapControls && (
          <div>
            {showUserDefinedLayerStyle && userDefinedLayers.length > 0 && (
              <Draggable>
                <div style={{ float: 'left' }} className="sidebar-adjust-list text-dark bg-light p-2 rounded">
                  <p
                    className="lead mb-1"
                    onClick={() => {
                      setShowUserDefineLayerSelector(!showUserDefineLayerSelector);
                    }}
                  >
                    ResultSets{' '}
                    {showUserDefineLayerSelector ? (
                      <FontAwesomeIcon className="ms-2" icon="sort-up" />
                    ) : (
                      <FontAwesomeIcon className="ms-2" icon="sort-down" />
                    )}
                  </p>

                  {showUserDefineLayerSelector && (
                    <div>
                      {getProcessedUserDefinedLayers(userDefinedLayers).map(layerObj => {
                        return (
                          <Accordion flush>
                            <Accordion.Item eventKey={layerObj.key}>
                              <Accordion.Header>
                                <>
                                  <div>{layerObj.key}</div>
                                  <div
                                    className={'mx-4'}
                                    style={{
                                      width: '30px',
                                      height: '15px', //, backgroundColor: layerObj.color
                                      background: getBackgroundStyle(layerObj.color.rgb)
                                    }}
                                  />
                                </>
                              </Accordion.Header>
                              <Accordion.Body>
                                <>
                                  {layerObj?.list?.map(layer => {
                                    return (
                                      <Form.Check
                                        key={layer.key}
                                        label={
                                          <p className="figure-caption mb-1" onContextMenu={() => alert('hello')}>
                                            {layer.geo}
                                          </p>
                                        }
                                        value={layer.layer}
                                        type="checkbox"
                                        checked={layer.active}
                                        onChange={e => {
                                          setUserDefinedLayers(layerItems => {
                                            let newItems: {
                                              layer: string;
                                              active: boolean;
                                              layerName: string;
                                              geo: string;
                                              key: string;
                                              col: Color;
                                            }[] = [];
                                            layerItems.forEach(newItem => {
                                              newItems.push(newItem);
                                            });
                                            let item = newItems.find(layerItem => layerItem.layer === layer.layer);
                                            if (item) {
                                              item.active = e.target.checked;
                                            }
                                            return newItems;
                                          });
                                        }}
                                      />
                                    );
                                  })}
                                  <hr />
                                  <FormGroup>
                                    <Button
                                      className={'mx-2'}
                                      size={'sm'}
                                      onClick={() => {
                                        setShowUserDefinedSettingsPanel(
                                          !showUserDefinedSettingsPanel ||
                                            selectedUserDefinedLayer?.key !== layerObj.key
                                        );
                                        if (selectedUserDefinedLayer?.key !== layerObj.key) {
                                          setSelectedUserDefinedLayer({
                                            key: layerObj.key,
                                            col: layerObj.color,
                                            lineColor: selectedUserDefinedLayer
                                              ? selectedUserDefinedLayer.lineColor
                                              : initialLineColor
                                          });
                                          setColor(layerObj.color);
                                        }
                                      }}
                                    >
                                      <FontAwesomeIcon icon={'cog'} inverse />
                                    </Button>
                                    <Form.Label>
                                      {!showUserDefinedSettingsPanel || selectedUserDefinedLayer?.key !== layerObj.key
                                        ? ''
                                        : 'Hide '}
                                      Settings
                                    </Form.Label>
                                  </FormGroup>
                                </>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Draggable>
            )}

            {showUserDefinedSettingsPanel && analysisLayerDetails.length > 0 && selectedUserDefinedLayer && (
              <div style={{ float: 'left' }} className="sidebar-adjust-list text-dark bg-light p-2 rounded">
                <p className="lead mb-1">Settings - {selectedUserDefinedLayer.key}</p>

                <div
                  className={'mx-4'}
                  style={{
                    width: 'auto',
                    height: '15px', //, backgroundColor: layerObj.color
                    background: getBackgroundStyle(selectedUserDefinedLayer.col.rgb)
                  }}
                />

                <div>
                  {userDefinedNames
                    ?.filter(layer => layer.layerName === selectedUserDefinedLayer.key)
                    .map(layer => (
                      <>
                        <Form.Select
                          style={{ display: 'inline-block' }}
                          value={layer.selectedTag}
                          className={'my-2'}
                          onChange={e => {
                            setUserDefinedNames(userDefinedNames => {
                              let newUserDefinedNames: {
                                layer: string;
                                key: string;
                                layerName: string;
                                active: boolean;
                                col: Color;
                                tagList?: Set<any>;
                                selectedTag?: string;
                              }[] = [];
                              userDefinedNames.forEach(userDefinedName => {
                                if (userDefinedName.layerName === layer.layerName) {
                                  userDefinedName.selectedTag = e.target.value;
                                }
                                newUserDefinedNames.push(userDefinedName);
                              });
                              return newUserDefinedNames;
                            });
                            setUserDefinedLayers(userDefinedLayers => {
                              let newUserDefinedNames: {
                                layer: string;
                                key: string;
                                geo: string;
                                layerName: string;
                                active: boolean;
                                col: Color;
                                tagList?: Set<any>;
                                selectedTag?: string;
                              }[] = [];
                              userDefinedLayers.forEach(userDefinedName => {
                                if (userDefinedName.layerName === layer.layerName) {
                                  userDefinedName.selectedTag = e.target.value;
                                }
                                newUserDefinedNames.push(userDefinedName);
                              });
                              return newUserDefinedNames;
                            });
                          }}
                        >
                          <option value={''}>Select Metadata Tag...</option>
                          {layer.tagList &&
                            Array.from(layer.tagList).map(metaDataItem => {
                              return (
                                <option key={metaDataItem} value={metaDataItem}>
                                  {metaDataItem}
                                </option>
                              );
                            })}
                        </Form.Select>
                      </>
                    ))}
                </div>
                <b>Opacity ({getTransparencyValue(userDefinedLayers, selectedUserDefinedLayer)})</b>
                <Form.Range
                  min={0}
                  max={100}
                  value={getTransparencyValue(userDefinedLayers, selectedUserDefinedLayer)}
                  onChange={e => {
                    setUserDefinedLayers(userDefinedLayers => {
                      let newUserDefinedLayers: {
                        layer: string;
                        key: string;
                        geo: string;
                        layerName: string;
                        active: boolean;
                        col: Color;
                        tagList?: Set<any>;
                        selectedTag?: string;
                        transparency?: number;
                      }[] = [];
                      userDefinedLayers.forEach(userDefinedLayer => {
                        if (userDefinedLayer.layerName === selectedUserDefinedLayer.key) {
                          userDefinedLayer.transparency = Number(e.target.value);
                        }

                        newUserDefinedLayers.push(userDefinedLayer);
                      });
                      return newUserDefinedLayers;
                    });
                  }}
                />

                {false && (
                  <Accordion flush>
                    <Accordion.Item eventKey={'lineControl'}>
                      <Accordion.Header>Line Control</Accordion.Header>
                      <Accordion.Body>
                        <b>Line Width ({getLineWidthValue(userDefinedLayers, selectedUserDefinedLayer)})</b>
                        <Form.Range
                          min={0}
                          max={10}
                          value={getLineWidthValue(userDefinedLayers, selectedUserDefinedLayer)}
                          onChange={e => {
                            setUserDefinedLayers(userDefinedLayers => {
                              let newUserDefinedLayers: {
                                layer: string;
                                key: string;
                                geo: string;
                                layerName: string;
                                active: boolean;
                                col: Color;
                                tagList?: Set<any>;
                                selectedTag?: string;
                                transparency?: number;
                                lineWidth?: number;
                              }[] = [];
                              userDefinedLayers.forEach(userDefinedLayer => {
                                if (userDefinedLayer.layerName === selectedUserDefinedLayer?.key) {
                                  userDefinedLayer.lineWidth = Number(e.target.value);
                                }

                                newUserDefinedLayers.push(userDefinedLayer);
                              });
                              return newUserDefinedLayers;
                            });
                          }}
                        />

                        <ColorPicker
                          width={fullScreen ? 287 : 190}
                          color={color}
                          onChange={color => {
                            setUserDefinedLayers(userDefinedLayers => {
                              let newUserDefinedLayers: {
                                layer: string;
                                key: string;
                                geo: string;
                                layerName: string;
                                active: boolean;
                                col: Color;
                                tagList?: Set<any>;
                                selectedTag?: string;
                                transparency?: number;
                                lineColor?: string;
                              }[] = [];
                              userDefinedLayers.forEach(userDefinedLayer => {
                                if (
                                  selectedUserDefinedLayer &&
                                  userDefinedLayer.layerName === selectedUserDefinedLayer.key
                                ) {
                                  userDefinedLayer.lineColor = color.hex;
                                }

                                newUserDefinedLayers.push(userDefinedLayer);
                              });
                              return newUserDefinedLayers;
                            });

                            setSelectedUserDefinedLayer(selectedUserDefinedLayer => {
                              if (selectedUserDefinedLayer) {
                                return {
                                  key: selectedUserDefinedLayer?.key,
                                  col: selectedUserDefinedLayer.col,
                                  transparency: selectedUserDefinedLayer.transparency,
                                  lineColor: color
                                };
                              } else {
                                return undefined;
                              }
                            });

                            setColor(color);
                          }}
                          hideHEX={true}
                          hideHSV={true}
                          hideRGB={true}
                        />
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                )}

                {/*</OffcanvasBody>*/}
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
            {fullScreen ? 'Show Controls' : 'Full Screen'}
          </Button>
        </div>
      </div>
      {/* enable when needed by setting false to true */}

      {userDefinedLayers && userDefinedLayers.length > 0 && (
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
          onClick={() => {
            if (!showStats) {
              setShowStats(!showStats);
            }
          }}
        >
          {userDefinedLayers.length && !showStats && 'Show Stats'}
          <Tabs unmountOnExit={true}>
            {showStats &&
              getProcessedUserDefinedLayersReact()?.map(userDefinedLayer => {
                return (
                  <Tab unmountOnExit={true} eventKey={userDefinedLayer.key} title={userDefinedLayer.key}>
                    <>
                      {userDefinedLayer &&
                        userDefinedLayer.list &&
                        userDefinedLayer.list.map(item => (
                          <p key={item.key}>
                            <b>{item.geo}:</b> {item.size}
                          </p>
                        ))}

                      {userDefinedNames &&
                        userDefinedNames
                          .filter(layer => layer.key === userDefinedLayer.key)

                          .map(locItem => {
                            return Array.from(locItem.tagList ? locItem.tagList : new Set<any>())
                              .filter((meta: any) => {
                                let tagItem = entityTags.filter(tag => tag.tag === meta);
                                if (tagItem && tagItem[0]) {
                                  return tagItem[0].simulationDisplay;
                                }
                                return false;
                              })
                              .filter((meta: any) => stats[userDefinedLayer.key] && stats[userDefinedLayer.key][meta])
                              .map((meta: any) => (
                                <p key={meta}>
                                  <b>{meta}:</b> {stats[userDefinedLayer.key] ? stats[userDefinedLayer.key][meta] : ''}
                                </p>
                              ));
                          })}
                    </>
                  </Tab>
                );
              })}
          </Tabs>
          {showStats && (
            <Button variant={'secondary'} size={'sm'} onClick={() => setShowStats(!showStats)}>
              {showStats ? 'Close' : 'Open'}
            </Button>
          )}
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

      <div id="mapContainer" ref={mapContainer} style={{ height: fullScreen ? '95vh' : '75vh', width: '100%' }} />
    </Container>
  );
};
export default SimulationMapView;
