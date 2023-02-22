import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Col, Form, Modal, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import {PageableModel} from '../../../api/providers';
import {ActionDialog} from '../../../components/Dialogs';
import {useWindowResize} from '../../../hooks/useWindowResize';
import {getLocationHierarchyList} from '../../location/api';
import {LocationHierarchyModel} from '../../location/providers/types';

import {filterData, getEntityList, getEntityTags, getLocationList} from '../api';
import {
  EntityTag,
  LookupEntityType,
  OperatorSignEnum,
  PlanningLocationResponse,
  SearchLocationProperties
} from '../providers/types';
import FormField from './FormField/FormField';
import MultiFormField from './FormField/MultiFormField';
import SimulationMapView from './SimulationMapView';
import SimulationModal from './SimulationModal';
import Select, {SingleValue} from 'react-select';
import PeopleDetailsModal from './PeopleDetailsModal';
import {bbox, Feature, MultiPolygon, Point, Polygon} from '@turf/turf';
import {LngLatBounds} from 'mapbox-gl';
import {SIMULATION_LOCATION_TABLE_COLUMNS} from "../../../constants";
import SimulationResultExpandingTable
  from "../../../components/Table/SimulationResultExpandingTable";
import TableSummaryModal from "./Summary/TableSummaryModal";

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

