import { Expression, GeoJSONSource, LngLatBounds, Map, Popup } from 'mapbox-gl';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { MAPBOX_STYLE_STREETS } from '../../../../constants';
import {
  disableMapInteractions,
  fitCollectionToBounds,
  getFeatureCentresFromLocation,
  getGeoListFromMapData,
  getMetadataListFromMapData,
  getTagStats,
  getTagStatsByTag,
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
import { Feature, MultiPolygon, Point, Polygon } from '@turf/turf';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
  resultsLoadingState: 'notstarted' | 'started' | 'complete';
  parentsLoadingState: 'notstarted' | 'started' | 'complete';
}

interface PlanningLocationResponseGeoContainer {
  key: string;
  data: PlanningLocationResponse;
}

const SimulationMapView = ({
  fullScreenHandler,
  fullScreen,
  mapData,
  toLocation,
  openModalHandler,
  entityTags,
  parentMapData,
  setMapDataLoad,
  chunkedData,
  updateLevelsLoaded,
  resetMap,
  setResetMap,
  resultsLoadingState,
  parentsLoadingState
}: Props) => {
  const INITIAL_HEAT_MAP_RADIUS = 50;
  const INITIAL_HEAT_MAP_OPACITY = 0.2;
  const INITIAL_FILL_COLOR = '#005512';

  const mapContainer = useRef<any>();
  const map = useRef<Map>();
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

  useEffect(() => {
    if (map.current) return;
    initializeMap();
  });

  useEffect(() => {
    if (map.current) {
      if (
        (resultsLoadingState === 'notstarted' || resultsLoadingState === 'complete') &&
        (parentsLoadingState === 'notstarted' || parentsLoadingState === 'complete')
      ) {
        disableMapInteractions(map.current, false);
      } else {
        disableMapInteractions(map.current, true);
      }
    }
  }, [resultsLoadingState, parentsLoadingState]);

  const testfile = useCallback(
    (e: any) => {
      let file: File = e.target.files[0];
      const reader = new FileReader();
      let data: any;
      reader.addEventListener('load', e => {
        data = e.target?.result;
        console.log(data);
        let jsData = JSON.parse(data);

        let props = jsData.hits.hits.map((hit: any) => {
          let featureObj = {
            type: 'Feature',
            properties: {
              name: hit._source.name,
              metadata: [],
              geographicLevel: hit._source.level,
              externalId: hit._source.externalId
            },
            geometry: hit._source.geometry
          };
          let meta = hit._source.metadata.map((meta: any) => {
            return {
              type: meta.tag,
              value: meta.valueNumber
            };
          });
          featureObj.properties.metadata = meta;
          return featureObj;
        });

        let upplaodMap: PlanningLocationResponse | undefined = {
          type: 'FeatureCollection',
          features: props,
          parents: [],
          identifier: undefined
        };
        setMapDataLoad(upplaodMap);
      });
      reader.readAsText(file);
    },
    [setMapDataLoad]
  );

  const initializeMap = useCallback(() => {
    map.current = initSimulationMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS, e => {
      if (map.current) {
        new Popup({ focusAfterOpen: true, closeOnMove: true, closeButton: true })
          .setHTML(
            `<h4 class="bg-success text-center">Action menu</h4>
              <div class="m-0 p-0 text-center">
              <p>You have selected multiple locations.</p>
              <input type="file" id="simulationfile">
              <button class="btn btn-primary mx-2 mt-2 mb-4" style="min-width: 200px" id="simulationpopup" onclick="test">Upload</button>
              </div>`
          )
          .setLngLat(e.lngLat)
          .addTo(map.current);

        document.getElementById('simulationfile')?.addEventListener('change', e => testfile(e));
      }
    });
  }, [lng, lat, testfile, zoom]);

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
  }, [toLocation]);

  useEffect(() => {
    if (chunkedData) {
      if (chunkedData?.features.length > 0) {
        let geoListArr = getGeoListFromMapData(chunkedData);

        geoListArr.forEach(geo => {
          setGeographicLevelResultLayerIds(geoLayerList => {
            if (!geoLayerList.map(geoLayer => geoLayer.layer).includes(geo)) {
              geoLayerList.push({ layer: geo, active: true });
              console.log(geoLayerList);

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
                      'line-color': 'black',
                      'line-width': 4
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
                          'font-scale': 0.8,
                          'text-font': ['literal', ['Open Sans Bold', 'Open Sans Semibold']]
                        }
                      ],
                      'text-anchor': 'bottom',
                      'text-justify': 'center'
                    },
                    paint: {
                      'text-color': 'black',
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
  }, [selectedMetadata, selectedHeatMapMetadata, chunkedData, openModalHandler]);

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
  }, [selectedHeatMapMetadata, selectedMetadata, geographicLevelResultLayerIds]);

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
  }, [color, geographicLevelResultLayerIds]);

  useEffect(() => {
    geographicLevelResultLayerIds.forEach(geographicLevelResultLayerId => {
      showLayer(geographicLevelResultLayerId.active, geographicLevelResultLayerId.layer);
    });
  }, [geographicLevelResultLayerIds]);

  function addParentMapData(filteredData: PlanningParentLocationResponse) {
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
  }

  useEffect(() => {
    setParentMapStateData(parentMapData);
  }, [parentMapData]);

  useEffect(() => {
    if (parentMapStateData && parentMapStateData.features.length > 0) {
      addParentMapData(parentMapStateData);
    }
  }, [parentMapStateData]);

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
              feature.properties[percentageField] = percentage;

              feature.properties.selectedTagValueMin = tagStats.min[tag];
              feature.properties.selectedTagValueMax = tagStats.max[tag];
            }
          } else {
            delete feature.properties[valueField];
            delete feature.properties[tagField];
            delete feature.properties[percentageField];
            delete feature.properties.selectedTagValueMin;
            delete feature.properties.selectedTagValueMin;
          }
        }
      });
    }
    return feature;
  };

  const showLayer = (show: any, layer: string) => {
    if (map.current?.getLayer(layer.concat('-fill'))) {
      map.current?.setLayoutProperty(layer.concat('-fill'), 'visibility', show ? 'visible' : 'none');
      map.current?.setLayoutProperty(layer.concat('-line'), 'visibility', show ? 'visible' : 'none');
      map.current?.setLayoutProperty(layer.concat('-symbol'), 'visibility', show ? 'visible' : 'none');
      map.current?.setLayoutProperty(layer.concat('-points'), 'visibility', show ? 'visible' : 'none');
    }
  };

  const getMapDataSumsFromSource = (tag: string): any => {
    let sourceData: PlanningLocationResponse = {
      type: 'FeatureCollection',
      features: [],
      parents: [],
      identifier: undefined
    };

    let total = geographicLevelResultLayerIds
      .map(geoLevel => {
        if (map.current) {
          let sourceCentres: any = map.current.getSource(geoLevel.layer.concat('-centers'));
          sourceData.features = (sourceCentres._data as any)['features'];
          sourceData.parents = (sourceCentres._data as any)['parents'];
        }
        return getTagStatsByTag(sourceData, tag);
      })
      .reduce((total, newValue) => {
        if (newValue.sum[tag] !== null && newValue.sum[tag] !== undefined) {
          total += newValue.sum[tag];
        } else {
          total += 0;
        }
        return total;
      }, 0);
    return total;
  };

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
          <div
            style={{ right: '2%', bottom: '3%', position: 'absolute', zIndex: 2, width: '15%' }}
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
                  <p>
                    <b>{stateData.key}:</b> {stateData.data.features.length}
                  </p>
                );
              })}

            {showStats &&
              entityTags
                .filter(entityTag => entityTag.simulationDisplay)
                .map(entityTag => {
                  return (
                    <p>
                      <b>{entityTag.tag}:</b>
                      {getMapDataSumsFromSource(entityTag.tag)}
                    </p>
                  );
                })}
          </div>
        )}

      <div id="mapContainer" ref={mapContainer} style={{ height: fullScreen ? '95vh' : '75vh', width: '100%' }} />
      {/*<div id="mapContainer" ref={mapContainer} className={'vh-75'} />*/}
    </Container>
  );
};
export default SimulationMapView;
