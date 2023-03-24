import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'simplebar/dist/simplebar.min.css';
import { PageableModel } from '../../../api/providers';
import { ActionDialog } from '../../../components/Dialogs';
import { useWindowResize } from '../../../hooks/useWindowResize';
import { getLocationHierarchyList } from '../../location/api';
import { LocationHierarchyModel } from '../../location/providers/types';
import {
  getEntityList,
  getEntityTags,
  getFullLocationsSSE,
  getLocationList,
  getLocationsSSE,
  submitSimulationRequest
} from '../api';
import {
  EntityTag,
  OperatorSignEnum,
  PlanningLocationResponse,
  PlanningLocationResponseTagged,
  PlanningParentLocationResponse,
  RevealFeature,
  SearchLocationProperties
} from '../providers/types';
import FormField from './FormField/FormField';
import MultiFormField from './FormField/MultiFormField';
import SimulationMapView from './SimulationMapView';
import SimulationModal from './SimulationModal';
import Select, { MultiValue, SingleValue } from 'react-select';
import PeopleDetailsModal from './PeopleDetailsModal';
import { bbox, Feature, MultiPolygon, Point, Polygon } from '@turf/turf';
import { LngLatBounds } from 'mapbox-gl';

import SimulationResultExpandingTable from '../../../components/Table/SimulationResultExpandingTable';
import TableSummaryModal from './Summary/TableSummaryModal';
import SearchResultCountModal from './modals/SearchResultCountModal';
import DownloadSimulationResultsModal from './modals/DownloadSimulationResultsModal';
import UploadSimulationData from './modals/UploadSimulationData';