const Simulation = () => {
      const {t} = useTranslation();
      const [showModal, setShowModal] = useState(false);
      const [showDetails, setShowDetails] = useState(false);
      const [showResult, setShowResult] = useState(false);
      const [hierarchyList, setHierarchyList] = useState<PageableModel<LocationHierarchyModel>>();
      const [entityList, setEntityList] = useState<LookupEntityType[]>([]);
      const [selectedEntity, setSelectedEntity] = useState<string>();
      const [selectedEntityCondition, setSelectedEntityCondition] = useState<EntityTag>();
      const [selectedEntityConditionList, setSelectedEntityConditionList] = useState<EntityTag[]>([]);
      const divRef = useRef<HTMLDivElement>(null);
      const divHeight = useWindowResize(divRef.current);
      const [mapFullScreen, setMapFullScreen] = useState(false);
      const [mapData, setMapData] = useState<PlanningLocationResponse>();
      const [searchData, setSearchData] = useState<SearchLocationProperties[]>([]);
      const [nodeList, setNodeList] = useState<string[]>([]);
      const [locationList, setLocationList] = useState<any[]>([]);
      const [selectedHierarchy, setSelectedHierarchy] = useState<string>();
      const [selectedLocation, setSelectedLocation] = useState<SingleValue<{ label: string; value: string }>>();
      const [selectedRow, setSelectedRow] = useState<SearchLocationProperties>();
      const [toLocation, setToLocation] = useState<LngLatBounds>();
      const [entityTags, setEntityTags] = useState<EntityTag[]>([]);
      const [showSummaryModal, setShowSummaryModal] = useState(false);
      const [highestLocations, setHighestLocations] = useState<Feature<Point | Polygon | MultiPolygon>[]>();
      const [summary, setSummary] = useState<any>({});
      const [selectedMapData, setSelectedMapData] = useState<any>();

      useEffect(() => {
        Promise.all([getLocationHierarchyList(50, 0, true), getEntityList()])
        .then(([locationHierarchyList, entityList]) => {
          setHierarchyList(locationHierarchyList);
          setEntityList(entityList.filter(entity => entity.code === 'Location'));

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
        formState: {errors}
      } = useForm();

      const submitHandler = (form: any) => {
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
                {sign: requestBody.selectedValue, value: requestBody.inputValue},
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
          entityFilters: arr
        };
        filterData(requestData)
        .then(res => {
          res.features.forEach(el => {
            if (el.properties) {
              el.properties['childrenNumber'] = el.properties['persons'].length;
              el.properties['identifier'] = (el as any).identifier;
            }
          });
          setMapData(res);
          setHighestLocations([])
          setSearchData([
            ...res.features.flatMap(el => {
              const props = el.properties;
              if (props) {
                const bounds = bbox(el) as any;
                return {
                  identifier: (el as any).identifier,
                  name: props['name'],
                  persons: props['persons'] ?? [],
                  bounds: bounds,
                  metadata: props['metadata']
                };
              }
              return [];
            })
          ]);
          if (!res.features.length) {
            toast.info('No data found for given query.');
          } else {
            toast.success('Query executed successfully.');
          }
        })
        .catch(err => toast.error(err));
        setShowResult(true);
      };

      const clearHandler = () => {
        setSelectedEntityConditionList([]);
        setShowResult(false);
        setMapData(undefined);
        setToLocation(undefined);
        reset();
      };

      const showSummary = () => {
        setShowSummaryModal(true);
      };

      const getLocationHierarchyFromLowestLocation = useCallback((lowestLocation: any, mapDataClone: any) => {

        let parent: any = mapDataClone?.parents
        .find((feature: any) => {
          return feature.identifier === lowestLocation.properties?.parent
        });

        if (parent) {

          if (parent.children) {
            if (!parent.children.map((locationChild: any) => locationChild.identifier).includes(lowestLocation.identifier)) {
              parent.children.push(lowestLocation);
            }
          } else {
            parent.children = [];
            parent.children.push(lowestLocation);
            parent.properties.result = mapDataClone?.features.map((featureVal: any) => featureVal.identifier).includes(parent.identifier);
          }
          if (!parent.properties.hasOwnProperty("hasResultChild") || (parent.properties.hasOwnProperty("hasResultChild") && !parent.properties.hasResultChild)) {
            parent.properties.hasResultChild = !!(mapDataClone?.features
            .map((featureVal: any) => featureVal.identifier).includes(lowestLocation.identifier) || lowestLocation.properties?.hasResultChild || lowestLocation.properties?.result)
          }
          getLocationHierarchyFromLowestLocation(parent, mapDataClone)
        }

      }, []);

      useEffect(() => {
        if (mapData?.features && mapData?.features[0]) {
          let max = mapData?.features[0]?.properties?.geographicLevelNodeNumber;

          if (max) {
            for (let i = 1; i < mapData?.parents.length; i++) {
              if (mapData?.parents[i]?.properties?.geographicLevelNodeNumber > max) {
                max = mapData?.parents[i]?.properties?.geographicLevelNodeNumber;
              }
            }
            let lowestLocations: any[] = mapData?.parents
            .filter(feature => feature.properties?.geographicLevelNodeNumber === max)
            .map((feature: any) => {
              feature.properties.result = mapData?.features.map((featureVal: any) => featureVal.identifier).includes(feature.identifier);
              return feature;
            })

            let mapDataClone = structuredClone(mapData)
            lowestLocations.forEach(lowestLocation => {
              getLocationHierarchyFromLowestLocation(lowestLocation, mapDataClone)
            })


            let min = mapData?.features[0]?.properties?.geographicLevelNodeNumber;

            if (min) {
              for (let i = 1; i < mapData?.parents.length; i++) {
                if (mapData?.parents[i]?.properties?.geographicLevelNodeNumber < min) {
                  min = mapData?.parents[i]?.properties?.geographicLevelNodeNumber;
                }
              }
              let highestLocations: any[] = mapDataClone.parents
              .filter(feature => feature.properties?.geographicLevelNodeNumber === min)
              console.log(highestLocations)
              setHighestLocations(highestLocations)
            }
          }
        }
      }, [mapData, getLocationHierarchyFromLowestLocation])


      useEffect(() => {
        if (selectedEntity) {
          getEntityTags(selectedEntity).then(res => setEntityTags(res))
        }
      }, [selectedEntity]);

      const openMapLocation = (locationId: string) => {
        setSelectedRow(searchData.find(el => el.identifier === locationId));
        setShowDetails(true);
      };
      const handleDobuleClickRef = useRef(openMapLocation);
      handleDobuleClickRef.current = openMapLocation;

      const columns = React.useMemo(
          () => [
            {
              // Build our expander column
              id: 'expander', // Make sure it has an ID
              Cell: ({row}: { row: any }) =>
                  // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                  // to build the toggle for expanding a row
                  row.canExpand ? (
                      <span
                          {...row.getToggleRowExpandedProps({
                            style: {
                              // Use the row.depth property
                              // and paddingLeft to indicate the depth
                              // of the row
                              paddingLeft: `${row.depth}rem`,
                              paddingTop: '15px',
                              paddingBottom: '15px',
                              paddingRight: '15px'
                            }
                          })}
                      >
              {row.isExpanded ? (
                  <FontAwesomeIcon className="ms-1" icon="chevron-down"/>
              ) : (
                  <FontAwesomeIcon className="ms-1" icon="chevron-right"/>
              )}
            </span>
                  ) : null
            },
            ...SIMULATION_LOCATION_TABLE_COLUMNS
          ],
          []
      );

      const loadLocationHandler = (locationId: string) => {

        let feature = mapData?.parents.find((feature: any) => feature.identifier === locationId)

        if (feature) {
          setToLocation(JSON.parse(JSON.stringify(bbox(feature))));
        }
      };

      const showDetailsClickHandler = (locationId: string) => {

        let feature = mapData?.parents.find((feature: any) => feature.identifier === locationId)
        //create deep copy of bounds object for triggering bounds event every time
        if (feature) {
          let val: any = feature
          let valProps: SearchLocationProperties = {
            bounds: bbox(val.geometry) as any,
            identifier: val.identifier,
            metadata: val.properties?.metadata,
            name: val.properties?.name,
            persons: []
          }
          setSelectedRow(valProps);
          setShowDetails(true);
        }
      };

      const processChildren = useCallback((mapDataClone: any) => {

        let geoLevel: string = mapDataClone.properties.geographicLevel;

        if (!summary[geoLevel]) {
          summary[geoLevel] = {};
        }
        summary[geoLevel][mapDataClone.identifier] = mapDataClone.properties;
        setSummary(summary);

        if (mapDataClone.children) {
          mapDataClone.children.forEach((child: any) => processChildren(child))
        }

      },[summary])

      useEffect(() => {
        console.log(summary)
        if (Object.keys(summary).length === 0) {
          if (selectedMapData) {
            processChildren(selectedMapData)
            setShowSummaryModal(true);
          }

        }

      }, [selectedMapData, summary, processChildren]);


      const summaryDetailsClickHandler = (mapDataClone: any) => {
        setSummary({});
        setSelectedMapData(mapDataClone);
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
        return <FormField range={false} entityTag={el} register={register} index={index}
                          errors={errors}/>;
      };

      return (
          <>
            <Row>
              {!mapFullScreen && (
                  <Col md={4}>
                    <div ref={divRef}>
                      <Form>
                        <Form.Group className="mt-md-0 mt-3">
                          <Row className="align-items-center">
                            <Col md={3} lg={2}>
                              <Form.Label>{t('simulationPage.hierarchy')}:</Form.Label>
                            </Col>
                            <Col>
                              <Form.Select
                                  className="w-50"
                                  onChange={e => {
                                    const selectedHierarchy = hierarchyList?.content.find(el => el.identifier === e.target.value);
                                    if (selectedHierarchy) {
                                      setSelectedHierarchy(e.target.value);
                                      setNodeList(selectedHierarchy.nodeOrder.filter(el => el !== 'structure'));
                                    } else {
                                      setSelectedHierarchy(undefined);
                                      setNodeList([]);
                                      setSelectedLocation(null);
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
                            <Col md={3} lg={2}>
                              <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip id="meta-tooltip">Select Parent Geographic Level to
                                    Search within</Tooltip>}>
                                <Form.Label>{t('simulationPage.geographicLevel')}:</Form.Label>
                              </OverlayTrigger>
                            </Col>
                            <Col>
                              <Form.Select
                                  className="w-50"
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
                            <Col md={3} lg={2}>
                              <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip id="meta-tooltip">Select Parent Location to Search
                                    within</Tooltip>}>
                                <Form.Label>{t('simulationPage.location')}:</Form.Label>
                              </OverlayTrigger>
                            </Col>
                            <Col>
                              <Select
                                  placeholder="Select Location..."
                                  className="custom-react-select-container w-50"
                                  classNamePrefix="custom-react-select"
                                  id="team-assign-select"
                                  isClearable
                                  value={selectedLocation}
                                  options={locationList.reduce((prev, current) => {
                                    return [...prev, {label: current.name, value: current.identifier}];
                                  }, [])}
                                  onChange={newValue => setSelectedLocation(newValue)}
                              />
                            </Col>
                          </Row>
                        </Form.Group>
                        <Row className="mt-4">
                          <Col xs={10}>
                            <Form.Group className="mb-3">
                              <Form.Label className="pe-3">{t('simulationPage.entity')}:</Form.Label>
                              {entityList.map(el => (
                                  <Form.Check
                                      key={el.identifier}
                                      inline
                                      onChange={e => setSelectedEntity(e.target.value)}
                                      type="radio"
                                      value={el.identifier}
                                      name="entityPicker"
                                      id={'radio-' + el.identifier}
                                      label={el.code}
                                  />
                              ))}
                            </Form.Group>
                          </Col>
                          <Col xs={2}>
                            <div
                                className="text-end"
                                title={selectedEntity !== undefined ? undefined : 'Please select entity type first.'}
                            >
                              <Button
                                  disabled={selectedEntity === undefined}
                                  className="rounded"
                                  onClick={() => openModalHandler(true)}
                              >
                                <FontAwesomeIcon icon="plus"/>
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                      <p>
                        Entity properties
                        <Button className="float-end" variant="secondary" onClick={clearHandler}>
                          Clear All
                        </Button>
                      </p>
                    </div>
                    <Form onSubmit={handleSubmit(submitHandler)}>
                      <div
                          style={{
                            height: divHeight ? 590 - divHeight : 460,
                            position: 'relative',
                            overflowX: 'hidden'
                          }}
                          className="border rounded mb-md-0 mb-3 mt-4"
                      >
                        <SimpleBar style={{maxHeight: divHeight ? 620 - divHeight : 457}}>
                          {selectedEntityConditionList.map((el, index) => {
                            return (
                                <Row className="mx-2 my-3" key={index}>
                                  <Col md={9}>{conditionalRender(el, index)}</Col>
                                  <Col md={3} className="text-end align-self-end">
                                    {(el.valueType === 'integer' || el.valueType === 'double' || el.valueType === 'date' || el.valueType === 'string') && (
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
                                <FontAwesomeIcon icon="plus"/>
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
                              <FontAwesomeIcon icon="trash"/>
                            </Button>
                          </span>
                                  </Col>
                                </Row>
                            );
                          })}
                        </SimpleBar>
                        <span title="Display results"
                              style={{position: 'absolute', bottom: 0, right: 0}}>
                  <Button
                      type="submit"
                      disabled={selectedEntityConditionList.length === 0 || selectedHierarchy === undefined}
                      className="me-2 mb-2"
                  >
                    <FontAwesomeIcon icon="search"/>
                  </Button>
                </span>
                      </div>
                    </Form>
                  </Col>
              )}
              <Col md={mapFullScreen ? 12 : 8} id="mapRow" className={mapFullScreen ? 'pt-4' : ''}>
                <SimulationMapView
                    fullScreenHandler={() => {
                      setMapFullScreen(!mapFullScreen);
                    }}
                    openModalHandler={(id: string) => handleDobuleClickRef.current(id)}
                    fullScreen={mapFullScreen}
                    mapData={mapData}
                    toLocation={toLocation}
                    entityTags={entityTags}
                />
              </Col>
            </Row>
            {showResult && (
                <>
                  <hr className="my-4"/>
                  {showSummaryModal && (
                      <TableSummaryModal
                          show={true}
                          closeHandler={() => {
                            setShowSummaryModal(false)
                          }}
                          isDarkMode={false}
                          summary={summary}
                          initiatingMapData={selectedMapData}
                      />

                  )}
                  <Button className="float-end" variant="secondary" onClick={showSummary}>
                    Summary
                  </Button>

                  <h3>Result</h3>

                  {
                      highestLocations && (
                          <SimulationResultExpandingTable
                              columns={columns}
                              clickHandler={loadLocationHandler}
                              data={highestLocations}
                              sortHandler={() => alert("sort!")}
                              detailsClickHandler={showDetailsClickHandler}
                              summaryClickHandler={summaryDetailsClickHandler}
                          />)
                  }
                  {searchData.length === 0 && <p className="text-center lead">No data found.</p>}
                </>
            )}
            {showModal && selectedEntity && (
                <ActionDialog
                    closeHandler={() => {
                      setSelectedEntityCondition(undefined);
                      setShowModal(false);
                    }}
                    title="Properties"
                    element={
                      <SimulationModal selectedEntityCondition={setSelectedEntityCondition}
                                       entityTags={entityTags}/>
                    }
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
                        <Button disabled={selectedEntityCondition === undefined}
                                onClick={() => openModalHandler(false)}>
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
                    <PeopleDetailsModal locationProps={selectedRow}/>
                  </Modal.Body>
                </Modal>
            )}
          </>
      );
    }
;


export default Simulation;
