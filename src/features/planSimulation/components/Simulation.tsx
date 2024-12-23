import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'simplebar/dist/simplebar.min.css';
import { ActionDialog } from '../../../components/Dialogs';
import { useWindowResize } from '../../../hooks/useWindowResize';
import { getGeneratedLocationHierarchyList, getLocationHierarchyList } from '../../location/api';
import { LocationHierarchyModel } from '../../location/providers/types';
import { evaluate, isNumeric, sum } from 'mathjs';
import simulationStyle from './Simulation.module.css';

import {
  getDataAssociatedEntityTags,
  getEntityList,
  getEventBasedEntityTags,
  getFullLocationsSSE,
  getLocationList,
  getLocationsSSE,
  submitSimulationRequest,
  updateSimulationRequest
} from '../api';
import {
  ComplexTagResponse,
  EntityTag,
  HierarchyType,
  LocationMetadataObj,
  Metadata,
  MetadataDefinition,
  OperatorSignEnum,
  PlanningLocationResponse,
  PlanningLocationResponseTagged,
  PlanningParentLocationResponse,
  RevealFeature,
  SearchLocationProperties
} from '../providers/types';
import FormField from './FormField/FormField';
import MultiFormField from './FormField/MultiFormField';
import SimulationModal from './SimulationModal';
import { MultiValue, SingleValue } from 'react-select';
import PeopleDetailsModal from './PeopleDetailsModal';
import { bbox, Feature, Geometry, MultiPolygon, Point, Polygon } from '@turf/turf';
import { LngLatBounds, Map as MapBoxMap } from 'mapbox-gl';
import SimulationResultExpandingTable from '../../../components/Table/SimulationResultExpandingTable';
import DownloadSimulationResultsModal from './modals/DownloadSimulationResultsModal';
import UploadSimulationData from './modals/UploadSimulationData';
import SearchResultCountModal from './modals/SearchResultCountModal';
import TableSummaryModal from './Summary/TableSummaryModal';
import SaveHierarchyModal from './modals/SaveHierarchyModal';
import SimulationMapView from './SimulationMapView/SimulationMapView';

import SimulationAnalysisPanel from './modals/SimulationAnalysisPanel';
import { Color } from 'react-color-palette';
import { hex } from 'color-convert';
import { REVEAL_SIMULATION_EDIT } from '../../../constants';
import AuthorizedElement from '../../../components/AuthorizedElement';
import { Drawer } from '../../location/components/drawer/Drawer';
import Accordion from '../../location/components/accordion/Accordion';
import { faUsers, faSitemap, faHouseUser, faDiceD20 } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

import Dashboard from '../components/Dashboard/Dashboard';

import DrawerButton from '../../../components/DrawerButton/DrawerButton';

import { CustomPopup } from '../../../components/CustomPopup/CustomPopup';
import DatasetsAccordion from '../../location/components/DatasetsAccordion/DatasetsAccordion';

import AddTargetAreaForm from './SimulationMapView/components/AddTargetAreaForm/AddTargetAreaForm';
import AddDatasetForm from './SimulationMapView/components/AddDatasetForm/AddDatasetForm';

import CampaignTotalsAccordion from './SimulationMapView/components/CampaignTotalsAccordion/CampaignTotalsAccordion';

import { getHierarchy, getHierarchyPolygon } from './SimulationMapView/api/hierarchyAPI';

library.add(faUsers, faSitemap, faHouseUser, faDiceD20);

interface SubmitValue {
  fieldIdentifier: string;
  fieldType: string;
  searchValue?: SearchValue;
  values?: SearchValue[];
  valueType: string;
  tag: string;
  range?: {
    minValue: number;
    maxValue: number;
  };
}

export interface AnalysisLayer {
  labelName: string;
  color: Color;
  colorHex: string;
}

interface SearchValue {
  value: string;
  sign: string;
}

export interface SimulationCountResponse {
  searchRequestId: string;
  countResponse: any;
  inactiveCountResponse: any;
}

export interface Stats {
  [key: string]: Metadata;
}

export interface StatsLayer {
  [layer: string]: Stats;
}

export interface SimulationRequestData {
  hierarchyIdentifier: string | undefined;
  hierarchyType: string | undefined;
  locationIdentifier: string | undefined;
  entityFilters: SubmitValue[];
  filterGeographicLevelList: string[] | undefined;
  inactiveGeographicLevelList: string[] | undefined;
  includeInactive: boolean;
}

export interface MarkedLocation {
  identifier: string;
  ancestry: string[] | undefined;
}
export interface Children {
  level: string;
  childrenList: string[];
}

export interface Polygondata {
  polygonData: any;
  childrenLoaded: boolean;
}

interface PolygonsState {
  [key: string]: Polygondata;
}

const extractPolygonsFromPolysWithData = (polygonsWithData?: PolygonsState) => {
  return polygonsWithData ? Object.values(polygonsWithData!).map((polygon: Polygondata) => polygon.polygonData) : [];
};

