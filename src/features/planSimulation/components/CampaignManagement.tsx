import { re } from 'mathjs';
import { useRef, useState, useEffect } from 'react';
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

import { getHierarchy, getHierarchyPolygon, getPlanInfo } from './SimulationMapView/api/hierarchyAPI';
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

import {
  AddDatasetResponse,
  DataSetList,
  deleteDataset,
  getLocationPolygonsWithDatasets,
  getSimulationData,
  LocationData
} from './SimulationMapView/api/datasetsAPI';

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

  const { dispatch } = usePolygonContext();
  const { state } = usePolygonContext();
  const [labels, setLabels] = useState<string[]>([]);

  const fetchSimulationAndData = async () => {
    const simulationIdentifier = await fetchPlanInfo();

    try {
      const simulationData = await getSimulationData(simulationIdentifier);
      dispatch({ type: 'SET_NEW_DATASETS', payload: simulationData.datasets });
      dispatch({ type: 'SET_SIMULATION_ID', payload: simulationData.identifier });
      dispatch({ type: 'SET_TARGET_AREAS', payload: simulationData.targetAreas });
    } catch (error) {
      console.error('Failed to fetch simulation:', error);
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

  const handleAddDataset = (datasetResponse: AddDatasetResponse) => {
    const dataset = {
      identifier: datasetResponse.datasetId,
      name: datasetResponse.datasetName,
      hexColor: datasetResponse.hexColor,
      lineWidth: datasetResponse.lineWidth
    };

    dispatch({ type: 'ADD_DATASET', payload: dataset });

    //! LOOP LOCATIONS WITH METADA AND ATTACH DATASET DATA TO LOADED POLYGONS
    setPolygonsWithData((prev: any) => {
      const updatedPolygons = { ...prev };

      Object.entries(datasetResponse.locationWithMetadata).forEach(([locationId, metadata]) => {
        if (updatedPolygons[locationId]) {
          const existingMetadata = updatedPolygons[locationId].polygonData.properties.metadata || [];
          updatedPolygons[locationId].polygonData.properties.metadata = Array.from(
            new Set([...existingMetadata, metadata])
          );
        }
      });
      return updatedPolygons;
    });
  };

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
  const fetchHierarchy = async () => {
    const hierarchyData = await getHierarchy();
    try {
      setHighestLocations(hierarchyData);
      dispatch({ type: 'SET_HIERARCHY', payload: hierarchyData });
    } catch (error) {
      console.error('Failed to fetch hierarchy:', error);
    }
  };
  const fetchPlanInfo = async () => {
    try {
      const planInfo = await getPlanInfo();
      return planInfo.identifier;
    } catch (error) {
      console.error('Failed to fetch plan info:', error);
    }
  };
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

  const updateDatasetHandler = async (newDatasetList: string) => {
    dispatch({ type: 'SET_DATASET', payload: newDatasetList });
  };

  const removeDatasetHandler = async (datasetId: string) => {
    deleteDataset({
      simulationId: state.simulationId,
      datasetId
    });
    dispatch({ type: 'DELETE_DATASET', payload: datasetId });
  };

  useEffect(() => {
    fetchHierarchy();
    fetchSimulationAndData();
  }, []);

  const loadLocationHandler = async (locationId: string) => {
    setCurrentLocationId(locationId);
    if (state.datasets.length === 0 && polygonsWithData?.[locationId]?.childrenLoaded) {
      setIncludeGeometry(false);

      const k = Object.values(polygonsWithData)
        .map((polygon: any) => polygon.polygonData)
        .filter(p => p.properties.parentIdentifier === locationId);

      setSelectedLocationChildren(k);

      const selectedLocation = polygonsWithData?.[locationId]?.polygonData;
      if (selectedLocation) {
        setGeometry(selectedLocation);
        setToLocation(JSON.parse(JSON.stringify(bbox(selectedLocation.geometry))));
      }
    } else {
      const includeGeometry: boolean = checkifChildrenLoaded(polygonsWithData, locationId);

      let configObj: LocationData = {
        datasetsIds: datasetList.map(dataset => dataset.identifier),
        includeGeometry: includeGeometry,
        parentLocationId: locationId, //current location identifier
        simulationId: state.simulationId
      };

      const polygonsWithDatasets = await getLocationPolygonsWithDatasets(configObj);

      if (includeGeometry) {
        setPolygonsWithData((prev: any) => {
          const updatedPolygons = { ...prev };
          polygonsWithDatasets.forEach((location: any) => {
            updatedPolygons[location.identifier] = {
              polygonData: location,
              childrenLoaded: location.identifier === locationId
            };
          });

          return updatedPolygons;
        });
      } else {
        setPolygonsWithData((prev: any) => {
          const updatedPolygons = { ...prev };
          polygonsWithDatasets.forEach((location: any) => {
            updatedPolygons[location.identifier].polygonData.properties.metadata = location.properties.metadata;
          });

          return updatedPolygons;
        });
      }
    }
  };
  const campaignTotals = [
    {
      label: 'Target Areas',
      total: state.targetAreas.length,
      targetAreasList: state.targetAreas
    },
    {
      label: 'Total Population',
      total: Math.round(state.targetAreas?.reduce((a, b) => a + b?.properties?.population?.sum, 0)) || 0,
      targetAreasList: state.targetAreas
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
          <Drawer open={leftOpen} anchor="left" heading="Campaign Manager">
            {/* {highestLocations && showResult && ( */}
            {highestLocations &&
              (console.log('highestLocations', highestLocations),
              (
                <Accordion title="Hierarchy" open={resultsLoadingState === 'complete'}>
                  <Hierarchy clickHandler={loadLocationHandler} />
                  <DrawerButton onClick={() => setOpenCustomModal(0)}>Add Operational Area</DrawerButton>
                  <CustomPopup isOpen={openCustomModal === 0} onClose={() => setOpenCustomModal(undefined)} hasBackdrop>
                    <AddTargetAreaForm onClose={() => setOpenCustomModal(undefined)} />
                  </CustomPopup>
                </Accordion>
              ))}
            {/* {highestLocations && showResult && ( */}
            <Accordion title="Teams" open>
              <Teams />
              {/* <Button className={style.buttonPrimary} onClick={() => setShowModal(true)}>
                Manage Teams
              </Button> */}
              <div className={style.modalContainer}>
                <UserModal className={style.modalButton} show={showModal} onHide={() => setShowModal(false)} />
              </div>
            </Accordion>
          </Drawer>
          <SimulationMapView
            selectedLoaction={geometry} // BBBOX
            currentLocationChildren={selectedLocationChildren}
            // polygons={extractPolygonsFromPolysWithData(polygonsWithData)} // LIST OF POLYGONS
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
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                padding: '1rem'
              }}
            >
              Performance
            </span>
            <Accordion title="Targets" open>
              <Target />
            </Accordion>
            {/* <Accordion title="Targets" open>
              {campaignTotals.map((item, index) => (
                <CampaignTotalsAccordion key={index} campaignTotals={item} />
              ))}
            </Accordion> */}
          </Drawer>
        </div>
      </Container>
    </>
  );
};

export default CampaignManagement;
