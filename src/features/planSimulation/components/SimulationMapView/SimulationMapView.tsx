import { EventData, Expression, GeoJSONSource, MapLayerEventType, Popup } from 'mapbox-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import locationTag from '../../../../assets/svgs/placeMarker.svg';
import tagIcon from '../../../../assets/svgs/tag-2.svg';

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

import * as turf from '@turf/turf';
import { AddLayer, DrawPolygonsFeature, DrawPolygonsFeatureCollection } from './Helper/MapInteractionsHelper';

// CONTEXT
import { SelectedPolygon, usePolygonContext } from '../../../../contexts/PolygonContext';
import MultiselectList from '../MultiselectList/MultiselectList';
import Accordion from '../../../location/components/accordion/Accordion';
import TargetsSelectedList from '../TargetsSelectedList/TargetsSelectedList';
import MapLegend from './components/MapLegend/MapLegend';

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
  currentLocationChildren,
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

  const polygonClickPopup = useRef<Popup>(
    new Popup({
      closeOnClick: false,
      closeButton: false,
      offset: 20,
      className: styles.paragraphPopup
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

  const [mapZoomLevel, setMapZoomLevel] = useState<number>();
  // SELECTIONS ON MAP
  const [singleSelected, setSingleSelected] = useState<any>(null);
  const [multiSelected, setMultiSelected] = useState<any[]>([]);

  const [singleSelectedColor, setSingleSelectedColor] = useState('rgba(3, 166, 13, 1)');
  const [multiSelectedColor, setMultiSelectedColor] = useState('rgba(0, 0, 102, 1)');

  const [datasets, setDatasets] = useState<any>();
  const [datasetsDataMap, setDatasetsDataMap] = useState<any>({});
  // CONTEXT
  const { dispatch } = usePolygonContext();
  const { state } = usePolygonContext();
  const selectedState = state.selected;
  const multiselectState = state.multiselect;

  useMemo(() => {
    setSingleSelected(selectedState?.id ?? null);
    setMultiSelected(multiselectState as any[]);
  }, [selectedState, multiselectState]);

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

  useEffect(() => {
    if (map && map.current) {
      map.current.on('zoom', () => {
        setMapZoomLevel(map.current?.getZoom());
      });
    }
  }, [map, map.current]);

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
        trash: false,
        polygon: false,
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

  useEffect(() => {
    if (currentLocationChildren) {
      const groupedById: any = {};
      currentLocationChildren.forEach((location: any) => {
        location.properties?.metadata?.forEach((meta: any) => {
          if (!groupedById[meta.datasetId]) {
            groupedById[meta.datasetId] = [];
          }
          groupedById[meta.datasetId].push({
            type: 'Feature',
            properties: {
              locationId: location.identifier,
              value: meta.value,
              tagName: meta.type,
              id: meta.datasetId
            },
            geometry: location.geometry
          });
        });
      });
      setDatasetsDataMap(groupedById);
    }
  }, [currentLocationChildren]);

  useEffect(() => {
    if (datasetsDataMap) {
      Object.entries(datasetsDataMap).forEach(([layerId, features]) => {
        const { maxValue, minValue } = (features as any[]).reduce(
          (acc, feature) => {
            const value = feature.properties?.value;
            if (typeof value === 'number' && !isNaN(value)) {
              acc.maxValue = acc.maxValue === undefined ? value : Math.max(acc.maxValue, value);
              acc.minValue = acc.minValue === undefined ? value : Math.min(acc.minValue, value);
            }
            return acc;
          },
          { maxValue: undefined, minValue: undefined }
        );

        dispatch({
          type: 'UPDATE_DATASET',
          payload: {
            datasetId: layerId,
            filter: {
              maxValue: maxValue,
              minValue: minValue
            }
          }
        });
      });
    }
  }, [datasetsDataMap]);

  useEffect(() => {
    if (datasetsDataMap && map && map.current && state.datasets && state.datasets.length !== 0) {
      const colors = generateColors(state.datasets);

      const layers = map.current?.getStyle().layers;
      const matchingLayers = layers?.filter(
        layer => layer.id.startsWith(`ds-`) && !layer.id.endsWith(selectedLoaction.properties.name)
      );
      matchingLayers?.forEach(layer => {
        if (map.current?.getLayer(layer.id)) {
          map.current?.removeLayer(layer.id);
        }
      });

      Object.entries(datasetsDataMap).forEach(([layerId, features]) => {
        const sourceId = `ds-${layerId}-${selectedLoaction.properties.name}`;
        if (!map.current?.getSource(sourceId)) {
          map.current?.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: features as any[]
            }
          });
        }

        const matchingDataset = state.datasets.find((d: any) => d.identifier === layerId);
        if (!matchingDataset && map.current?.getLayer(`ds-${layerId}-${selectedLoaction.properties.name}`)) {
          map.current?.removeLayer(`ds-${layerId}-${selectedLoaction.properties.name}`);
          return;
        }

        const fillColorConfig: Expression = [
          'case',
          ['==', ['literal', matchingDataset?.hidden], true],
          'transparent',
          ['<', ['get', 'value'], matchingDataset?.selectedRange?.minValue],
          'transparent',
          ['>', ['get', 'value'], matchingDataset?.selectedRange?.maxValue],
          'transparent',
          colors[layerId]
        ];

          const fillOpacityConfig: Expression | number =
          matchingDataset?.filter?.maxValue && matchingDataset.filter.maxValue > 0
            ? [
                'interpolate',
                ['linear'],
                ['get', 'value'],
                0, 0,
                matchingDataset.filter.maxValue, 1
              ]
            : 0; 

        if (map.current?.getLayer(`ds-${layerId}-${selectedLoaction.properties.name}`)) {
          map.current?.setPaintProperty(
            `ds-${layerId}-${selectedLoaction.properties.name}`,
            'fill-color',
            fillColorConfig
          );

          map.current?.setPaintProperty(
            `ds-${layerId}-${selectedLoaction.properties.name}`,
            'fill-opacity',
            fillOpacityConfig
          );
        } else {
          map.current?.addLayer({
            id: `ds-${layerId}-${selectedLoaction.properties.name}`,
            type: 'fill',
            source: sourceId,
            filter: ['==', ['get', 'id'], layerId],
            paint: {
              'fill-color': fillColorConfig,
              'fill-opacity': fillOpacityConfig
            }
          });
        }
      });

      if (map.current.getLayer('children-layer')) {
        map.current.moveLayer('children-layer');
      }
      if (map.current.getLayer('multi-selected-layer')) {
        map.current.moveLayer('multi-selected-layer');

      if(map.current.getLayer('target-areas-layer')) {
        map.current.moveLayer('target-areas-layer');
      }

      } if (map.current.getLayer('labels-layer')) {
        map.current.moveLayer('labels-layer');
      }
    }
    if (map && map.current && datasetsDataMap && Object.values(datasetsDataMap).length !== 0 && state.datasets && state.datasets.length === 0) {
      const layers = map.current?.getStyle().layers;
      const matchingLayers = layers?.filter(layer => layer.id.startsWith(`ds-`));
      matchingLayers?.forEach(layer => {
        if (map.current?.getLayer(layer.id)) {
          map.current?.removeLayer(layer.id);
        }
      });
    }
  }, [map, map.current, state.datasets, datasetsDataMap]);

  useEffect(() => {
    if (map && map.current && currentLocationChildren && selectedLoaction) {
      map.current?.fitBounds(JSON.parse(JSON.stringify(bbox(selectedLoaction.geometry))));

      // Add or update the "parent-source" {REFACTORED}
      DrawPolygonsFeature(map.current, selectedLoaction, 'parent');

      // Add or update the "children-source" {REFACTORED}

      DrawPolygonsFeatureCollection(map.current, currentLocationChildren, 'children');

      // Add or update the "parent-layer" {REFACTORED}
      AddLayer(map.current, 'parent', 'parent', {
        'fill-color': 'rgba(57, 62, 65, 0)',
        'fill-outline-color': 'rgba(57, 62, 65, 1)'
      });

      // Add or update the "children-layer" with individual polygon colors
      if (!map.current.getLayer('children-layer')) {
        // Add or update the "children-layer" {REFACTORED}
        const paintConfig = {
          'fill-color': [
            'case',
            ['==', ['get', 'id'], singleSelected],
            singleSelectedColor,
            'rgba(239, 239, 240, 0)' // Default color
          ],
          'fill-outline-color': 'rgba(255, 000, 000, 0.5)'
        };
        AddLayer(map.current, 'children', 'children', paintConfig);

        //! Add a new source for multi-selected polygons
        DrawPolygonsFeatureCollection(map.current, multiSelected, 'multi-selected');

        //! Add a new layer for multi-selected polygons
        AddLayer(map.current, 'multi-selected', 'multi-selected', {
          'fill-color': multiSelectedColor,
          'fill-outline-color': 'rgba(255, 0, 0, 1)'
        });

        map.current.on('click', 'children-layer', e => {
          const clickedFeature = e.features && e.features[0] ? e.features[0] : null;

          if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            dispatch({ type: 'TOGGLE_MULTISELECT', payload: clickedFeature });

            // Update multi-selected source data
            const updatedFeatures = multiSelected.map(feature => ({
              type: 'Feature',
              geometry: feature.geometry,
              properties: feature.properties
            }));
            (map.current?.getSource('multi-selected-source') as GeoJSONSource).setData({
              type: 'FeatureCollection',
              features: updatedFeatures.map(feature => ({
                ...feature,
                type: 'Feature'
              }))
            });
          } else {
            dispatch({ type: 'SELECT_SINGLE', payload: clickedFeature });

            if (map.current && clickedFeature) {
              const tagData = clickedFeature.properties?.metadata ? JSON.parse(clickedFeature.properties.metadata) : [];

              // let htmlText = `
              // <div class=${styles.popupWrapper}>
              //     <div class=${styles.popupHeadingContainer}>
              //       <img class=${styles.locationImage} src=${locationTag} alt="location" />
              //       <p>${clickedFeature.properties?.name}</p>
              //     </div>
              //       <p>Children Number: ${clickedFeature.properties?.childrenNumber ?? 'Not Available'}</p>
              //       ${tagData.length !== 0 ? `<hr/>` : ``}
              //     ${tagData
              //       .map(
              //         (tag: any) =>
              //           `<div>
              //           <div class=${styles.tagInfo}>
              //             <img class=${styles.tagIcon} src=${tagIcon} alt="tag" />
              //             <span>${tag.type}: ${Math.round(tag.value * 1000) / 1000}</span>
              //           </div>
              //         </div>`
              //       )
              //       .join('')}
              //   </div>`;
              let htmlText = `
      <div class=${styles.card}>
        <div class=${styles.header}>
          <img class=${styles.locationImage} src=${locationTag} alt="location" />
          <h2 class=${styles.title}>${clickedFeature.properties?.name}</h2>
        </div>
        
        <div class=${styles.content}>
          <div class=${styles.populationCard}>
            <div class=${styles.label}>Population</div>
            <div class=${styles.value}> ${clickedFeature.properties?.childrenNumber ?? 'Not Available'}</div>
            <div class=${styles.sublabel}>Children Number</div>
          </div>
          
          <div class=${styles.scoreContainer}>
                  ${tagData
                    .map(
                      (tag: any) =>
                        ` <div class=${styles.scoreItem}>
               <img class=${styles.tagIcon} src=${tagIcon} alt="tag" />
              <div class=${styles.scoreInfo}>
                <div class=${styles.scoreLabel}>
                 ${tag.type}
                </div>
                <div class=${styles.scoreValue} ${styles.scoreValueMax}>${Math.round(tag.value * 1000) / 1000}</div>
              </div>
            </div>`
                    )
                    .join('')}
                `;
              polygonClickPopup.current.setLngLat(e.lngLat).setHTML(htmlText).setOffset([150, -25]).addTo(map.current);
            }
          }
        });
      } else {
        map.current?.setPaintProperty('children-layer', 'fill-color', [
          'case',
          ['==', ['get', 'id'], singleSelected],
          singleSelectedColor,
          'rgba(57, 62, 65, 0.05)' // Default color
        ]);

        map.current?.setPaintProperty('children-layer', 'fill-opacity', [
          'case',
          ['==', ['get', 'id'], singleSelected],
          1,
          0.2
        ]);

        const updatedFeatures = multiSelected.map(feature => ({
          type: 'Feature',
          geometry: feature.geometry,
          properties: feature.properties
        }));
        (map.current?.getSource('multi-selected-source') as GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: updatedFeatures.map(feature => ({
            ...feature,
            type: 'Feature'
          }))
        });
      }

      addLabelsLayer();

      if (!selectedState) {
        polygonClickPopup.current.remove();
      }
    }
  }, [
    map,
    selectedState,
    currentLocationChildren,
    selectedLoaction,
    singleSelected,
    multiSelected,
    singleSelectedColor,
    multiSelectedColor,
    dispatch
  ]);

  useEffect(() => {
    if (map && map.current && currentLocationChildren && state.targetAreas && state.targetAreas.length !== 0) {
      DrawPolygonsFeatureCollection(map.current, state.targetAreas, 'target-areas');
      AddLayer(map.current, 'target-areas', 'target-areas', {
        'fill-color': 'red',
        'fill-outline-color': 'rgba(57, 62, 65, 1)'
      });

      const taLabelFeatures = state.targetAreas?.map(
        child => {
          const center = turf.centroid(child.geometry);
          return {
            type: 'Feature' as const,
            geometry: center.geometry,
            properties: {
              name: child.properties.name,
              geographicLevel: child.properties.geographicLevel,
              childrenNumber: child.properties.childrenNumber
            }
          };
        }
      );

      if (!map.current.getSource('ta-labels-source')) {
        map.current.addSource('ta-labels-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: taLabelFeatures
          }
        });
      } else {
        const taLabelsSource = map.current.getSource('ta-labels-source') as mapboxgl.GeoJSONSource;
        taLabelsSource.setData({
          type: 'FeatureCollection',
          features: taLabelFeatures
        });
      }

      if (!map.current.getLayer('ta-labels-layer') && ((mapZoomLevel || map.current.getZoom()) >= 8)) {
        map.current.addLayer({
          id: 'ta-labels-layer',
          type: 'symbol',
          source: 'ta-labels-source',
          layout: {
            'text-field': [
              'concat',
              ['get', 'name'],
              [
                'case',
                ['==', ['get', 'geographicLevel'], 'structure'],
                '',
                ['concat', ' (', ['to-string', ['get', 'childrenNumber']], ')']
              ]
            ],
            'text-size': 13,
            'text-anchor': 'center'
          },
          paint: {
            'text-color': [
              'case',
              ['in', ['get', 'name'], ['literal', multiSelected?.map(p => p.properties.name)]],
              '#FF0000', // Multi-selected label color
              '#000000' // Default color for other labels
            ],
            'text-halo-color': '#fff', // Black border color
            'text-halo-width': 2, // Width of the border
            'text-halo-blur': 1 // Optional: smooth edges
          }
        });
      } else if (map.current.getLayer('ta-labels-layer') && ((mapZoomLevel || map.current.getZoom()) < 8)) {
        map.current.removeLayer('ta-labels-layer');
      }
    }
  }, [state.targetAreas, map.current, currentLocationChildren, mapZoomLevel]);

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

  const addLabelsLayer = () => {
    if (map && map.current) {
      // Generate label data PARENT / SHILDREN
      const labelFeatures = (currentLocationChildren.length > 0 ? currentLocationChildren : [selectedLoaction]).map(
        child => {
          const center = turf.centroid(child.geometry); // Use turf.js to calculate the center
          return {
            type: 'Feature' as const,
            geometry: center.geometry,
            properties: {
              name: child.properties.name,
              geographicLevel: child.properties.geographicLevel,
              childrenNumber: child.properties.childrenNumber
            }
          };
        }
      );

      if (!map.current.getSource('labels-source')) {
        map.current.addSource('labels-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: labelFeatures
          }
        });
      } else {
        const labelsSource = map.current.getSource('labels-source') as mapboxgl.GeoJSONSource;
        labelsSource.setData({
          type: 'FeatureCollection',
          features: labelFeatures
        });
      }

      if (!map.current.getLayer('labels-layer')) {
        map.current.addLayer({
          id: 'labels-layer',
          type: 'symbol',
          source: 'labels-source',
          layout: {
            // Dynamically set the text field
            'text-field': [
              'concat',
              ['get', 'name'], // Name property
              [
                'case',
                ['==', ['get', 'geographicLevel'], 'structure'], // Condition for 'structure'
                '',
                ['concat', ' (', ['to-string', ['get', 'childrenNumber']], ')'] // Append childrenNumber if not 'structure'
              ]
            ],
            'text-size': 13,
            'text-anchor': 'center'
          },
          paint: {
            // 'text-color': '#000', // White font color
            'text-color': [
              'case',
              ['in', ['get', 'name'], ['literal', multiSelected.map(p => p.properties.name)]],
              '#FF0000', // Multi-selected label color
              '#000000' // Default color for other labels
            ],
            'text-halo-color': '#fff', // Black border color
            'text-halo-width': 2, // Width of the border
            'text-halo-blur': 1 // Optional: smooth edges
          }
        });
      }
    }
  };

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

      {/* MULTISELECTED POLYGONS LIST */}
      {multiselectState.length > 0 && <TargetsSelectedList />}
      {/* MAP LEGEND */}
      <MapLegend />
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

const generateColors = (datasets: any[]) => {
  return datasets.reduce((acc, dataset) => {
    acc[dataset.identifier] = dataset.hexColor;
    return acc;
  }, {});
};
