import { re } from 'mathjs';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { useWindowResize } from '../../../hooks/useWindowResize';
import { getGeneratedLocationHierarchyList, getLocationHierarchyList } from '../../location/api';
import { LocationHierarchyModel } from '../../location/providers/types';
import { Drawer } from '../../location/components/drawer/Drawer';
import Accordion from '../../location/components/accordion/Accordion';
import DrawerButton from '../../../components/DrawerButton/DrawerButton';
import { CustomPopup } from '../../../components/CustomPopup/CustomPopup';
import Target from './Campaign/Target';
import Teams from './Teams/Teams';
import UserModal from './UsersModal';
import style from './CampaignManagement.module.css';
import { bbox, Geometry, polygon } from '@turf/turf';
import { LngLatBounds, Map as MapBoxMap } from 'mapbox-gl';

import {
  getDefaultHierarchyData,
  getHierarchy,
  getHierarchyPolygon,
  // getPlanInfo,
  getPlans
} from './SimulationMapView/api/hierarchyAPI';
import Hierarchy from './Hierarchy/Hierarchy';
import SimulationMapView from './SimulationMapView/SimulationMapView';
import { Color } from 'react-color-palette';
import { hex } from 'color-convert';
import { usePolygonContext } from '../../../contexts/PolygonContext';
import AddTargetAreaForm from './SimulationMapView/components/AddTargetAreaForm/AddTargetAreaForm';
import AddDatasetForm from './SimulationMapView/components/AddDatasetForm/AddDatasetForm';
import CampaignTotalsAccordion from './SimulationMapView/components/CampaignTotalsAccordion/CampaignTotalsAccordion';
import DatasetsAccordion from '../../location/components/DatasetsAccordion/DatasetsAccordion';
import Dashboard from './Dashboard/Dashboard';

