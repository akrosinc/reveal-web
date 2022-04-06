import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Container, Button, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ASSIGNMENT_PAGE,
  LOCATION_ASSIGNMENT_TAB,
  LOCATION_ASSIGN_TABLE_COLUMNS,
  LOCATION_TEAM_ASSIGNMENT_TAB
} from '../../../../constants';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import LocationAssignmentsTable from '../../../../components/Table/LocationAssignmentsTable';
import { ErrorModel, PageableModel } from '../../../../api/providers';
import { LocationModel } from '../../../location/providers/types';
import {
  assignLocationsToPlan,
  assignTeamsToLocationHierarchy,
  getAssignedLocationHierarcyCount,
  getLocationHierarchyByPlanId
} from '../../api';
import { toast } from 'react-toastify';
import { getLocationByIdAndPlanId } from '../../../location/api';
import { MultiValue, Options } from 'react-select';
import { getOrganizationListSummary } from '../../../organization/api';
import { Column } from 'react-table';
import MapViewAssignments from '../../../../components/MapBox/MapViewAssignments';

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
  const [activeTab, setActiveTab] = useState(LOCATION_ASSIGNMENT_TAB);
  const dispatch = useAppDispatch();
  const selectedLocationsIdentifiers: string[] = [];
  const selectedLocationsTeams: LocationModel[] = [];
  const { planId } = useParams();
  const [organizationsList, setOrganizationsList] = useState<Options<Option>>([]);
  const navigate = useNavigate();
  const [notInMove, setNotInMove] = useState(true);
  const [tableHeight, setTableHeight] = useState(0);

  const loadData = useCallback(() => {
    dispatch(showLoader(true));
    if (planId !== undefined) {
      getPlanById(planId)
        .then(res => {
          setCurrentPlan(res);
          Promise.all([
            getLocationHierarchyByPlanId(planId),
            getAssignedLocationHierarcyCount(planId),
            getOrganizationListSummary()
          ])
            .then(async ([hierarchy, assignedLocationCount, organizations]) => {
              setLocationHierarchy(hierarchy);
              setAssignedLocations(assignedLocationCount.count);
              setActiveTab(assignedLocationCount.count ? LOCATION_TEAM_ASSIGNMENT_TAB : LOCATION_ASSIGNMENT_TAB);
              let orgList = organizations.content.map(el => {
                return {
                  value: el.identifier,
                  label: el.name
                };
              });
              setOrganizationsList(orgList);
              if (hierarchy.content.length) {
                //load parent location on component load
                getLocationByIdAndPlanId(hierarchy.content[0].identifier, planId).then(res => {
                  setNotInMove(false);
                  setGeoLocation(res);
                  setTableHeight((document.getElementsByClassName('mapboxgl-canvas')[0] as any).height);
                });
              }
            })
            .catch(err => toast.error('Something went wrong...' + err.toString()))
            .finally(() => {
              dispatch(showLoader(false));
            });
        })
        .catch(err => {
          toast.error('Plan does not exist, redirected to assign page.');
          dispatch(showLoader(false));
          navigate('/assign');
        });
    }
  }, [planId, dispatch, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tableData = React.useMemo<LocationModel[]>(() => {
    return locationHierarchy ? locationHierarchy.content : [];
  }, [locationHierarchy]);

  const columns = React.useMemo<Column[]>(
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
      ...LOCATION_ASSIGN_TABLE_COLUMNS
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

  const selectHandler = (id: string, selected: MultiValue<Option>, unselectAll?: boolean) => {
    let selectedHierarchy = { ...locationHierarchy } as PageableModel<LocationModel>;
    selectedHierarchy.content?.forEach(location => {
      if (location.identifier === id) {
        location.teams = selected.map(team => {
          return {
            identifier: team.value,
            name: team.label
          };
        });
        selectChildren(location, selected, unselectAll);
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

  const selectChildren = (parentLocation: LocationModel, selected: MultiValue<Option>, unselectAll?: boolean) => {
    parentLocation.children.forEach(el => {
      if (el.active) {
        if (unselectAll) {
          el.teams = [];
        } else {
          selected.forEach(team => {
            el.teams.forEach((element, index) => {
              if (team.value === element.identifier) {
                el.teams.splice(index, 1);
              }
            });
          });
          el.teams = [
            ...el.teams,
            ...selected.map(t => {
              return {
                identifier: t.value,
                name: t.label
              };
            })
          ];
        }
      }
      if (el.children.length) {
        selectChildren(el, selected, unselectAll);
      }
    });
  };

  //creates an array of selected location identifiers
  const filterChildren = (location: LocationModel) => {
    if (location.active) {
      selectedLocationsIdentifiers.push(location.identifier);
      selectedLocationsTeams.push(location);
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
      if (activeTab === LOCATION_ASSIGNMENT_TAB) {
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
            selectedLocationsTeams.length = 0;
            dispatch(showLoader(false));
          });
      } else {
        // assign teams to selected locations
        dispatch(showLoader(true));
        const locationTeamAssignment = selectedLocationsTeams.map(el => {
          return {
            locationId: el.identifier,
            teams: el.teams.map(el => el.identifier)
          };
        });
        toast
          .promise(assignTeamsToLocationHierarchy(planId, { hierarchy: locationTeamAssignment }), {
            pending: 'Loading...',
            success: 'Selected teams assigned successfully',
            error: 'There was an error assigning teams.'
          })
          .finally(() => {
            //empty array after sending
            selectedLocationsIdentifiers.length = 0;
            selectedLocationsTeams.length = 0;
            dispatch(showLoader(false));
          });
      }
    }
  };

  const notMoving = useCallback(() => {
    setNotInMove(true);
  }, []);

  return (
    <Container fluid className="my-4">
      <Row className="mt-3 align-items-center">
        <Col md={3}>
          <Link id="assign-back-button" to={ASSIGNMENT_PAGE} className="btn btn-primary mb-2">
            <FontAwesomeIcon size="lg" icon="arrow-left" className="me-2" /> Assign Plans
          </Link>
        </Col>
        <Col md={6} className="text-center">
          <h4 className="m-0">
            {activeTab === LOCATION_ASSIGNMENT_TAB ? 'Assign Locations' : 'Assign Teams'}
            <br />
            {currentPlan?.title}
          </h4>
        </Col>
      </Row>
      <hr className="my-3" />
      <Row>
        <Col
          md={4}
          style={{ display: open ? 'none' : '', maxHeight: tableHeight > 0 ? tableHeight : 'auto', overflow: 'auto' }}
        >
          {assignedLocations ? `Assign Teams | Assigned Locations: ${assignedLocations}` : 'Select Locations'}
          <div id="expand-table" className="mt-2">
            <hr />
            <Tabs
              id="assignments"
              activeKey={activeTab}
              onSelect={tab => {
                if (tab && assignedLocations) {
                  setActiveTab(tab);
                } else {
                  if (tab === LOCATION_TEAM_ASSIGNMENT_TAB) {
                    toast.warning('Please select and save at least one location to be able to assign teams.');
                  }
                  setActiveTab(LOCATION_ASSIGNMENT_TAB);
                }
              }}
              className="mb-3"
            >
              <Tab eventKey={LOCATION_ASSIGNMENT_TAB} title="Assign locations">
                <div>
                  <LocationAssignmentsTable
                    organizationList={organizationsList}
                    checkHandler={checkHandler}
                    selectHandler={selectHandler}
                    teamTab={false}
                    columns={columns}
                    data={tableData}
                  />
                </div>
              </Tab>
              <Tab eventKey={LOCATION_TEAM_ASSIGNMENT_TAB} title="Assign teams">
              <div className="w-100 text-end">
                    <Button
                      className='btn-secondary'
                      onClick={() => {
                        selectHandler(locationHierarchy!.content[0].identifier, [], true);
                      }}
                    >
                      Deselect All
                    </Button>
                  </div>
                <LocationAssignmentsTable
                  teamTab={true}
                  organizationList={organizationsList}
                  checkHandler={checkHandler}
                  selectHandler={selectHandler}
                  columns={columns}
                  clickHandler={(id: string, rowData: any) => {
                    if (rowData.active && notInMove && id !== (geoLocation?.identifier ?? '') && planId) {
                      dispatch(showLoader(true));
                      getLocationByIdAndPlanId(id, planId)
                        .then(res => {
                          setNotInMove(false);
                          setGeoLocation(res);
                        })
                        .finally(() => dispatch(showLoader(false)));
                    }
                  }}
                  data={tableData}
                />
              </Tab>
            </Tabs>
            <hr className="my-2" />
            <div className="text-end">
              <Button id="save-assignments-button" className="my-2 w-25" onClick={saveHandler}>
                Save
              </Button>
            </div>
          </div>
        </Col>
        <Col md={open ? 12 : 8}>
          <MapViewAssignments
            collapse={() => setOpen(!open)}
            rerender={open}
            data={geoLocation}
            startingZoom={10}
            clearHandler={() => {
              if (locationHierarchy && locationHierarchy.content.length && planId) {
                dispatch(showLoader(true));
                getLocationByIdAndPlanId(locationHierarchy.content[0].identifier, planId).then(res => {
                  setNotInMove(false);
                  //timeout is need to let mapbox finish loading styles otherwise it breaks
                  //there should be a way to avoid this
                  setTimeout(() => {
                    setGeoLocation(res);
                    dispatch(showLoader(false));
                  }, 1500);
                });
              }
            }}
            moveend={notMoving}
            reloadData={() => loadData()}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Assign;