interface SubmitValue {
  fieldIdentifier: string;
  fieldType: string;
  entityIdentifier: string;
  searchValue?: SearchValue;
  values?: SearchValue[];
  range?: {
    minValue: number;
    maxValue: number;
  };
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

const Simulation = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [hierarchyList, setHierarchyList] = useState<PageableModel<LocationHierarchyModel>>();
  const [selectedEntity, setSelectedEntity] = useState<string>();
  const [selectedEntityCondition, setSelectedEntityCondition] = useState<EntityTag>();
  const [selectedEntityConditionList, setSelectedEntityConditionList] = useState<EntityTag[]>([]);
  const divRef = useRef<HTMLDivElement>(null);
  const divHeight = useWindowResize(divRef.current);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [mapData, setMapData] = useState<PlanningLocationResponseTagged>();
  const [parentMapData, setParentMapData] = useState<PlanningParentLocationResponse>();
  const [mapDataLoad, setMapDataLoad] = useState<PlanningLocationResponse>({
    features: [],
    parents: [],
    type: 'FeatureCollection',
    identifier: undefined
  });
  const [parentMapDataLoad, setParentMapDataLoad] = useState<PlanningParentLocationResponse>();
  const [nodeList, setNodeList] = useState<string[]>([]);
  const [completeGeographicList, setCompleteGeographicList] = useState<string[]>([]);
  const [locationList, setLocationList] = useState<any[]>([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>();
  const [selectedLocation, setSelectedLocation] = useState<SingleValue<{ label: string; value: string }>>();
  const [selectedRow, setSelectedRow] = useState<SearchLocationProperties>();
  const [toLocation, setToLocation] = useState<LngLatBounds>();
  const [resetMap, setResetMap] = useState<boolean>(false);
  const [entityTags, setEntityTags] = useState<EntityTag[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [highestLocations, setHighestLocations] = useState<Feature<Point | Polygon | MultiPolygon>[]>();
  const [summary, setSummary] = useState<any>({});
  const [selectedMapData, setSelectedMapData] = useState<any>();
  const [showCountResponseModal, setShowCountResponseModal] = useState(false);
  const [selectedFilterGeographicLevelList, setSelectedFilterGeographicLevelList] = useState<string[]>();
  const [simulationCountData, setSimulationCountData] = useState<any>(null);
  const [simulationRequestId, setSimulationRequestId] = useState<string>();
  const [parentsLoaded, setParentsLoaded] = useState(false);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [resultsLoadingState, setResultsLoadingState] = useState<'notstarted' | 'started' | 'complete'>('notstarted');
  const [parentsLoadingState, setParentsLoadingState] = useState<'notstarted' | 'started' | 'complete'>('notstarted');
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

  useEffect(() => {
    Promise.all([getLocationHierarchyList(50, 0, true), getEntityList()])
      .then(([locationHierarchyList, entityList]) => {
        setHierarchyList(locationHierarchyList);

        let entityObj = entityList.find(entity => entity.code === 'Location');
        setSelectedEntity(entityObj?.identifier);
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

  const {
    handleSubmit,
    register,
    reset,
    unregister,
    formState: { errors }
  } = useForm();

  const submitHandlerCount = (form: any) => {
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
          entityIdentifier: requestBody.inputObj.lookupEntityType.identifier,
          fieldType: el.fieldType,
          range: {
            minValue: requestBody.inputValue,
            maxValue: form[el.tag + index + 'range']
          }
        });
      } else if (el.more && el.more.length) {
        arr.push({
          fieldIdentifier: requestBody.inputObj.identifier,
          entityIdentifier: requestBody.inputObj.lookupEntityType.identifier,
          fieldType: el.fieldType,
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
          entityIdentifier: requestBody.inputObj.lookupEntityType.identifier,
          fieldType: el.fieldType,
          searchValue: {
            sign: requestBody.selectedValue ?? OperatorSignEnum.EQUAL,
            value: requestBody.inputValue
          }
        });
      }
    });
    const requestData = {
      hierarchyIdentifier: selectedHierarchy,
      locationIdentifier: selectedLocation?.value,
      entityFilters: arr,
      filterGeographicLevelList: selectedFilterGeographicLevelList,
      inactiveGeographicLevelList: selectedFilterInactiveGeographicLevelList,
      includeInactive: loadParentsToggle
    };
    submitSimulationRequest(requestData)
      .then(res => {
        setSimulationCountData(res);
        setSimulationRequestId(res.searchRequestId);
        setShowCountResponseModal(true);
      })
      .catch(err => toast.error(err));
  };

  const subithandler = () => {
    const requestData = {
      simulationRequestId: simulationRequestId
    };
    getLocationsSSE(requestData, messageHandler, closeConnHandler, openHandler);
    if (loadParentsToggle) {
      getFullLocationsSSE(requestData, parentMessageHandler, closeParentConnHandler, openParentHandler);
    }
  };

  const closeConnHandler = (message: any) => {
    const parents: any = JSON.parse(message.data);

    let mapDataSave: PlanningLocationResponse = {
      features: [],
      parents: parents,
      type: 'FeatureCollection',
      identifier: undefined
    };

    setMapDataLoad(mapDataSave);

    setResultsLoaded(true);
    setResultsLoadingState('complete');
    setShowResult(true);
    setParentsLoaded(true);
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

  const messageHandler = (message: MessageEvent) => {
    // setMapReset(false);
    const res: any = JSON.parse(message.data);
    let mapDataSave: PlanningLocationResponse = {
      features: res.features,
      parents: res.parents,
      type: res.type,
      identifier: res.identifier
    };
    if (mapDataSave.features && mapDataSave.features.length > 0) {
      mapDataSave.features.forEach((el: any) => {
        if (el.properties) {
          el.properties['identifier'] = (el as any).identifier;
        }
      });

      setMapDataLoad(mapDataSave);
    }
  };

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
        identifier: mapData?.identifier
      };
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
        let newMapData: PlanningLocationResponseTagged = initializeNewMapData(mapData);

        if (mapDataLoad.features) {
          mapDataLoad.features.forEach((newFeature: any) => {
            let found = newMapData.features[newFeature.identifier];

            if (!found) {
              newMapData.features[newFeature.identifier] = {
                identifier: newFeature.identifier,
                properties: newFeature.properties,
                type: newFeature.type,
                geometry: newFeature.geometry,
                children: undefined,
                aggregates: undefined
              };
            }
          });
        }

        if (mapDataLoad.parents) {
          mapDataLoad.parents.forEach((newFeature: any) => {
            let found = newMapData.parents[newFeature.identifier];
            if (!found) {
              newMapData.parents[newFeature.identifier] = {
                identifier: newFeature.identifier,
                properties: newFeature.properties,
                type: newFeature.type,
                geometry: newFeature.geometry,
                children: undefined,
                aggregates: newFeature.aggregates
              };
            }
          });
        }
        return newMapData;
      });
    }
  }, [mapDataLoad]);

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
    setSelectedEntityConditionList([]);
    setShowResult(false);
    setMapData(undefined);
    setToLocation(undefined);
    setResetMap(true);
    setParentMapData(undefined);
    levelsLoaded.current = [];
    reset();
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
    }
  };

  const getLocationHierarchyFromLowestLocation = useCallback(
    (lowestLocation: RevealFeature, mapDataClone: PlanningLocationResponseTagged) => {
      let parent: RevealFeature = mapDataClone?.parents[lowestLocation.properties?.parent];

      if (parent) {
        updateParentAsHasResultOrIsResult(parent, lowestLocation, mapDataClone);
        getLocationHierarchyFromLowestLocation(parent, mapDataClone);
      }
    },
    []
  );

  useEffect(() => {
    let mapDataClone: PlanningLocationResponseTagged;
    if (resultsLoaded && parentsLoaded && mapData && mapData?.features && Object.keys(mapData?.features).length > 0) {
      mapDataClone = structuredClone(mapData);

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

        lowestLocations.forEach(lowestLocation => {
          getLocationHierarchyFromLowestLocation(lowestLocation, mapDataClone);
        });
      }

      let min = Number.MAX_VALUE;

      if (min !== null) {
        Object.keys(mapData?.parents).forEach(key => {
          if (mapData?.parents[key]?.properties?.geographicLevelNodeNumber < min) {
            min = mapData?.parents[key]?.properties?.geographicLevelNodeNumber;
          }
        });

        let highestLocations: any[] = Object.keys(mapDataClone.parents)
          .filter(
            key =>
              mapDataClone.parents[key].properties !== null &&
              mapDataClone.parents[key].properties?.geographicLevelNodeNumber === min
          )
          .map(key => mapDataClone.parents[key]);
        console.log('after recursive', highestLocations);
        setHighestLocations(highestLocations);
      }
    }
  }, [mapData, resultsLoaded, parentsLoaded, getLocationHierarchyFromLowestLocation]);

  useEffect(() => {
    if (selectedEntity) {
      getEntityTags(selectedEntity).then(res => setEntityTags(res));
    }
  }, [selectedEntity]);

  const loadLocationHandler = (locationId: string) => {
    let feature = mapData?.features[locationId] || mapData?.parents[locationId];

    if (feature) {
      setToLocation(JSON.parse(JSON.stringify(bbox(feature))));
    } else {
    }
  };

  const showDetailsClickHandler = (locationId: string) => {
    let feature = mapData?.parents[locationId];
    //create deep copy of bounds object for triggering bounds event every time
    if (feature) {
      let val: any = feature;
      let valProps: SearchLocationProperties = {
        bounds: bbox(val.geometry) as any,
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

  const proceedToSearch = (loadInactiveLocations: boolean) => {
    subithandler();
    setResultsLoadingState('started');
    if (loadInactiveLocations) {
      setParentsLoadingState('started');
    }
    setShowCountResponseModal(false);
  };

  const updateLoadedLevels = (levels: string[]) => {
    levelsLoaded.current = levels;
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

  return (
    <>
      <Container fluid ref={divRef}>
        <span style={{ position: 'absolute', top: '5px', left: '5px' }}>{divHeight}</span>
        <Row>
          {!mapFullScreen && (
            <Col xs={12} sm={12} md={4} style={{ position: 'relative' }}>
              <Form>
                <Form.Group className="my-3">
                  <Row className="align-items-center">
                    <Col md={5} lg={5}>
                      <Form.Label>{t('simulationPage.hierarchy')}:</Form.Label>
                    </Col>
                    <Col>
                      <Form.Select
                        onChange={e => {
                          const selectedHierarchy = hierarchyList?.content.find(el => el.identifier === e.target.value);
                          if (selectedHierarchy) {
                            setSelectedHierarchy(e.target.value);
                            setNodeList(selectedHierarchy.nodeOrder.filter(el => el !== 'structure'));
                            setCompleteGeographicList(selectedHierarchy.nodeOrder);
                          } else {
                            setSelectedHierarchy(undefined);
                            setNodeList([]);
                            setSelectedLocation(null);
                            setCompleteGeographicList([]);
                          }
                        }}
                      >
                        <option value={''}>Select Hierarchy...</option>
                        {hierarchyList?.content.map(el => (
                          <option key={el.identifier} value={el.identifier}>
                            {el.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="my-3">
                  <Row className="align-items-center">
                    <Col md={5} lg={5}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="meta-tooltip">Select Parent Geographic Level to Search within</Tooltip>}
                      >
                        <Form.Label>{t('simulationPage.geographicLevel')}:</Form.Label>
                      </OverlayTrigger>
                    </Col>
                    <Col>
                      <Form.Select
                        onChange={e => {
                          if (e.target.value && selectedHierarchy) {
                            getLocationList(selectedHierarchy, e.target.value).then(res => {
                              setLocationList(res);
                            });
                          } else {
                            setLocationList([]);
                          }
                          setSelectedLocation(null);
                        }}
                      >
                        <option value={''}>Select Geographic Level...</option>
                        {nodeList.map(el => (
                          <option key={el} value={el}>
                            {el}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="my-3">
                  <Row className="align-items-center">
                    <Col md={5} lg={5}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="meta-tooltip">Select Parent Location to Search within</Tooltip>}
                      >
                        <Form.Label>{t('simulationPage.location')}:</Form.Label>
                      </OverlayTrigger>
                    </Col>
                    <Col>
                      <Select
                        placeholder="Select Location..."
                        className="custom-react-select-container "
                        classNamePrefix="custom-react-select"
                        id="team-assign-select"
                        isClearable
                        value={selectedLocation}
                        options={locationList.reduce((prev, current) => {
                          return [...prev, { label: current.name, value: current.identifier }];
                        }, [])}
                        onChange={newValue => setSelectedLocation(newValue)}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="my-3">
                  <Row className="align-items-center">
                    <Col md={5} lg={5}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="meta-tooltip">Filter search result by Level</Tooltip>}
                      >
                        <Form.Label>{t('simulationPage.filterGeographicLevel')}:</Form.Label>
                      </OverlayTrigger>
                    </Col>
                    <Col>
                      <Select
                        isMulti
                        options={completeGeographicList
                          .map((geo: any) => {
                            return { value: geo, label: geo };
                          })
                          .filter((geo: any) => !levelsLoaded.current.includes(geo.label))}
                        value={geoFilterList}
                        noOptionsMessage={obj => {
                          if (obj.inputValue === '') {
                            return 'Enter at least 1 char to display the results...';
                          } else {
                            return 'No location found.';
                          }
                        }}
                        placeholder={completeGeographicList.length > 0 ? 'Search...' : 'Select hierarchy first'}
                        onInputChange={e => {
                          console.log(e);
                        }}
                        onChange={newValues => {
                          setGeoFilterList(newValues);
                          if (newValues) {
                            setSelectedFilterGeographicLevelList(newValues.map(value => value.label));
                          }
                        }}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="my-3">
                  <Row className="align-items-center">
                    <Col md={5} lg={5}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="meta-tooltip">Select to Load Inactive Locations</Tooltip>}
                      >
                        <Form.Label>Load Inactive locations:</Form.Label>
                      </OverlayTrigger>
                    </Col>
                    <Col>
                      <Form.Check
                        className="float-left"
                        type="switch"
                        id="custom-switch"
                        label="Select to Load Inactive Locations"
                        defaultChecked={false}
                        onChange={e => setLoadParentsToggle(e.target.checked)}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="my-3">
                  {loadParentsToggle && (
                    <Row className="align-items-center">
                      <Col md={5} lg={5}>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="meta-tooltip">Filter inactive locations by Level</Tooltip>}
                        >
                          <Form.Label>{t('simulationPage.filterGeographicLevel')}:</Form.Label>
                        </OverlayTrigger>
                      </Col>
                      <Col>
                        <Select
                          isMulti
                          options={completeGeographicList.map((geo: any) => {
                            return { value: geo, label: geo };
                          })}
                          value={inactiveGeoFilterList}
                          noOptionsMessage={obj => {
                            if (obj.inputValue === '') {
                              return 'Enter at least 1 char to display the results...';
                            } else {
                              return 'No location found.';
                            }
                          }}
                          placeholder={completeGeographicList.length > 0 ? 'Search...' : 'Select hierarchy first'}
                          onInputChange={e => {
                            console.log(e);
                          }}
                          onChange={newValues => {
                            setInactiveGeoFilterList(newValues);
                            if (newValues) {
                              setSelectedFilterInactiveGeographicLevelList(newValues.map(value => value.label));
                            }
                          }}
                        />
                      </Col>
                    </Row>
                  )}
                </Form.Group>
                <Form.Group className="my-3">
                  <Row>
                    <Col xs={9}>
                      <Form.Group>
                        <Form.Label className="pe-3">Add query attribute </Form.Label>
                      </Form.Group>
                    </Col>
                    <Col xs={3}>
                      <Row>
                        <Col md={3}>
                          <Button
                            disabled={selectedEntity === undefined}
                            className="rounded float-end"
                            onClick={() => openModalHandler(true)}
                          >
                            <FontAwesomeIcon icon="plus" />
                          </Button>
                        </Col>
                        <Col md={9}>
                          <Button
                            type="submit"
                            disabled={
                              selectedHierarchy === undefined ||
                              resultsLoadingState === 'started' ||
                              parentsLoadingState === 'started'
                            }
                            className="float-end"
                            onClick={handleSubmit(submitHandlerCount)}
                          >
                            {(resultsLoadingState === 'notstarted' || resultsLoadingState === 'complete') &&
                            (parentsLoadingState === 'notstarted' || parentsLoadingState === 'complete') ? (
                              <>
                                <FontAwesomeIcon icon="search" /> <span className={'p-2'}>Search</span>
                              </>
                            ) : (
                              <>
                                <Spinner animation="border" size="sm" role="status" />
                                <span className={'p-2'}>Loading</span>
                              </>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form.Group>
                <div
                  style={{ position: 'relative', maxHeight: divHeight > 900 ? '51vh' : '44vh' }}
                  className="border rounded overflow-auto"
                >
                  {selectedEntityConditionList.map((el, index) => {
                    return (
                      <Row className="mx-2 my-3" key={index}>
                        <Col md={9}>{conditionalRender(el, index)}</Col>
                        <Col md={3} className="text-end align-self-end">
                          {(el.valueType === 'integer' ||
                            el.valueType === 'double' ||
                            el.valueType === 'date' ||
                            el.valueType === 'string') && (
                            <span title="More">
                              <Button
                                className="m-1"
                                onClick={() => {
                                  if (el.more) {
                                    el.more.push(el);
                                  } else {
                                    el.more = [el];
                                  }
                                  setSelectedEntityConditionList([...selectedEntityConditionList]);
                                }}
                              >
                                <FontAwesomeIcon icon="plus" />
                              </Button>
                            </span>
                          )}
                          <span title="Delete">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                selectedEntityConditionList.splice(index, 1);
                                setSelectedEntityConditionList([...selectedEntityConditionList]);
                              }}
                            >
                              <FontAwesomeIcon icon="trash" />
                            </Button>
                          </span>
                        </Col>
                      </Row>
                    );
                  })}
                </div>
              </Form>
            </Col>
          )}
          <Col xs={12} sm={12} md={mapFullScreen ? 12 : 8} id="mapRow" className={mapFullScreen ? 'pt-4' : ''}>
            <SimulationMapView
              fullScreenHandler={() => {
                setMapFullScreen(!mapFullScreen);
              }}
              openModalHandler={showDetailsClickHandler}
              fullScreen={mapFullScreen}
              mapData={mapData}
              toLocation={toLocation}
              entityTags={entityTags}
              parentMapData={parentMapData}
              setMapDataLoad={setMapDataLoad}
              chunkedData={mapDataLoad}
              updateLevelsLoaded={updateLoadedLevels}
              resetMap={resetMap}
              setResetMap={setResetMap}
              resultsLoadingState={resultsLoadingState}
              parentsLoadingState={parentsLoadingState}
            />
          </Col>
        </Row>
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
            summary={summary}
            initiatingMapData={selectedMapData}
          />
        )}

        <Container fluid>
          <Row>
            <Col>{highestLocations && showResult && <h3 className="my-3 ">Result</h3>}</Col>
            <Col>
              <Button className="float-end my-3 ms-2" variant="secondary" onClick={() => setShowUploadModal(true)}>
                Upload Data
              </Button>
              {highestLocations && showResult && (
                <>
                  <Button
                    className="float-end ms-2 my-3"
                    variant="secondary"
                    onClick={() => {
                      setShowDownloadPanel(true);
                    }}
                  >
                    Download Data
                  </Button>
                  <Button className="float-end my-3 " variant="secondary" onClick={clearHandler}>
                    Clear All
                  </Button>
                </>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              {highestLocations && showResult && (
                <SimulationResultExpandingTable
                  clickHandler={loadLocationHandler}
                  data={highestLocations}
                  detailsClickHandler={showDetailsClickHandler}
                  summaryClickHandler={summaryDetailsClickHandler}
                />
              )}
            </Col>
          </Row>
        </Container>
      </>
      {showModal && selectedEntity && (
        <ActionDialog
          closeHandler={() => {
            setSelectedEntityCondition(undefined);
            setShowModal(false);
          }}
          title="Properties"
          element={<SimulationModal selectedEntityCondition={setSelectedEntityCondition} entityTags={entityTags} />}
          footer={
            <>
              <Button
                onClick={() => {
                  setSelectedEntityCondition(undefined);
                  setShowModal(false);
                }}
              >
                Close
              </Button>
              <Button disabled={selectedEntityCondition === undefined} onClick={() => openModalHandler(false)}>
                Add
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
            <Modal.Title className="w-100 text-center">Location details</Modal.Title>
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
          proceedToSearch={() => proceedToSearch(loadParentsToggle)}
        />
      )}

      {showDownloadPanel && (
        <DownloadSimulationResultsModal
          inputData={mapData}
          closeHandler={() => {
            setShowDownloadPanel(false);
          }}
          hierarchyIdentifier={selectedHierarchy}
        />
      )}
      {showUploadModal && <UploadSimulationData dataFunction={uploadDataHandler} closeHandler={setShowUploadModal} />}
    </>
  );
};
export default Simulation;