import {
  getDataAssociatedEntityTags,
  getEntityList,
  getEventBasedEntityTags,
  getFullLocationsSSE,
  getInstanceHierarchy,
  getInstances,
  getLocationsSSE,
  getNodeOrder,
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

import {
  AddDatasetResponse,
  DataSetList,
  deleteDataset,
  getLocationPolygonsWithDatasets,
  getSimulationData,
  LocationData
} from './SimulationMapView/api/datasetsAPI';
import { toast } from 'react-toastify';
import { assignLocationsToPlan } from '../../assignment/api';
import { getReportForLocation } from '../reportsAPI/reportsApi';
import { getOrganizatonsWithMembers } from './Teams/api/teamAPI';
import { getPlanTargetLevelName } from '../../../utils';
import Select, { SingleValue } from 'react-select';
import styles from './Simulation.module.css';
import AuthorizedElement from '../../../components/AuthorizedElement';
import { useAppSelector } from '../../../store/hooks';
import { useAuthorization } from '../../../hooks/useAuthorization';
import { CAMPAIGN_MANAGEMENT_INSTANCE_SELECTION, REDIRECT_TO_ASSIGNED_CAMPAIGN } from '../../../constants';

export interface Stats {
  [key: string]: Metadata;
}
export interface Children {
  level: string;
  childrenList: string[];
}
export interface StatsLayer {
  [layer: string]: Stats;
}
export interface MarkedLocation {
  identifier: string;
  ancestry: string[] | undefined;
}
export interface AnalysisLayer {
  labelName: string;
  color: Color;
  colorHex: string;
}

const CampaignManagement = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const isAuthorizedForRedirectingToACampaign = useAuthorization([REDIRECT_TO_ASSIGNED_CAMPAIGN])
  const isAuthorizedForRenderingInstances = useAuthorization([CAMPAIGN_MANAGEMENT_INSTANCE_SELECTION])
  const instanceContext = useAppSelector(state => state.instanceContext);
  // console.log("ISNTANCE", instanceContext)
  const divHeight = useWindowResize(divRef.current);
  const [mapFullScreen, setMapFullScreen] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [combinedHierarchyList, setCombinedHierarchyList] = useState<LocationHierarchyModel[]>();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [highestLocations, setHighestLocations] = useState<any>();
  const [resultsLoadingState, setResultsLoadingState] = useState<'notstarted' | 'error' | 'started' | 'complete'>(
    'notstarted'
  );
  const [parentsLoadingState, setParentsLoadingState] = useState<'notstarted' | 'error' | 'started' | 'complete'>(
    'notstarted'
  );
  const [currentLocationId, setCurrentLocationId] = useState<string>();
  const [polygonsWithData, setPolygonsWithData] = useState<any>();
  const [includeGeometry, setIncludeGeometry] = useState<boolean>(true);
  const [selectedLocationChildren, setSelectedLocationChildren] = useState<any[]>([]);
  const [geometry, setGeometry] = useState<Geometry>();
  const [toLocation, setToLocation] = useState<LngLatBounds>();
  const [resetMap, setResetMap] = useState<boolean>(false);
  const [mapData, setMapData] = useState<PlanningLocationResponseTagged>();
  const [statsLayerMetadata, setStatsLayerMetadata] = useState<StatsLayer>({});
  const map = useRef<MapBoxMap>();
  const [markedLocations, setMarkedLocations] = useState<MarkedLocation[]>([]);
  const [datasetList, setDatasetList] = useState<DataSetList[]>([]);
  const [openCustomModal, setOpenCustomModal] = useState<number>();
  const [entityTags, setEntityTags] = useState<EntityTag[]>([]);
  const [entityTagsOriginal, setEntityTagsOriginal] = useState<EntityTag[]>([]);
  const [parentMapData, setParentMapData] = useState<PlanningParentLocationResponse>();
  const [parentChild, setParentChild] = useState<{ [parent: string]: Children }>({});
  const [analysisResultEntityTags, setAnalysisResultEntityTags] = useState<EntityTag[]>();
  const [analysisLayerDetails, setAnalysisLayerDetails] = useState<AnalysisLayer[]>([]);
  const [chartData, setChartData] = useState<Record<string, number[]>>({});
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [selectedMapData, setSelectedMapData] = useState<any>();
  const [summary, setSummary] = useState<any>({});
  const levelsLoaded = useRef<string[]>([]);
  const [aggregationSummary, setAggregationSummary] = useState<LocationMetadataObj>({});
  const [aggregationSummaryDefinition, setAggregationSummaryDefinition] = useState<MetadataDefinition>({});
  const [mapDataLoad, setMapDataLoad] = useState<PlanningLocationResponse>({
    features: [],
    parents: [],
    type: 'FeatureCollection',
    identifier: undefined,
    method: undefined,
    source: undefined
  });

  const [locationReport, setLocationReport] = useState<any>({});
  const [teamsList, setTeamsList] = useState<any[]>([]);

  const { dispatch } = usePolygonContext();
  const { state } = usePolygonContext();
  const [labels, setLabels] = useState<string[]>([]);
  const [plans, setPlans] = useState<any[]>();
  const [instances, setInstances] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<any>();
  const [selectedInstance, setSelectedInstance] = useState<any>()
  const [rfForTeam, setRfForTeam] = useState(false)

  const fetchSimulationAndData = async (selectedPlan: any) => {
    const simulationIdentifier = await fetchPlanInfo(selectedPlan);

    try {
      const simulationData = await getSimulationData(simulationIdentifier);
      dispatch({ type: 'SET_NEW_DATASETS', payload: simulationData.datasets });
      dispatch({ type: 'SET_SIMULATION_ID', payload: simulationData.identifier });
      dispatch({ type: 'SET_TARGET_AREAS', payload: simulationData.targetAreas });
    } catch (error) {
      console.error('Failed to fetch simulation:', error);
    }
  };

  const fetchDefaultHierarchyData = async () => {
    const hierarchyData = await getDefaultHierarchyData();
    try {
      dispatch({ type: 'SET_DEFAULT_HIERARCHY_DATA', payload: hierarchyData });
    } catch (error) {
      console.error('Failed to fetch hierarchy data:', error);
    }
  };

  useMemo(() => {
    setDatasetList(state.datasets);
  }, [state.datasets]);

  // we are updating selectedLocationChildren whenever an assignment happens,
  // because assigned flag on these locations is not updated (it is still the one we got on location fetch)
  useEffect(() => {
    setSelectedLocationChildren(prev =>
      prev.map(obj => ({
        ...obj,
        properties: {
          ...obj.properties,
          assigned: state.assingedLocations[obj.identifier]
        }
      }))
    );
  }, [state.assingedLocations]);

  useEffect(() => {
    setSelectedLocationChildren(prev =>
      prev.map(obj => {
        const updatedObj = {
          ...obj,
          teams: state.locationsTeamsMap[obj.identifier],
          properties: {
            ...obj.properties,
            numberOfTeams: Object.values(state.locationsTeamsMap[obj.identifier]).length || 0
          }
        };
        return updatedObj;
      })
    );
  }, [state.locationsTeamsMap]);

  useEffect(() => {
    if (currentLocationId && polygonsWithData && polygonsWithData[currentLocationId]) {
      const children = Object.values(polygonsWithData)
        .map((polygon: any) => polygon.polygonData)
        .filter((polygon: any) => polygon.properties.parentIdentifier === currentLocationId);
      console.log('state.locationsWithAssignedTeams', children);
    }
  }, [currentLocationId, polygonsWithData]);

  // useEffect(() => {
  //   if (currentLocationId && polygonsWithData && polygonsWithData[currentLocationId]) {
  //     const children = Object.values(polygonsWithData)
  //       .map((polygon: any) => polygon.polygonData)
  //       .filter((polygon: any) => polygon.properties.parentIdentifier === currentLocationId);

  //     setSelectedLocationChildren(children);

  //     // when locations loaded, we are setting their assigned flag values as default values in assignment map
  //     // this way, state.assignedLocations is our single source of truth
  //     // const locationsWithTeams = children.reduce(
  //     //   (acc, location) => {
  //     //     return {
  //     //       ...acc,
  //     //       [location.identifier]: acc[location.identifier] ?? location.teams
  //     //     };
  //     //   },
  //     //   { ...state.locationsWithAssignedTeams }
  //     // );

  //     // console.log(locationsWithTeams);

  //     // dispatch({ type: 'LOCATIONS_WITH_TEAMS_ASSIGNED', payload: locationsWithTeams });
  //   }
  // }, [currentLocationId, polygonsWithData]);

  useEffect(() => {
    if (currentLocationId && polygonsWithData && polygonsWithData[currentLocationId]) {
      const children = Object.values(polygonsWithData)
        .map((polygon: any) => polygon.polygonData)
        .filter((polygon: any) => polygon.properties.parentIdentifier === currentLocationId);

      setSelectedLocationChildren(children);

      // when locations loaded, we are setting their assigned flag values as default values in assignment map
      // this way, state.assignedLocations is our single source of truth
      const assignedMap = children.reduce(
        (map, obj) => {
          return {
            ...map,
            [obj.identifier]: map[obj.identifier] ?? obj.properties.assigned
          };
        },
        { ...state.assingedLocations }
      );

      const locationsTeamsMap = children.reduce(
        (map, obj) => {
          return {
            ...map,
            [obj.identifier]: map[obj.identifier] ?? (obj.teams || [])
          };
        },
        { ...state.locationsTeamsMap }
      );

      dispatch({ type: 'SET_ASSIGNED', payload: assignedMap });
      dispatch({ type: 'SET_LOCATIONS_TEAMS_MAP', payload: locationsTeamsMap });

      const selectedLocation = polygonsWithData[currentLocationId].polygonData;

      if (selectedLocation) {
        setGeometry(selectedLocation);
        setToLocation(JSON.parse(JSON.stringify(bbox(selectedLocation.geometry))));

        // report on location
        getReportForLocation(state.planid, selectedLocation.identifier).then(report => {
          setLocationReport(report);
        });

        const populationData = transformPopulationData(selectedLocation?.properties?.population);
        if (populationData !== null) {
          setChartData(populationData.chartData);
          setLabels(populationData.labels);
          setTotals(populationData.totals);
        }
      }
    }
  }, [currentLocationId, polygonsWithData]);

  useEffect(() => {
    let populationData: any;
    if (state.selected) {
      populationData = state.selected.population
        ? transformPopulationData(JSON.parse(state.selected.population))
        : null;

      getReportForLocation(state.planid, state.selected.id).then(report => {
        setLocationReport(report);
      });
      if (populationData !== null) {
        setChartData(populationData.chartData);
        setLabels(populationData.labels);
        setTotals(populationData.totals);
      }
    } else if (!state.selected && currentLocationId) {
      const selectedLocation = polygonsWithData[currentLocationId].polygonData;
      const populationData = transformPopulationData(selectedLocation?.properties?.population);
      if (populationData !== null) {
        setChartData(populationData.chartData);
        setLabels(populationData.labels);
        setTotals(populationData.totals);
      }
    }
  }, [state.selected]);

  useEffect(() => {
    // if (Array.isArray(instances) && instances?.length === 0) {
    if (isAuthorizedForRedirectingToACampaign && instanceContext?.selectedInstance?.identifier) {
      // instanceContext
      // alert("Empty..")
      // console.log(instanceContext, 'IC')
      fetchHierarchy(instanceContext?.selectedInstance?.identifier as any);
      fetchSimulationAndData(instanceContext?.instancePlan as any);
      // fetchDefaultHierarchyData();
    }
    if (selectedPlan) {
      fetchHierarchy(selectedPlan.identifier);
      fetchSimulationAndData(selectedPlan);
      // fetchDefaultHierarchyData();
    }
  }, [selectedPlan, instances]);


  useEffect(() => {
    // getPlans().then(planInfo => {
    //   setPlans(planInfo);
    // });
    if (!isAuthorizedForRenderingInstances) return
    getInstances(0, 1000).then(instanceInfo => {
      // setInstances(instanceInfo);
      // console.log(instanceInfo?.content, 'Instances Listing')
      setInstances(instanceInfo?.content)
      // setInstances([])
    });
  }, [isAuthorizedForRenderingInstances]);

  // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

  // useEffect(() => {
  //   Promise.all([
  //     getLocationHierarchyList(50, 0, true),
  //     getEntityList(),
  //     getGeneratedLocationHierarchyList()
  //     // getComplexTagReponses()
  //   ])
  //     .then(([locationHierarchyList, entityList, generatedHierarchyList]) => {
  //       let generatedHierarchyItems = generatedHierarchyList?.map(generatedHierarchy => {
  //         return {
  //           identifier: generatedHierarchy.identifier,
  //           name: generatedHierarchy.name,
  //           nodeOrder: generatedHierarchy.nodeOrder,
  //           type: HierarchyType.GENERATED
  //         };
  //       });

  //       let list = locationHierarchyList?.content.map(savedHierarchy => {
  //         return {
  //           identifier: savedHierarchy.identifier,
  //           name: savedHierarchy.name,
  //           nodeOrder: savedHierarchy.nodeOrder,
  //           type: HierarchyType.SAVED
  //         };
  //       });

  //       let combinedList = list.concat(generatedHierarchyItems);
  //       setCombinedHierarchyList(combinedList);

  //       // setComplexTags(complexTagResponses);
  //     })
  //     .catch(err => toast.error(err));
  // }, []);

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
    }
  }, [markedLocations]);

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
    if (mapData && mapData?.features && Object.keys(mapData?.features).length > 0) {
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

        // if (mapData.parents) {
        //   let highestLocations: any[] = Object.keys(mapData.parents)
        //     .filter(
        //       key =>
        //         mapData.parents[key].properties !== null &&
        //         mapData.parents[key].properties?.geographicLevelNodeNumber === min
        //     )
        //     .map(key => mapData.parents[key]);
        //   // setHighestLocations(highestLocations);
        // }
      }
    }
  }, [mapData, getLocationHierarchyFromLowestLocation, markedLocations]);
  // console.log("NODE_ORDER", state?.nodeOrder)
  const fetchHierarchy = async (instanceId: string) => {
    // const hierarchyData = await getHierarchy();
    const hierarchyData = await getInstanceHierarchy(instanceId)
    const nodeOrder = await getNodeOrder(instanceId)
    try {
      setHighestLocations(hierarchyData);
      dispatch({ type: 'SET_HIERARCHY', payload: hierarchyData });
      // dispatch({ type: 'SET_DEFAULT_HIERARCHY_DATA', payload: { nodeOrder: nodeOrder || [] } });
      dispatch({ type: "SET_NODE_ORDER", payload: nodeOrder })
    } catch (error) {
      console.error('Failed to fetch hierarchy:', error);
    }
  };
  const fetchPlanInfo = async (selectedPlan: any) => {
    try {
      const planInfo = selectedPlan;
      dispatch({ type: 'SET_PLANID', payload: planInfo.planIdentifier || planInfo?.identifier });
      dispatch({ type: 'SET_PLAN_TARGET_TYPE', payload: planInfo?.planTargetType });
      return planInfo?.planIdentifier || planInfo?.identifier;
    } catch (error) {
      console.error('Failed to fetch plan info:', error);
    }
  };

  const checkifChildrenLoaded = (polygonsWithData: any, selectedLocationId: any) => {
    if (polygonsWithData?.[selectedLocationId]?.childrenLoaded === undefined) {
      return true;
    } else if (polygonsWithData?.[selectedLocationId]?.childrenLoaded === true) {
      return false;
    } else {
      return true;
    }
  };

  // useEffect(() => {
  //   fetchHierarchy();
  //   fetchSimulationAndData();
  // }, []);

  const loadLocationHandler = async (locationId: string) => {
    dispatch({ type: 'SET_DETAILS_POPUP_REF', payload: null });
    dispatch({ type: 'CLEAR_SELECTION' });

    setCurrentLocationId(locationId);
    // If children already loaded, skip fetching
    if (polygonsWithData?.[locationId]?.childrenLoaded) {
      handleChildrenAlreadyLoaded(locationId);
      return;
    }

    const includeGeometry = checkifChildrenLoaded(polygonsWithData, locationId);
    const parentGeoLevel = polygonsWithData?.[locationId]?.polygonData?.properties?.geographicLevel || '';

    if (includeGeometry) {
      const configObj: LocationData = {
        datasetsIds: [],
        includeGeometry,
        parentLocationId: locationId,
        simulationId: state.simulationId,
        campaignManagementFeatures: true
      };
      // console.log("NODE_ORDR", state.nodeOrder)
      const targetLevelName = getPlanTargetLevelName(state.nodeOrder, state.planTargetType);
      // If location clicked is level above structures, we need to load only its polygon
      // and show a tip to load structures in the area by zooming in on the map
      if (parentGeoLevel !== targetLevelName) {
        const polygonsResponse = await getLocationPolygonsWithDatasets(configObj);
        if (!polygonsResponse || polygonsResponse.length === 0) {
          toast.error('Cannot get results. Please try again.');
          return;
        }
        updatePolygonsData(polygonsResponse, includeGeometry, locationId);
      } else {
        toast.info('Please zoom in to see structures data.');
      }
    }
  };

  const handleChildrenAlreadyLoaded = (locationId: string) => {
    setIncludeGeometry(false);

    const selectedChildren = Object.values(polygonsWithData)
      .map((polygon: any) => polygon.polygonData)
      .filter(p => p.properties.parentIdentifier === locationId);

    setSelectedLocationChildren(selectedChildren);

    const selectedLocation = polygonsWithData?.[locationId]?.polygonData;
    if (selectedLocation) {
      setGeometry(selectedLocation);
      setToLocation(JSON.parse(JSON.stringify(bbox(selectedLocation.geometry))));
    }
  };

  const updatePolygonsData = (polygonsWithDatasets: any[], includeGeometry: boolean, locationId: string) => {
    setPolygonsWithData((prev: any) => {
      const updatedPolygons = { ...prev };

      if (includeGeometry) {
        polygonsWithDatasets.forEach(location => {
          updatedPolygons[location.identifier] = {
            polygonData: location,
            childrenLoaded: location.identifier === locationId
          };
        });
      } else {
        polygonsWithDatasets.forEach(location => {
          if (updatedPolygons[location.identifier]) {
            updatedPolygons[location.identifier].polygonData.properties.metadata = location.properties.metadata;
          }
        });
      }

      return updatedPolygons;
    });
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
      }
    }
  }, [selectedMapData, summary, processChildren]);

  const handleRemoveTargetArea = (id: string) => {
    const assignedAreas = state.targetAreas?.flatMap((ta: any) => [...ta.ancestry, ta.identifier]) || [];
    const targetArea = state.targetAreas?.find(ta => ta.identifier === id);
    const toExcludeSet = new Set([...targetArea.ancestry, id]);
    const filtered = assignedAreas.filter(item => !toExcludeSet.has(item));
    assignLocationsToPlan(state.planid, filtered).then(async () => {
      // update assignment map
      dispatch({ type: 'SET_ASSIGNED', payload: { ...state.assingedLocations, [id]: false } });
      // refetch target areas, so the map updates
      const simulationData = await getSimulationData(state.planid);
      dispatch({ type: 'SET_TARGET_AREAS', payload: simulationData.targetAreas });
      dispatch({ type: 'CLEAR_SELECTION' });
    });
  };

  const fetchTeamsData = async () => {
    if (isAuthorizedForRedirectingToACampaign && instanceContext?.selectedInstance?.identifier) {
      getOrganizatonsWithMembers(instanceContext?.selectedInstance?.identifier as any).then((data: any) => {
        setTeamsList(data);
      });
      return
    }
    let found = instances?.find((plan: any) => plan.identifier === selectedPlan?.identifier);

    getOrganizatonsWithMembers(found?.identifier as any).then((data: any) => {
      setTeamsList(data);
    });
  };

  const campaignTotals = {
    label: 'Target Areas',
    total: state.targetAreas.length,
    targetAreasList: state.targetAreas,
    remove: handleRemoveTargetArea
  };

  // map zoom in for the structures lifts up the state, so we still have a single source of truth
  const updateChildrenPolygons = (data: any) => {
    setSelectedLocationChildren(prev => [...prev, ...data]);
  };

  const handlePlanSelectionChange = (option: SingleValue<{ value: string; label: string }>) => {
    let found = instances?.find((plan: any) => plan.identifier === option?.value);
    if (found) {
      setSelectedPlan(found);
      setRfForTeam(!rfForTeam)
    }
  };
  console.log(instances, 'Selected plan')
  return (
    <>
      <Container fluid ref={divRef}>
        <div style={{ display: 'flex', position: 'relative' }}>
          <Drawer open={leftOpen} anchor="left" heading="Campaign Manager">
            {(isAuthorizedForRenderingInstances && instances?.length > 0) && (
              <Accordion title="Instances" open={selectedPlan == null}>
                {/* <Select
                  placeholder={'Select Plan'}
                  className={styles.select_small}
                  options={plans.map((plan: any) => {
                    return {
                      value: plan.identifier,
                      label: plan.title
                    };
                  })}
                  onChange={(selectedOption: SingleValue<{ value: string; label: string }>) => {
                    handlePlanSelectionChange(selectedOption);
                  }}
                /> */}
                <div style={{ height: '400px', overflowY: 'auto' }}>
                  <Select
                    placeholder={'Select Instances'}
                    className={styles.select_small}
                    options={instances?.map((instance: any) => {
                      return {
                        value: instance.identifier,
                        label: instance.instanceName
                      };
                    })}
                    onChange={(selectedOption: SingleValue<{ value: string; label: string }>) => {
                      handlePlanSelectionChange(selectedOption);
                    }}
                  />
                </div>
              </Accordion>
            )}
            {highestLocations && (
              <Accordion title="Hierarchy" open={resultsLoadingState === 'complete'}>
                <Hierarchy clickHandler={loadLocationHandler} />
              </Accordion>
            )}
            {selectedPlan?.identifier && <Accordion title="Teams" open>
              <Teams rf={rfForTeam} teamsList={teamsList} fetchTeamsData={fetchTeamsData} />
              {/* <AuthorizedElement roles={[]}>
              <DrawerButton onClick={() => setOpenCustomModal(1)}>Manage Teams</DrawerButton>
              </AuthorizedElement> */}
              <CustomPopup isOpen={openCustomModal === 1} onClose={() => setOpenCustomModal(undefined)} hasBackdrop>
                <UserModal fetchTeamsData={fetchTeamsData} />
              </CustomPopup>
            </Accordion>}
          </Drawer>
          <SimulationMapView
            teamsList={teamsList} //list of teams
            selectedLoaction={geometry} // BBBOX
            currentLocationChildren={selectedLocationChildren}
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
            updateChildrenPolygons={updateChildrenPolygons}
          />
          <Drawer open={rightOpen} anchor="left" heading="Performance">
            {Object.keys(locationReport).length > 0 && (
              <Accordion title="Statistics" open>
                <Dashboard
                  polulationChart={false}
                  buildingsChart={false}
                  targetAreaChart={true}
                  chartLabels={labels}
                  chartData={chartData}
                  locationReport={locationReport}
                  totals={totals}
                />
              </Accordion>
            )}
            {campaignTotals.targetAreasList.length !== 0 && (
              <Accordion title="Targets" open>
                <Target targetAreas={campaignTotals} />
              </Accordion>
            )}
          </Drawer>
        </div>
      </Container>
    </>
  );
};

