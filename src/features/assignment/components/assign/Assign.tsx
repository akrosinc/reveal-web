import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Container, Collapse, Button, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MapView from '../../../../components/MapBox/MapView';
import { ASSIGNMENT_PAGE, LOCATION_TABLE_COLUMNS } from '../../../../constants';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import classes from '../../../location/components/locations/Location.module.css';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import LocationAssignmentsTable from '../../../../components/Table/LocationAssignmentsTable';
import { ErrorModel, PageableModel } from '../../../../api/providers';
import { LocationModel } from '../../../location/providers/types';
import { assignLocationsToPlan, getAssignedLocationHierarcyCount, getLocationHierarchyByPlanId } from '../../api';
import { toast } from 'react-toastify';
import { getLocationById } from '../../../location/api';
import { MultiValue, Options } from 'react-select';
import { getOrganizationList } from '../../../organization/api';

interface Option {
  label: string;
  value: string;
}

const Assign = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanModel>();
  const [open, setOpen] = useState(false);
  const [geoLocation, setGeoLocation] = useState<LocationModel>();
  const [locationHierarchy, setLocationHierarchy] = useState<PageableModel<LocationModel>>();
  const [assignedLocations, setAssignedLocations] = useState(0);
  const [activeTab, setActiveTab] = useState('location-assignment');
  const dispatch = useAppDispatch();
  let selectedLocationsIdentifiers: string[] = [];
  const { planId } = useParams();
  const [organizationsList, setOrganizationsList] = useState<Options<Option>>([]);
  const navigate = useNavigate();
  const [notInMove, setNotInMove] = useState(true);

  const loadData = useCallback(() => {
    dispatch(showLoader(true));
    if (planId !== undefined) {
      getPlanById(planId)
        .then(res => {
          setCurrentPlan(res);
          getLocationHierarchyByPlanId(planId).then(res => {
            setLocationHierarchy(res);
          });
          getAssignedLocationHierarcyCount(planId).then(res => {
            setAssignedLocations(res.count);
            setActiveTab(res.count ? 'team-assignment' : 'location-assignment');
          });
          getOrganizationList(50, 0).then(res => {
            let a = res.content.map(el => {
              return {
                value: el.identifier,
                label: el.name
              };
            });
            setOrganizationsList(a);
          });
        })
        .catch(err => {
          toast.error('Plan does not exist, redirected to assign page.');
          navigate('/assign');
        })
        .finally(() => dispatch(showLoader(false)));
    }
  }, [planId, dispatch, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Cell: ({ row }: { row: any }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // We can even use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  paddingLeft: `${row.depth * 0.8}rem`,
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  paddingRight: '15px'
                }
              })}
            >
              {row.isExpanded ? (
                <FontAwesomeIcon className="ms-1" icon="chevron-down" />
              ) : (
                <FontAwesomeIcon className="ms-1" icon="chevron-right" />
              )}
            </span>
          ) : null
      },
      ...LOCATION_TABLE_COLUMNS,
      {
        Header: 'Select',
        id: 'checkbox'
      }
    ],
    []
  );

  const checkHandler = (id: string, checked: boolean) => {
    let selectedHierarchy = { ...locationHierarchy } as PageableModel<LocationModel>;
    selectedHierarchy.content?.forEach(location => {
      if (location.identifier === id) {
        location.active = checked;
        checkChildren(location, checked);
      } else if (location.children.length) {
        findLocationToCheck(id, location.children, checked);
      }
    });
    setLocationHierarchy(selectedHierarchy);
  };

  const selectHandler = (id: string, selected: MultiValue<Option>) => {
    let selectedHierarchy = { ...locationHierarchy } as PageableModel<LocationModel>;
    selectedHierarchy.content?.forEach(location => {
      if (location.identifier === id) {
        location.teams = selected.map(team => {
          return {
            identifier: team.value,
            name: team.label
          };
        });
        selectChildren(location, selected);
      } else if (location.children.length) {
        findChildrenToSelect(id, location.children, selected);
      }
    });
    setLocationHierarchy(selectedHierarchy);
  };

  const findLocationToCheck = (id: string, children: LocationModel[], checked: boolean) => {
    children.forEach(childEl => {
      if (childEl.identifier === id) {
        childEl.active = checked;
        checkChildren(childEl, checked);
      } else if (childEl.children.length) {
        findLocationToCheck(id, childEl.children, checked);
      }
    });
  };

  const findChildrenToSelect = (id: string, children: LocationModel[], selected: MultiValue<Option>) => {
    children.forEach(childEl => {
      if (childEl.identifier === id) {
        childEl.teams = selected.map(team => {
          return {
            identifier: team.value,
            name: team.label
          };
        });
        selectChildren(childEl, selected);
      } else if (childEl.children.length) {
        findChildrenToSelect(id, childEl.children, selected);
      }
    });
  };

  const checkChildren = (parentLocation: LocationModel, checked: boolean) => {
    parentLocation.children.forEach(el => {
      el.active = checked;
      if (el.children.length) {
        checkChildren(el, checked);
      }
    });
  };

  const selectChildren = (parentLocation: LocationModel, selected: MultiValue<Option>) => {
    parentLocation.children.forEach(el => {
      if (el.active) {
        el.teams = selected.map(team => {
          return {
            identifier: team.value,
            name: team.label
          };
        });
      }
      if (el.children.length) {
        selectChildren(el, selected);
      }
    });
  };

  //creates an array of selected location identifiers
  const filterChildren = (location: LocationModel) => {
    if (location.active) {
      selectedLocationsIdentifiers.push(location.identifier);
    }
    if (location.children.length) {
      location.children.forEach(childLocation => {
        filterChildren(childLocation);
      });
    }
  };

  const saveHandler = () => {
    if (planId) {
      dispatch(showLoader(true));
      locationHierarchy?.content.forEach(location => {
        filterChildren(location);
      });
      toast
        .promise(assignLocationsToPlan(planId, selectedLocationsIdentifiers), {
          pending: 'Loading...',
          success: 'Locations assigned to plan successfully',
          error: {
            render({ data }: { data: ErrorModel }) {
              dispatch(showLoader(false));
              return data.message !== undefined ? data.message : 'An error has occured!';
            }
          }
        })
        .finally(() => {
          //empty array after sending
          selectedLocationsIdentifiers.length = 0;
          dispatch(showLoader(false));
          loadData();
        });
    }
  };

  return (
    <Container fluid className="my-4">
      <Row className="mt-3 align-items-center">
        <Col md={3}>
          <Link to={ASSIGNMENT_PAGE} className="btn btn-primary">
            <FontAwesomeIcon size="lg" icon="arrow-left" className="me-2" /> Assign Plans
          </Link>
        </Col>
        <Col md={6} className="text-center">
          <h4 className="m-0">Plan Assignments - {currentPlan?.name}</h4>
        </Col>
      </Row>
      <hr className="my-3" />
      <MapView
        data={geoLocation}
        assignment
        startingZoom={12}
        clearHandler={() => setGeoLocation(undefined)}
        moveend={() => setNotInMove(true)}
        reloadData={() => loadData()}
      >
        <div className={classes.floatingLocationPickerAssign + ' bg-white p-2 rounded'}>
          <Button
            onClick={() => setOpen(!open)}
            aria-controls="expand-table"
            aria-expanded={open}
            style={{ width: '100%', border: 'none' }}
            variant="light"
            className="text-start bg-white"
          >
            {assignedLocations ? `Assign Teams | Assigned Locations: ${assignedLocations}` : 'Select Locations'}
            {open ? (
              <FontAwesomeIcon className="ms-2 mt-1 float-end" icon="chevron-up" />
            ) : (
              <FontAwesomeIcon className="ms-2 mt-1 float-end" icon="chevron-down" />
            )}
          </Button>
          <Collapse in={open}>
            <div id="expand-table" className="mt-2">
              <hr />
              <Tabs
                activeKey={activeTab}
                onSelect={tab => {
                  if (tab && assignedLocations) {
                    setActiveTab(tab);
                  } else {
                    if (tab === 'team-assignment') {
                      toast.warning('Please select and save at least one location to be able to assign teams.');
                    }
                    setActiveTab('location-assignment');
                  }
                }}
                id="management-tab"
                className="mb-3"
                mountOnEnter={true}
                unmountOnExit={true}
              >
                <Tab eventKey="location-assignment" title="Assign locations">
                  <div style={{ height: '40vh', width: '100%', overflowY: 'auto' }}>
                    <LocationAssignmentsTable
                      organizationList={organizationsList}
                      checkHandler={checkHandler}
                      selectHandler={selectHandler}
                      teamTab={false}
                      columns={columns}
                      clickHandler={(id: string, rowData: any) => {
                        if (rowData.active) {
                          getLocationById(id).then(res => {
                            setGeoLocation(res);
                          });
                        }
                      }}
                      sortHandler={() => console.log('sort')}
                      data={locationHierarchy?.content ?? []}
                    />
                  </div>
                </Tab>
                <Tab eventKey="team-assignment" title="Assign teams">
                  <div style={{ height: '40vh', width: '100%', overflowY: 'auto' }}>
                    <LocationAssignmentsTable
                      teamTab={true}
                      organizationList={organizationsList}
                      checkHandler={checkHandler}
                      selectHandler={selectHandler}
                      columns={
                        assignedLocations
                          ? [
                              ...columns,
                              {
                                Header: 'Assign teams',
                                id: 'teams'
                              }
                            ]
                          : columns
                      }
                      clickHandler={(id: string, rowData: any) => {
                        if (rowData.active && notInMove) {
                          dispatch(showLoader(true));
                          getLocationById(id).then(res => {
                            setNotInMove(false);
                            setGeoLocation(res);
                          }).finally(() => dispatch(showLoader(false)));
                        }
                      }}
                      sortHandler={() => console.log('sort')}
                      data={locationHierarchy?.content ?? []}
                    />
                  </div>
                </Tab>
              </Tabs>
              <hr className="my-2" />
              <Button className="float-end mb-1 w-25" onClick={saveHandler}>
                Save
              </Button>
            </div>
          </Collapse>
        </div>
      </MapView>
    </Container>
  );
};

export default Assign;