const Simulation = () => {
  const { t } = useTranslation();
  // const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [combinedHierarchyList, setCombinedHierarchyList] = useState<LocationHierarchyModel[]>();
  const [selectedEntity, setSelectedEntity] = useState<string>();
  const [selectedEntityCondition, setSelectedEntityCondition] = useState<EntityTag>();
  const [selectedEntityConditionList, setSelectedEntityConditionList] = useState<EntityTag[]>([]);
  const divRef = useRef<HTMLDivElement>(null);
  const divHeight = useWindowResize(divRef.current);
  const [mapFullScreen, setMapFullScreen] = useState(true);
  const [mapData, setMapData] = useState<PlanningLocationResponseTagged>();
  const [parentMapData, setParentMapData] = useState<PlanningParentLocationResponse>();
  const [mapDataLoad, setMapDataLoad] = useState<PlanningLocationResponse>({
    features: [],
    parents: [],
    type: 'FeatureCollection',
    identifier: undefined,
    method: undefined,
    source: undefined
  });
  const [parentMapDataLoad, setParentMapDataLoad] = useState<PlanningParentLocationResponse>();
  const [nodeList, setNodeList] = useState<string[]>([]);
  const [completeGeographicList, setCompleteGeographicList] = useState<string[]>([]);
  const [locationList, setLocationList] = useState<any[]>([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState<LocationHierarchyModel>();
  const [selectedLocation, setSelectedLocation] = useState<SingleValue<{ label: string; value: string }>>();
  const [selectedRow, setSelectedRow] = useState<SearchLocationProperties>();
  const [toLocation, setToLocation] = useState<LngLatBounds>();
  const [resetMap, setResetMap] = useState<boolean>(false);
  const [entityTags, setEntityTags] = useState<EntityTag[]>([]);
  const [entityTagsOriginal, setEntityTagsOriginal] = useState<EntityTag[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [highestLocations, setHighestLocations] = useState<any>();
  const [summary, setSummary] = useState<any>({});
  const [selectedMapData, setSelectedMapData] = useState<any>();
  const [showCountResponseModal, setShowCountResponseModal] = useState(false);
  const [selectedFilterGeographicLevelList, setSelectedFilterGeographicLevelList] = useState<string[]>();
  const [simulationCountData, setSimulationCountData] = useState<any>(null);
  const [simulationRequestId, setSimulationRequestId] = useState<string>();
  const [parentsLoaded, setParentsLoaded] = useState(false);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [resultsLoadingState, setResultsLoadingState] = useState<'notstarted' | 'error' | 'started' | 'complete'>(
    'notstarted'
  );
  const [parentsLoadingState, setParentsLoadingState] = useState<'notstarted' | 'error' | 'started' | 'complete'>(
    'notstarted'
  );
  const [loadParentsToggle, setLoadParentsToggle] = useState(false);
  const [geoFilterList, setGeoFilterList] = useState<MultiValue<{ value: string; label: string }> | null>([]);
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);
  const [inactiveGeoFilterList, setInactiveGeoFilterList] = useState<MultiValue<{
    value: string;
    label: string;
  }> | null>([]);
  const [selectedFilterInactiveGeographicLevelList, setSelectedFilterInactiveGeographicLevelList] =
    useState<string[]>();
  const levelsLoaded = useRef<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [statsLayerMetadata, setStatsLayerMetadata] = useState<StatsLayer>({});

  const [aggregationSummary, setAggregationSummary] = useState<LocationMetadataObj>({});
  const [aggregationSummaryDefinition, setAggregationSummaryDefinition] = useState<MetadataDefinition>({});
  const [submitSimulationRequestData, setSubmitSimulationRequestData] = useState<SimulationRequestData>();
  const [showSaveHierarchyPanel, setShowSaveHierarchyPanel] = useState(false);
  const map = useRef<MapBoxMap>();
  const [markedLocations, setMarkedLocations] = useState<MarkedLocation[]>([]);
  const [showOnlyMarkedLocations, setShowOnlyMarkedLocations] = useState(false);
  const [markedParents, setMarkedParents] = useState<Set<string>>(new Set<string>());
  const [parentChild, setParentChild] = useState<{ [parent: string]: Children }>({});
  const [complexTags, setComplexTags] = useState<ComplexTagResponse[]>();
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [analysisLayerDetails, setAnalysisLayerDetails] = useState<AnalysisLayer[]>([]);
  const [analysisResultEntityTags, setAnalysisResultEntityTags] = useState<EntityTag[]>();
  const [tooLargeOrSmall, setTooLargeOrSmall] = useState(0);
  const [omitLayers, setOmitLayers] = useState(false);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [openCustomModal, setOpenCustomModal] = useState<number>();
  // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  // const [geometry, setGeometry] = useState<Feature<Polygon | MultiPolygon | Point> | null>(null);
  const [geometry, setGeometry] = useState<Geometry>();
  const [currentLocationId, setCurrentLocationId] = useState<string>();
  const [polygons, setPolygons] = useState<any[]>([]);
  const [polygonsWithData, setPolygonsWithData] = useState<PolygonsState>();

  const [selectedLocationChildren, setSelectedLocationChildren] = useState<any[]>([]);
  const [adminLevelOne, setAdminLevelOne] = useState<any[]>([]);
  // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

  useEffect(() => {
    getHierarchy()
      .then(res => {
        setHighestLocations(res);
      })
      .catch(err => toast.error(err));
  }, []);

  // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

  useEffect(() => {
    Promise.all([
      getLocationHierarchyList(50, 0, true),
      getEntityList(),
      getGeneratedLocationHierarchyList()
      // getComplexTagReponses()
    ])
      .then(([locationHierarchyList, entityList, generatedHierarchyList]) => {
        let generatedHierarchyItems = generatedHierarchyList?.map(generatedHierarchy => {
          return {
            identifier: generatedHierarchy.identifier,
            name: generatedHierarchy.name,
            nodeOrder: generatedHierarchy.nodeOrder,
            type: HierarchyType.GENERATED
          };
        });

        let list = locationHierarchyList?.content.map(savedHierarchy => {
          return {
            identifier: savedHierarchy.identifier,
            name: savedHierarchy.name,
            nodeOrder: savedHierarchy.nodeOrder,
            type: HierarchyType.SAVED
          };
        });

        let combinedList = list.concat(generatedHierarchyItems);
        setCombinedHierarchyList(combinedList);

        let entityObj = entityList.find(entity => entity.code === 'Location');
        setSelectedEntity(entityObj?.identifier);

        // setComplexTags(complexTagResponses);
      })
      .catch(err => toast.error(err));
  }, []);

  const openModalHandler = (open: boolean) => {
    if (open && selectedEntity) {
      setShowModal(true);
    } else if (selectedEntityCondition) {
      setSelectedEntityConditionList([...selectedEntityConditionList, selectedEntityCondition]);
      setSelectedEntityCondition(undefined);
      setShowModal(false);
    }
  };
  const updateHierarchyLists = (newHierarchy: LocationHierarchyModel) => {
    setCombinedHierarchyList(combinedHierarchyList => {
      let newList: LocationHierarchyModel[] = [];
      combinedHierarchyList?.forEach(hierarchy => newList.push(hierarchy));
      newList.push(newHierarchy);
      return newList;
    });
  };

  const {
    handleSubmit,
    register,
    reset,
    unregister,
    formState: { errors }
  } = useForm();

  const updateMarkedLocations = (identifier: string, ancestry: string[] | undefined, marked: boolean) => {
    setMarkedLocations(markedLocations => {
      let newMarkedLocations: MarkedLocation[] = [];

      if (markedLocations) {
        markedLocations.forEach(markedLocation => {
          newMarkedLocations.push({
            identifier: markedLocation.identifier,
            ancestry: markedLocation.ancestry
          });
        });
        if (!marked) {
          newMarkedLocations = newMarkedLocations?.filter(markedLocation => markedLocation.identifier !== identifier);
        } else {
          if (!newMarkedLocations.map(markedLocation => markedLocation.identifier).includes(identifier)) {
            newMarkedLocations.push({
              identifier: identifier,
              ancestry: ancestry
            });
          }
        }
      }
      return newMarkedLocations;
    });
  };

  useEffect(() => {
    if (markedLocations.length > 0) {
      let newMarkedParents = new Set<string>();
      markedLocations.forEach(markedLocation => {
        markedLocation.ancestry?.forEach(ancestor => {
          if (ancestor !== markedLocation.identifier) {
            newMarkedParents.add(ancestor);
          }
        });
      });
      setMarkedParents(newMarkedParents);
    } else {
      setMarkedParents(new Set<string>());
    }
  }, [markedLocations]);

  const submitHandlerCount = (form: any) => {
    if (omitLayers) {
      clearSomeHandler();
    }

    levelsLoaded.current = [];

    const arr: SubmitValue[] = [];
    selectedEntityConditionList.forEach((el, index) => {
      const requestBody = {
        inputObj: el,
        inputValue: form[el.tag + index],
        selectedValue: form[el.tag + index + 'sign']
      };
      if (form[el.tag + index + 'range']) {
        arr.push({
          fieldIdentifier: requestBody.inputObj.identifier,
          fieldType: el.fieldType,
          valueType: el.valueType,
          tag: el.tag,
          range: {
            minValue: requestBody.inputValue,
            maxValue: form[el.tag + index + 'range']
          }
        });
      } else if (el.more && el.more.length) {
        arr.push({
          fieldIdentifier: requestBody.inputObj.identifier,
          fieldType: el.fieldType,
          valueType: el.valueType,
          tag: el.tag,
          values: [
            { sign: requestBody.selectedValue, value: requestBody.inputValue },
            ...el.more.map((el, i) => {
              return {
                sign:
                  el.valueType === 'string'
                    ? OperatorSignEnum.EQUAL
                    : form[el.tag + el.identifier + index + i + 'sign'],
                value: form[el.tag + el.identifier + index + i]
              };
            })
          ]
        });
      } else {
        arr.push({
          fieldIdentifier: requestBody.inputObj.identifier,
          fieldType: el.fieldType,
          valueType: el.valueType,
          tag: el.tag,
          searchValue: {
            sign: requestBody.selectedValue ?? OperatorSignEnum.EQUAL,
            value: requestBody.inputValue
          }
        });
      }
    });
    const requestData: SimulationRequestData = {
      hierarchyIdentifier: selectedHierarchy?.identifier,
      hierarchyType: selectedHierarchy?.type,
      locationIdentifier: selectedLocation?.value,
      entityFilters: arr,
      filterGeographicLevelList: selectedFilterGeographicLevelList,
      inactiveGeographicLevelList: selectedFilterInactiveGeographicLevelList,
      includeInactive: loadParentsToggle
    };
    setSubmitSimulationRequestData(requestData);
    submitSimulationRequest(requestData)
      .then(res => {
        setSimulationCountData(res);
        setSimulationRequestId(res.searchRequestId);
        setShowCountResponseModal(true);
      })
      .catch(err => toast.error(err));
  };

  const subithandlerAfterAnalysis = (resultEntityTags: EntityTag[] | undefined, analysisLayer: AnalysisLayer) => {
    setParentsLoadingState('notstarted');
    setResultsLoadingState('notstarted');
    const requestData = {
      simulationRequestId: simulationRequestId
    };
    updateSimulationRequest(simulationRequestId, resultEntityTags)
      .then(() => {
        getLocationsSSE(
          requestData,
          (e: any) => messageHandlerAfterAnalysis(e, analysisLayer),
          closeConnHandler,
          openHandler,
          (e: any) => parentHandlerAfterAnalysis(e, analysisLayer),
          (e: any) => statsHandlerAfterAnalysis(e, analysisLayer),
          locationAggregationHandler,
          locationAggregationDefinitionHandler,
          resultsErrorHandler
        );
        if (loadParentsToggle) {
          getFullLocationsSSE(
            requestData,
            parentMessageHandler,
            closeParentConnHandler,
            openParentHandler,
            parentResultsErrorHandler
          );
        }
      })
      .catch(() => {
        toast.error('Cannot get result set - refresh page');
      });
  };

  const closeConnHandler = () => {
    setResultsLoaded(true);
    setResultsLoadingState('complete');
    setShowResult(true);
    setParentsLoaded(true);
  };

  const resultsErrorHandler = () => {
    toast.error('Error getting locations');
    setResultsLoadingState('error');
  };

  const parentResultsErrorHandler = () => {
    toast.error('Error getting inactive locations');
    setParentsLoadingState('error');
  };

  const closeParentConnHandler = () => {
    setParentsLoadingState('complete');
  };

  const openHandler = () => {
    setResultsLoaded(false);
  };

  const openParentHandler = () => {
    setParentsLoaded(false);
  };

  const parentHandlerAfterAnalysis = (message: MessageEvent, analysisLayer: AnalysisLayer) => {
    const parents: any = JSON.parse(message.data);
    let mapDataSave: PlanningLocationResponse = {
      features: [],
      parents: parents,
      type: 'FeatureCollection',
      identifier: undefined,
      method: analysisLayer,
      source: 'parentHandler'
    };

    setMapDataLoad(mapDataSave);
  };

  const statsHandlerAfterAnalysis = (message: MessageEvent, analysisLayer: AnalysisLayer) => {
    const statsIncoming = JSON.parse(message.data);
    setStatsLayerMetadata(statsLayerMetadata => {
      let newStats: StatsLayer = {};
      Object.keys(statsLayerMetadata).forEach(layer => {
        newStats[layer] = statsLayerMetadata[layer];
      });
      Object.keys(statsIncoming).forEach(key => {
        let newStatsIncoming: Stats = newStats[analysisLayer.labelName] ? newStats[analysisLayer.labelName] : {};
        newStatsIncoming[key] = statsIncoming[key];
        newStats[analysisLayer.labelName] = newStatsIncoming;
      });
      return newStats;
    });
  };

  const locationAggregationHandler = useCallback(
    (message: MessageEvent) => {
      const locationList = JSON.parse(message.data);
      Object.keys(locationList).forEach(locationIdentifier => {
        if (complexTags) {
          complexTags.forEach(complexTag => {
            let a: { [val: string]: number } = {};
            complexTag.tags.forEach(tag => {
              Object.keys(locationList[locationIdentifier]).forEach(metadataTag => {
                if (metadataTag === tag.name) {
                  a[tag.symbol] = locationList[locationIdentifier][metadataTag];
                }
              });
              let val = 0;
              try {
                val = evaluate(complexTag.formula, a);
                if (isNumeric(val)) {
                  complexTag.calculateValue = val;
                  locationList[locationIdentifier][complexTag.tagName] = val;
                }
              } catch (ex) {
                console.warn('eerro with formula');
              }
            });
          });
        }
      });
      setAggregationSummary((aggregationSummary: LocationMetadataObj) => {
        let newAggregationSummary: LocationMetadataObj = {};
        Object.keys(aggregationSummary).forEach(key => {
          newAggregationSummary[key] = aggregationSummary[key];
        });
        Object.keys(locationList).forEach(key => {
          if (!newAggregationSummary[key]) {
            newAggregationSummary[key] = locationList[key];
          } else {
            Object.keys(locationList[key]).forEach(metakey => {
              if (!newAggregationSummary[key][metakey]) {
                newAggregationSummary[key][metakey] = locationList[key][metakey];
              }
            });
          }
        });
        return newAggregationSummary;
      });
    },
    [complexTags]
  );

  const locationAggregationDefinitionHandler = useCallback(
    (message: MessageEvent) => {
      const tagTypes = JSON.parse(message.data);
      complexTags?.forEach(complexTag => {
        tagTypes[complexTag.tagName] = 'generated';
      });
      setAggregationSummaryDefinition((aggregationSummaryDefinition: MetadataDefinition) => {
        let newAggregationSummaryDefinition: MetadataDefinition = {};

        Object.keys(aggregationSummaryDefinition).forEach(
          key => (newAggregationSummaryDefinition[key] = aggregationSummaryDefinition[key])
        );

        Object.keys(tagTypes).forEach(key => {
          if (!newAggregationSummaryDefinition[key]) {
            newAggregationSummaryDefinition[key] = tagTypes[key];
          }
        });
        return newAggregationSummaryDefinition;
      });
    },
    [complexTags]
  );

  const messageHandlerAfterAnalysis = useCallback(
    (message: MessageEvent, analysis: AnalysisLayer) => {
      const res: any = JSON.parse(message.data);
      let mapDataSave: PlanningLocationResponse = {
        features: res.features,
        parents: res.parents,
        type: res.type,
        identifier: message.lastEventId,
        method: analysis,
        source: 'messageHandler'
      };
      if (mapDataSave.features && mapDataSave.features.length > 0) {
        mapDataSave.features.forEach((el: any) => {
          if (el.properties) {
            el.properties['identifier'] = (el as any).identifier;

            if (complexTags) {
              if (el.properties.metadata) {
                complexTags?.forEach(complexTag => {
                  let a: { [val: string]: number } = {};
                  complexTag.tags.forEach(tag => {
                    el.properties.metadata.forEach((metaItem: any) => {
                      if (metaItem.type === tag.name) {
                        a[tag.symbol] = metaItem.value;
                      }
                    });
                  });
                  let val = 0;
                  try {
                    val = evaluate(complexTag.formula, a);

                    if (isNumeric(val)) {
                      let meta = {
                        type: complexTag.tagName,
                        value: val,
                        fieldType: 'generated'
                      };
                      complexTag.calculateValue = val;
                      el.properties.metadata.push(meta);
                    }
                  } catch (ex) {
                    console.warn('eerro with formula');
                  }
                });
              }
            }
          }
        });

        setMapDataLoad(mapDataSave);
      }
    },
    [complexTags]
  );

  const parentMessageHandler = (message: any) => {
    const res: any = JSON.parse(message.data);
    let mapDataSave: PlanningParentLocationResponse = {
      features: res.features,
      type: res.type,
      identifier: res.identifier,
      featureCount: 1
    };
    if (mapDataSave.features && mapDataSave.features.length > 0) {
      mapDataSave.features.forEach((el: any) => {
        if (el.properties) {
          el.properties['identifier'] = (el as any).identifier;
        }
      });

      setParentMapDataLoad(mapDataSave);
    }
  };

  function initializeNewMapData(mapData: PlanningLocationResponseTagged | undefined) {
    let newVar: PlanningLocationResponseTagged;
    if (mapData) {
      newVar = {
        features: mapData.features,
        parents: mapData.parents,
        type: mapData.type,
        identifier: mapData?.identifier,
        method: mapData?.method
      };
      if (mapData.source) {
        newVar.source = mapData.source;
      }
    } else {
      newVar = {
        features: {},
        parents: {},
        type: 'FeatureCollection',
        identifier: undefined
      };
    }
    return newVar;
  }

  useEffect(() => {
    if (mapDataLoad) {
      setMapData(mapData => {
        if (mapData) {
          mapData.source = mapDataLoad.source;
        }
        let newMapData: PlanningLocationResponseTagged = initializeNewMapData(mapData);

        if (mapDataLoad.features) {
          mapDataLoad.features.forEach((newFeature: any) => {
            let found = newMapData.features[newFeature.identifier];

            let newMeta: any[] = [];

            if (!found) {
              if (complexTags) {
                if (newFeature.properties.metadata) {
                  complexTags.forEach(complexTag => {
                    let a: { [val: string]: number } = {};
                    complexTag.tags.forEach(tag => {
                      newFeature.properties.metadata.forEach((metaItem: any) => {
                        if (metaItem.type === tag.name) {
                          a[tag.symbol] = metaItem.value;
                        }
                      });
                    });
                    let val = 0;
                    try {
                      val = evaluate(complexTag.formula, a);
                      if (isNumeric(val)) {
                        if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
                          setTooLargeOrSmall(tooLargeOrSmall => tooLargeOrSmall + 1);
                        } else {
                          let meta = {
                            type: complexTag.tagName,
                            value: val,
                            fieldType: 'generated'
                          };
                          newMeta.push(meta);
                        }
                      }
                    } catch (ex) {
                      console.warn('eerro with formula');
                    }
                  });
                }
              }
              if (newMeta.length > 0) {
                if (
                  newFeature.properties.metadata &&
                  Array.isArray(newFeature.properties.metadata) &&
                  newFeature.properties.metadata.length > 0
                ) {
                  newMeta.forEach((newM: any) => newFeature.properties.metadata.push(newM));
                }
              }

              newMapData.features[newFeature.identifier] = {
                identifier: newFeature.identifier,
                properties: newFeature.properties,
                type: newFeature.type,
                geometry: newFeature.geometry,
                children: undefined,
                aggregates: undefined,
                ancestry: newFeature.ancestry,
                method: mapDataLoad.method ? [mapDataLoad.method] : undefined
              };
            } else {
              if (newFeature.properties && newFeature.properties.metadata) {
                if (found.properties && found.properties.metadata) {
                  let currentMetadata = found.properties.metadata;
                  let toAddMetadata = newFeature.properties.metadata;
                  let accumulator: any[] = [];

                  toAddMetadata.forEach((meta: any) => {
                    if (!currentMetadata.map((curMeta: any) => curMeta.type).includes(meta.type)) {
                      accumulator.push(meta);
                    }
                  });

                  found.properties.metadata.push(...accumulator);
                }
              }

              let method;
              if (found.method) {
                if (mapDataLoad.method) {
                  method = [...found.method];
                  if (!found.method.map(methodItem => methodItem.labelName).includes(mapDataLoad.method.labelName)) {
                    if (mapDataLoad.method) {
                      method.push(mapDataLoad.method);
                    }
                  }
                }
              }
              newMapData.features[newFeature.identifier] = {
                identifier: found.identifier,
                properties: found.properties,
                type: found.type,
                geometry: found.geometry,
                children: undefined,
                aggregates: undefined,
                ancestry: found.ancestry,
                method: method
              };
            }
          });
        }

        if (mapDataLoad.parents) {
          mapDataLoad.parents.forEach((newFeature: any) => {
            let found = newMapData.parents[newFeature.identifier];
            if (!found) {
              let newMeta: any[] = [];

              if (complexTags) {
                if (newFeature.properties.metadata) {
                  complexTags.forEach(complexTag => {
                    let a: { [val: string]: number } = {};
                    complexTag.tags.forEach(tag => {
                      newFeature.properties.metadata.forEach((metaItem: any) => {
                        if (metaItem.type === tag.name) {
                          a[tag.symbol] = metaItem.value;
                        }
                      });
                    });
                    let val = 0;
                    try {
                      val = evaluate(complexTag.formula, a);
                      if (isNumeric(val)) {
                        if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
                          setTooLargeOrSmall(tooLargeOrSmall => tooLargeOrSmall + 1);
                        } else {
                          let meta = {
                            type: complexTag.tagName,
                            value: val,
                            fieldType: 'generated'
                          };
                          newMeta.push(meta);
                        }
                      }
                    } catch (ex) {
                      console.warn('eerro with formula', ex);
                    }
                  });
                }
              }

              if (newMeta.length > 0) {
                if (
                  newFeature.properties.metadata &&
                  Array.isArray(newFeature.properties.metadata) &&
                  newFeature.properties.metadata.length > 0
                ) {
                  newMeta.forEach((newM: any) => newFeature.properties.metadata.push(newM));
                }
              }

              newMapData.parents[newFeature.identifier] = {
                identifier: newFeature.identifier,
                properties: newFeature.properties,
                type: newFeature.type,
                geometry: newFeature.geometry,
                children: undefined,
                aggregates: undefined,
                ancestry: newFeature?.ancestry,
                method: mapDataLoad.method ? [mapDataLoad.method] : undefined
              };
            } else {
              if (newFeature.properties && newFeature.properties.metadata) {
                if (found.properties && found.properties.metadata) {
                  let currentMetadata = found.properties.metadata;
                  let toAddMetadata = newFeature.properties.metadata;
                  let accumulator: any[] = [];

                  toAddMetadata.forEach((meta: any) => {
                    if (!currentMetadata.map((curMeta: any) => curMeta.type).includes(meta.type)) {
                      accumulator.push(meta);
                    }
                  });

                  found.properties.metadata.push(...accumulator);
                }
              }

              let method;
              if (found.method) {
                if (mapDataLoad.method) {
                  method = [...found.method];
                  if (!found.method.map(methodItem => methodItem.labelName).includes(mapDataLoad.method.labelName)) {
                    if (mapDataLoad.method) {
                      method.push(mapDataLoad.method);
                    }
                  }
                }
              }

              newMapData.parents[newFeature.identifier] = {
                identifier: found.identifier,
                properties: found.properties,
                type: found.type,
                geometry: found.geometry,
                children: undefined,
                aggregates: undefined,
                ancestry: found.ancestry,
                method: method
              };
            }
          });
        }
        return newMapData;
      });
    }
  }, [mapDataLoad, complexTags]);

  useEffect(() => {
    if (tooLargeOrSmall > 0) {
      toast.warn('complex function generating too large or too small values');
      setTooLargeOrSmall(0);
    }
  }, [tooLargeOrSmall]);

  useEffect(() => {
    if (parentMapDataLoad) {
      setParentMapData(parentMapData => {
        if (parentMapData) {
          let val: PlanningParentLocationResponse = {
            identifier: parentMapData.identifier,
            features: parentMapData.features,
            featureCount: parentMapData.featureCount,
            type: 'FeatureCollection'
          };

          if (parentMapDataLoad.features?.length > 0) {
            val.features = val.features.concat(parentMapDataLoad.features);
            val.featureCount++;
          }
          return val;
        } else {
          return parentMapDataLoad;
        }
      });
    }
  }, [parentMapDataLoad]);

  const clearHandler = () => {
    clearSomeHandler();

    setSelectedEntityConditionList([]);
    setSelectedFilterGeographicLevelList([]);
    setSelectedHierarchy(undefined);
    setSelectedLocation(null);
    setLocationList([]);
    setInactiveGeoFilterList([]);
    setSelectedFilterInactiveGeographicLevelList(undefined);
    levelsLoaded.current = [];
    setGeoFilterList([]);
    reset();
  };

  useEffect(() => {
    if (geoFilterList != null && geoFilterList?.length != null && geoFilterList?.length > 0) {
      setEntityTags(_ => {
        let newTags: EntityTag[] = [];
        entityTagsOriginal
          .filter(tag => {
            return geoFilterList?.find(geo => tag.levels?.includes(geo.label));
          })
          .forEach(tag => newTags.push(tag));
        return newTags;
      });
    } else {
      setEntityTags(entityTagsOriginal);
    }
  }, [geoFilterList, setEntityTags, entityTagsOriginal]);

  const clearSomeHandler = () => {
    setAnalysisLayerDetails([]);
    setShowResult(false);
    setMapData(undefined);
    setToLocation(undefined);
    setResetMap(true);
    setParentMapData(undefined);
    setParentsLoadingState('notstarted');
    setResultsLoadingState('notstarted');
    setHighestLocations(undefined);
    setStatsLayerMetadata({});
    setAnalysisResultEntityTags(undefined);
    setSelectedMapData(undefined);
    setSummary({});
    setAggregationSummary({});
    setAggregationSummaryDefinition({});
    levelsLoaded.current = [];
  };

  const updateParentAsHasResultOrIsResult = (
    parent: RevealFeature,
    lowestLocation: RevealFeature,
    mapDataClone: PlanningLocationResponseTagged
  ) => {
    if (parent.children) {
      if (!parent.children.map((locationChild: any) => locationChild.identifier).includes(lowestLocation.identifier)) {
        parent.children.push(lowestLocation);
      }
    } else {
      parent.children = [];
      parent.children.push(lowestLocation);
      if (parent.properties != null) {
        if (parent.identifier) {
          parent.properties.result = mapDataClone?.features[parent.identifier] != null;
        }
      }
    }
    if (parent.properties != null) {
      if (
        !parent.properties.hasOwnProperty('hasResultChild') ||
        (parent.properties.hasOwnProperty('hasResultChild') && !parent.properties.hasResultChild)
      ) {
        if (lowestLocation.properties != null) {
          parent.properties.hasResultChild = !!(
            mapDataClone?.features[lowestLocation.properties.identifier] != null ||
            lowestLocation.properties?.hasResultChild ||
            lowestLocation.properties?.result
          );
        }
      }

      if (
        !parent.properties.hasOwnProperty('hasMarkedChild') ||
        (parent.properties.hasOwnProperty('hasMarkedChild') && !parent.properties.hasMarkedChild)
      ) {
        if (lowestLocation.properties != null) {
          parent.properties.hasMarkedChild = !!(
            lowestLocation.properties?.mark || lowestLocation.properties?.hasMarkedChild
          );
        }
      }
    }
  };

  const getLocationHierarchyFromLowestLocation = useCallback(
    (lowestLocation: RevealFeature, mapDataClone: PlanningLocationResponseTagged) => {
      let parent: RevealFeature = mapDataClone?.parents[lowestLocation.properties?.parent];

      if (parent) {
        updateParentAsHasResultOrIsResult(parent, lowestLocation, mapDataClone);
        setParentChild(newParentChild => {
          if (lowestLocation?.identifier) {
            if (parent.identifier) {
              if (newParentChild[parent.identifier] && newParentChild[parent.identifier].childrenList.length > 0) {
                if (!newParentChild[parent.identifier].childrenList.includes(lowestLocation?.identifier)) {
                  newParentChild[parent.identifier].childrenList.push(lowestLocation?.identifier);
                }
              } else {
                newParentChild[parent.identifier] = {
                  level: lowestLocation.properties?.geographicLevel,
                  childrenList: [lowestLocation.identifier]
                };
              }
              newParentChild[parent.identifier].level = lowestLocation.properties?.geographicLevel;
            }
          }
          return newParentChild;
        });
        getLocationHierarchyFromLowestLocation(parent, mapDataClone);
      }
    },
    []
  );

  useEffect(() => {
    if (resultsLoaded && parentsLoaded && mapData && mapData?.features && Object.keys(mapData?.features).length > 0) {
      let max = Number.MIN_VALUE;

      if (max != null) {
        Object.keys(mapData?.features).forEach(key => {
          if (mapData?.features[key]?.properties?.geographicLevelNodeNumber > max) {
            max = mapData?.features[key]?.properties?.geographicLevelNodeNumber;
          }
        });

        let lowestLocations: RevealFeature[] = Object.keys(mapData.features)
          .filter(key => mapData.features[key].properties?.geographicLevelNodeNumber === max)
          .map(key => {
            return mapData.features[key];
          })
          .map((val: RevealFeature) => {
            if (val.properties != null) {
              val.properties.result = true;
            }
            return val;
          });

        if (!mapData.source || mapData.source !== 'uploadHandler') {
          lowestLocations.forEach(lowestLocation => {
            getLocationHierarchyFromLowestLocation(lowestLocation, mapData);
          });
        }
      }

      let min = Number.MAX_VALUE;

      if (min !== null) {
        Object.keys(mapData?.parents).forEach(key => {
          if (mapData?.parents[key]?.properties?.geographicLevelNodeNumber < min) {
            min = mapData?.parents[key]?.properties?.geographicLevelNodeNumber;
          }
        });

        if (mapData.parents) {
          let highestLocations: any[] = Object.keys(mapData.parents)
            .filter(
              key =>
                mapData.parents[key].properties !== null &&
                mapData.parents[key].properties?.geographicLevelNodeNumber === min
            )
            .map(key => mapData.parents[key]);
          // setHighestLocations(highestLocations);
        }
      }
    }
  }, [mapData, resultsLoaded, parentsLoaded, getLocationHierarchyFromLowestLocation, markedLocations]);

  useEffect(() => {
    if (selectedHierarchy) {
      let tagsMeta: EntityTag[] = [];
      getDataAssociatedEntityTags(selectedHierarchy.identifier).then(res => {
        tagsMeta = res.entityTagResponses;
        setEntityTags(tagsMeta);
        setEntityTagsOriginal(tagsMeta);
        let tagsEvent: EntityTag[] = [];
        getEventBasedEntityTags().then(result => {
          tagsEvent = result;

          let allTags = tagsMeta.concat(tagsEvent);
          if (allTags.length > 0) {
            setEntityTags(allTags);
            setEntityTagsOriginal(allTags);
          }
        });
        setComplexTags(res.complexTagDtos);
      });
    }
  }, [selectedHierarchy]);

  const loadLocationHandler = async (locationId: string) => {
    if (polygonsWithData?.[locationId]?.childrenLoaded) {

      setCurrentLocationId(locationId);
      const k = Object.values(polygonsWithData).map(polygon => polygon.polygonData)
        .filter(p => p.properties.parentIdentifier === locationId);
      console.log(k);
      setSelectedLocationChildren(k);
      const selectedLocation = polygonsWithData?.[locationId]?.polygonData;
      if (selectedLocation) {
        setGeometry(selectedLocation);
        setToLocation(JSON.parse(JSON.stringify(bbox(selectedLocation.geometry))));
      }
    } else {
      let page = 0;
      let totalPages = 0;
      const size = 3;
      setSelectedLocationChildren([]);

      while (totalPages >= page) {
        const res = await getHierarchyPolygon(locationId, page, size);

        setPolygonsWithData(prev => {
          const updatedPolygons = { ...prev };
          res.content.forEach((location: any) => {
            updatedPolygons[location.identifier] = {
              polygonData: location,
              childrenLoaded: location.identifier === locationId
            };
          });
          return updatedPolygons;
        });

        setSelectedLocationChildren(prev => [
          ...prev,
          ...res.content.filter((location: any) => location.identifier !== locationId)
        ]);

        totalPages = res.totalPages;
        page++;
        setCurrentLocationId(locationId);
        const selectedLocation = res.content.find((location: any) => {
          return location.identifier === locationId;
        });
        if (selectedLocation) {
          setGeometry(selectedLocation);
          setToLocation(JSON.parse(JSON.stringify(bbox(selectedLocation.geometry))));
        }
      }
    }
  };

  // console.log(selectedLocationChildren);

  // const loadLocationHandler = async (locationId: string) => {
  //   if (polygonsWithData?.[locationId]?.childrenLoaded) {
  //     setCurrentLocationId(locationId);
  //     const selectedLocation = polygonsWithData?.[locationId]?.polygonData;

  //     const k = Object.values(polygonsWithData).map(polygon => polygon.polygonData)
  //     .filter(p => p.parentIdentifier === locationId);
  //     console.log(k);
  //     setSelectedLocationChildren(k);

  //     if (selectedLocation) {
  //       setGeometry(selectedLocation);
  //       setToLocation(JSON.parse(JSON.stringify(bbox(selectedLocation.geometry))));
  //     }
  //     return;
  //   }

  //   let page = 0;
  //   const size = 3;

  //   try {
  //     while (true) {
  //       const res = await getHierarchyPolygon(locationId, page, size);

  //       // Update polygonsWithData
  //       setPolygonsWithData(prev => {
  //         const updatedPolygons = { ...prev };
  //         res.content.forEach((location: any) => {
  //           updatedPolygons[location.identifier] = {
  //             polygonData: location,
  //             childrenLoaded: location.identifier === locationId,
  //             childrenIds: []
  //           };
  //         });
  //         updatedPolygons[locationId].childrenIds = res.content
  //           .filter((location: any) => locationId !== location.identifier)
  //           .map((location: any) => location.identifier);
  //         return updatedPolygons;
  //       });

  //       // Add children (excluding the current location itself)
  //       setSelectedLocationChildren(prev => [
  //         ...prev,
  //         ...res.content.filter((location: any) => location.identifier !== locationId)
  //       ]);

  //       // if (res.length === 37) {
  //       //   setAdminLevelOne(prev => [
  //       //     ...prev,
  //       //     ...res.content.filter((location: any) => location.identifier !== locationId)
  //       //   ]);
  //       // }

  //       // Handle the current location geometry


  //       // Check for the last page
  //       if (page >= res.totalPages - 1) break;
  //       page++;
  //     }
  //   } catch (error) {
  //     console.error('Error loading location data:', error);
  //   }
  // };

  const showDetailsClickHandler = (locationId: string) => {
    let feature = mapData?.parents[locationId];
    //create deep copy of bounds object for triggering bounds event every time
    if (feature) {
      let val: any = feature;
      let valProps: SearchLocationProperties = {
        bounds: feature.geometry ? (bbox(val.geometry) as any) : undefined,
        identifier: val.identifier,
        metadata: val.properties?.metadata,
        name: val.properties?.name,
        persons: []
      };
      setSelectedRow(valProps);
      setShowDetails(true);
    }
  };

  const processChildren = useCallback(
    (mapDataClone: any) => {
      let geoLevel: string = mapDataClone.properties.geographicLevel;

      if (!summary[geoLevel]) {
        summary[geoLevel] = {};
      }
      summary[geoLevel][mapDataClone.identifier] = mapDataClone.properties;
      summary[geoLevel][mapDataClone.identifier]['aggregates'] = mapDataClone.aggregates;
      setSummary(summary);

      if (mapDataClone.children) {
        mapDataClone.children.forEach((child: any) => processChildren(child));
      }
    },
    [summary]
  );

  useEffect(() => {
    if (Object.keys(summary).length === 0) {
      if (selectedMapData) {
        processChildren(selectedMapData);
        setShowSummaryModal(true);
      }
    }
  }, [selectedMapData, summary, processChildren]);

  const summaryDetailsClickHandler = (mapDataClone: any) => {
    setSummary({});
    setSelectedMapData(mapDataClone);
  };

  const proceedToSearchAfterAnalysis = (
    loadInactiveLocations: boolean,
    resultEntityTags: EntityTag[] | undefined,
    analysisLayer: AnalysisLayer
  ) => {
    subithandlerAfterAnalysis(resultEntityTags, analysisLayer);
    setResultsLoadingState('started');
    if (loadInactiveLocations) {
      setParentsLoadingState('started');
    }
    setShowCountResponseModal(false);
  };

  const uploadDataHandler = (data: PlanningLocationResponse) => {
    setMapDataLoad(data);
    setResultsLoaded(true);
    setParentsLoaded(true);
    setParentsLoadingState('complete');
    setResultsLoadingState('complete');
    setShowResult(true);
  };

  const conditionalRender = (el: EntityTag, index: number) => {
    if (el.more && el.more.length) {
      return (
        <MultiFormField
          entityTag={el}
          register={register}
          index={index}
          errors={errors}
          deleteHandler={(i: number, range: boolean) => {
            if (range) {
              el.more.splice(1);
            } else {
              unregister((el.tag + index + 'range') as any);
              el.more.splice(i, 1);
            }
            setSelectedEntityConditionList([...selectedEntityConditionList]);
          }}
        />
      );
    }
    return <FormField range={false} entityTag={el} register={register} index={index} errors={errors} />;
  };

  const selectStyles = {
    dropdownIndicator: (baseStyles: object) => ({
      ...baseStyles,
      scale: '0.8'
    }),
    clearIndicator: (baseStyles: object) => ({
      ...baseStyles,
      scale: '0.8'
    })
  };

  const convertColor = (color: any) => {
    if (!color) return;
    let hexValue = color.toString();
    let rgbArr = hex.rgb(hexValue);
    let hsvArr = hex.hsv(hexValue);

    let convertedColor = {
      hex: '#009900',
      rgb: { r: rgbArr[0], g: rgbArr[1], b: rgbArr[2] },
      hsv: { h: hsvArr[0], s: hsvArr[1], v: hsvArr[2] }
    };

    return convertedColor as Color;
  };

  const dataset = [
    {
      name: 'Dataset 1',
      borderColor: {
        hex: '#000000',
        rgb: { r: 0, g: 0, b: 0 },
        hsv: { h: 0, s: 27, v: 6 }
      },
      color: {
        hex: '#ff0008',
        rgb: { r: 255, g: 0, b: 8 },
        hsv: { h: 358, s: 100, v: 100 }
      }
    },
    {
      name: 'Dataset 2',
      borderColor: {
        hex: '#000000',
        rgb: { r: 0, g: 0, b: 0 },
        hsv: { h: 0, s: 27, v: 6 }
      },
      color: {
        hex: '#21c445',
        rgb: { r: 33, g: 196, b: 69 },
        hsv: { h: 120, s: 83, v: 77 }
      }
    },
    {
      name: 'Dataset 3',
      borderColor: {
        hex: '#000000',
        rgb: { r: 0, g: 0, b: 0 },
        hsv: { h: 0, s: 27, v: 6 }
      },
      color: {
        hex: '#06e7d0',
        rgb: { r: 27, g: 127, b: 121 },
        hsv: { h: 174, s: 79, v: 50 }
      }
    }
  ];

  const campaignTotals = [
    {
      label: 'Target Areas',
      total: 80,
      targetAreasList: [
        {
          name: 'Target Area 1',
          sum: 20
        },
        {
          name: 'Target Area 2',
          sum: 30
        },
        {
          name: 'Target Area 3',
          sum: 30
        }
      ]
    },
    {
      label: 'Total Population',
      total: 1000,
      targetAreasList: [
        {
          name: 'Target Area 1',
          sum: 200
        },
        {
          name: 'Target Area 2',
          sum: 300
        },
        {
          name: 'Target Area 3',
          sum: 500
        }
      ]
    },
    {
      label: 'Total Structures',
      total: 200,
      targetAreasList: [
        {
          name: 'Target Area 1',
          sum: 50
        },
        {
          name: 'Target Area 2',
          sum: 100
        },
        {
          name: 'Target Area 3',
          sum: 50
        }
      ]
    },
    {
      label: 'Total Facilities',
      total: 50,
      targetAreasList: [
        {
          name: 'Target Area 1',
          sum: 10
        },
        {
          name: 'Target Area 2',
          sum: 20
        },
        {
          name: 'Target Area 3',
          sum: 20
        }
      ]
    },
    {
      label: 'Total Statistics',
      total: 100,
      targetAreasList: [
        {
          name: 'Target Area 1',
          sum: 20
        },
        {
          name: 'Target Area 2',
          sum: 30
        },
        {
          name: 'Target Area 3',
          sum: 50
        }
      ]
    }
  ];

  return (
    <>
      <Container fluid ref={divRef}>
        <div style={{ display: 'flex', position: 'relative' }}>
          <Drawer open={leftOpen} anchor="left" heading="Plan Simulation">
            {/* {highestLocations && showResult && ( */}
            {highestLocations && (
              <Accordion title="Hierarchy" open={resultsLoadingState === 'complete'}>
                <SimulationResultExpandingTable
                  clickHandler={loadLocationHandler}
                  data={highestLocations}
                  detailsClickHandler={showDetailsClickHandler}
                  summaryClickHandler={summaryDetailsClickHandler}
                  markedLocations={markedLocations}
                  showOnlyMarkedLocations={showOnlyMarkedLocations}
                  markedParents={markedParents}
                />
                <DrawerButton onClick={() => setOpenCustomModal(0)}>Add Target Area</DrawerButton>
                <CustomPopup isOpen={openCustomModal === 0} onClose={() => setOpenCustomModal(undefined)} hasBackdrop>
                  <AddTargetAreaForm onClose={() => setOpenCustomModal(undefined)} />
                </CustomPopup>
              </Accordion>
            )}
            {highestLocations && showResult && (
              <Accordion title="Datasets" open={resultsLoadingState === 'complete'}>
                {dataset.map((dataset, index) => (
                  <DatasetsAccordion index={index} dataset={dataset} />
                ))}
                <DrawerButton onClick={() => setOpenCustomModal(1)}>Add dataset</DrawerButton>
                <CustomPopup isOpen={openCustomModal === 1} onClose={() => setOpenCustomModal(undefined)} hasBackdrop>
                  <div className="p-6">
                    <AddDatasetForm onClose={() => setOpenCustomModal(undefined)} />
                  </div>
                </CustomPopup>
              </Accordion>
            )}
          </Drawer>
          <SimulationMapView
            selectedLoaction={geometry} // BBBOX
            currentLocationChildren={selectedLocationChildren}
            polygons={extractPolygonsFromPolysWithData(polygonsWithData)} // LIST OF POLYGONS
            loading={resultsLoadingState}
            leftOpenHandler={() => setLeftOpen(!leftOpen)}
            leftOpenState={leftOpen}
            rightOpenState={rightOpen}
            rightOpenHandler={() => setRightOpen(!rightOpen)}
            fullScreenHandler={() => {
              setMapFullScreen(!mapFullScreen);
            }}
            fullScreen={mapFullScreen}
            toLocation={toLocation} // bbox
            entityTags={entityTags}
            parentMapData={parentMapData}
            setMapDataLoad={setMapDataLoad}
            chunkedData={mapDataLoad}
            resetMap={resetMap}
            setResetMap={setResetMap}
            stats={statsLayerMetadata}
            resultsLoadingState={resultsLoadingState}
            parentsLoadingState={parentsLoadingState}
            map={map}
            updateMarkedLocations={updateMarkedLocations}
            parentChild={parentChild}
            analysisLayerDetails={analysisLayerDetails}
          />
          <Drawer open={rightOpen} anchor="left">
            <Accordion title="Statistics" open>
              <Dashboard
                chartData={{
                  summary: [15, 35, 60, 25],
                  male: [40, 10, 55, 30],
                  female: [25, 50, 15, 45]
                }}
              />
            </Accordion>
            <Accordion title="Campaign Totals" open>
              {campaignTotals.map((item, index) => (
                <CampaignTotalsAccordion key={index} campaignTotals={item} />
              ))}
            </Accordion>
          </Drawer>
        </div>
      </Container>
      <>
        <hr className="my-4" />
        {showSummaryModal && showResult && (
          <TableSummaryModal
            show={true}
            closeHandler={() => {
              setShowSummaryModal(false);
            }}
            isDarkMode={false}
            aggregationSummary={aggregationSummary}
            aggregationSummaryDefinition={aggregationSummaryDefinition}
            initiatingMapData={selectedMapData}
          />
        )}

        <Container fluid>
          <Row>
            <Col>{highestLocations && showResult && <h3 className="my-3 ">{t('simulationPage.results')}</h3>}</Col>
            <Col>
              <Button className="float-end my-3 ms-2" variant="secondary" onClick={() => setShowUploadModal(true)}>
                {t('simulationPage.uploadData')}
              </Button>
              {highestLocations && showResult && (
                <>
                  <AuthorizedElement roles={[REVEAL_SIMULATION_EDIT]}>
                    <Button
                      className="float-end my-3 ms-2"
                      variant="secondary"
                      onClick={() => setShowSaveHierarchyPanel(true)}
                    >
                      {t('simulationPage.saveHierarchy')}
                    </Button>
                  </AuthorizedElement>
                  <Button
                    className="float-end ms-2 my-3"
                    variant="secondary"
                    onClick={() => {
                      setShowDownloadPanel(true);
                    }}
                  >
                    {t('simulationPage.downloadData')}
                  </Button>

                  <Button className="float-end my-3 " variant="secondary" onClick={clearHandler}>
                    {t('simulationPage.clearAll')}
                  </Button>
                  <Form.Check
                    className="float-right my-3 "
                    type="switch"
                    id="custom-switch"
                    label="Show only marked Locations?"
                    defaultChecked={false}
                    onChange={e => setShowOnlyMarkedLocations(e.target.checked)}
                  />
                </>
              )}
            </Col>
          </Row>
          {/* <Row>
            <Col>
              {highestLocations && showResult && (
                <SimulationResultExpandingTable
                  clickHandler={loadLocationHandler}
                  data={highestLocations}
                  detailsClickHandler={showDetailsClickHandler}
                  summaryClickHandler={summaryDetailsClickHandler}
                  markedLocations={markedLocations}
                  showOnlyMarkedLocations={showOnlyMarkedLocations}
                  markedParents={markedParents}
                />
              )}
            </Col>
          </Row> */}
        </Container>
      </>
      {showModal && selectedEntity && (
        <ActionDialog
          closeHandler={() => {
            setSelectedEntityCondition(undefined);
            setShowModal(false);
          }}
          title={t('simulationPage.properties')}
          element={<SimulationModal selectedEntityCondition={setSelectedEntityCondition} entityTags={entityTags} />}
          footer={
            <>
              <Button
                onClick={() => {
                  setSelectedEntityCondition(undefined);
                  setShowModal(false);
                }}
              >
                {t('simulationPage.close')}
              </Button>
              <Button disabled={selectedEntityCondition === undefined} onClick={() => openModalHandler(false)}>
                {t('simulationPage.add')}
              </Button>
            </>
          }
        />
      )}
      {showDetails && selectedRow && (
        <Modal
          size="lg"
          show
          centered
          scrollable
          backdrop="static"
          keyboard={false}
          onHide={() => setShowDetails(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title className="w-100 text-center">{t('simulationPage.locationDetails')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PeopleDetailsModal locationProps={selectedRow} />
          </Modal.Body>
        </Modal>
      )}
      {showCountResponseModal && (
        <SearchResultCountModal
          setShowCountModal={setShowCountResponseModal}
          simulationCountData={simulationCountData}
          proceedToSearch={(resultEntityTags: EntityTag[] | undefined) => {
            if (!omitLayers) {
              setShowAnalysisPanel(true);
            } else {
              let hexValue = '#009900';
              let rgbArr = hex.rgb(hexValue);
              let hsvArr = hex.hsv(hexValue);

              let color: Color = {
                hex: '#009900',
                rgb: { r: rgbArr[0], g: rgbArr[1], b: rgbArr[2] },
                hsv: { h: hsvArr[0], s: hsvArr[1], v: hsvArr[2] }
              };
              let layers: AnalysisLayer = {
                color: color,
                labelName: 'default',
                colorHex: '#009900'
              };
              setAnalysisLayerDetails(details => {
                let newDetail: AnalysisLayer[] = [];
                details.forEach(existingDetail => newDetail.push(existingDetail));
                newDetail.push(layers);
                return newDetail;
              });
              proceedToSearchAfterAnalysis(loadParentsToggle, resultEntityTags, layers);
            }
            setAnalysisResultEntityTags(resultEntityTags);
          }}
          selectedEntityCondition={setSelectedEntityCondition}
          entityTags={entityTags}
        />
      )}

      {showDownloadPanel && (
        <DownloadSimulationResultsModal
          inputData={mapData}
          closeHandler={() => {
            setShowDownloadPanel(false);
          }}
          hierarchyIdentifier={selectedHierarchy?.identifier}
        />
      )}
      {showUploadModal && (
        <UploadSimulationData
          dataFunction={uploadDataHandler}
          closeHandler={setShowUploadModal}
          setLayerDetail={(detail: AnalysisLayer) => {
            setAnalysisLayerDetails(details => {
              let newDetail: AnalysisLayer[] = [];
              details.forEach(existingDetail => newDetail.push(existingDetail));
              newDetail.push(detail);
              return newDetail;
            });
            setShowAnalysisPanel(false);
          }}
        />
      )}
      {showSaveHierarchyPanel && (
        <SaveHierarchyModal
          submitSimulationRequestData={submitSimulationRequestData}
          setShowModal={setShowSaveHierarchyPanel}
          aggregationSummary={aggregationSummary}
          mapdata={mapData}
          selectedHierarchy={selectedHierarchy}
          updateHierarchyLists={updateHierarchyLists}
          aggregationSummaryDefinition={aggregationSummaryDefinition}
          markedLocations={markedLocations}
          markedParents={markedParents}
        />
      )}
      {showAnalysisPanel && (
        <SimulationAnalysisPanel
          setLayerDetail={(detail: AnalysisLayer) => {
            setAnalysisLayerDetails(details => {
              let newDetail: AnalysisLayer[] = [];
              details.forEach(existingDetail => newDetail.push(existingDetail));
              newDetail.push(detail);
              return newDetail;
            });
            setShowAnalysisPanel(false);
          }}
          submitHandler={(layers: AnalysisLayer) => {
            proceedToSearchAfterAnalysis(loadParentsToggle, analysisResultEntityTags, layers);
          }}
          closeHandler={() => {
            setShowAnalysisPanel(false);
          }}
        />
      )}
    </>
  );
};
export default Simulation;