export default CampaignManagement;

const transformPopulationData = (population: any) => {
  const mergedPyramids = mergeAgeGroups(population?.Pyramids) || [];
  if (!mergedPyramids || mergedPyramids.length === 0) {
    return null;
  }
  const ageGroups = mergedPyramids.map((group: any) => group.AgeGroup.replace('_', '-'));
  const summaryData = mergedPyramids.map((group: any) => Math.round(group.TotalPop));
  const maleData = mergedPyramids.map((group: any) => Math.round(group.MalePop));
  const femaleData = mergedPyramids.map((group: any) => Math.round(group.FemalePop));

  return {
    labels: ageGroups,
    chartData: {
      summary: summaryData,
      male: maleData,
      female: femaleData
    },
    totals: {
      summary: Math.round(population.sum),
      male: Math.round(population.male),
      female: Math.round(population.female)
    }
  };
};

const mergeAgeGroups = (pyramids: any[]) => {
  if (!pyramids || pyramids.length === 0) return [];
  const mergedGroups: any[] = [];

  for (let i = 0; i < pyramids.length; i += 2) {
    const first = pyramids[i];
    const second = pyramids[i + 1] || null;

    const mergedGroup = {
      AgeGroup: second
        ? `${first.AgeGroup.split('_')[0]}-${second.AgeGroup.split('_')[1]}`
        : first.AgeGroup.replace('_', '-'),
      MalePop: Math.round(first.MalePop + (second?.MalePop || 0)),
      FemalePop: Math.round(first.FemalePop + (second?.FemalePop || 0)),
      TotalPop: Math.round(first.TotalPop + (second?.TotalPop || 0))
    };

    mergedGroups.push(mergedGroup);
  }

  return mergedGroups;
};
