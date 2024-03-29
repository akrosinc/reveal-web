import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Container, Button, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ASSIGNMENT_PAGE,
  LOCATION_ASSIGNMENT_TAB,
  LOCATION_ASSIGN_TABLE_COLUMNS,
  LOCATION_TEAM_ASSIGNMENT_SUMMARY,
  LOCATION_TEAM_ASSIGNMENT_TAB
} from '../../../../constants';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import LocationAssignmentsTable from '../../../../components/Table/LocationAssignmentsTable';
import { ErrorModel, PageableModel } from '../../../../api/providers';
import { LocationModel } from '../../../location/providers/types';
import {
  assignLocationsToPlan,
  getAssignedLocationHierarcyCount,
  getLocationHierarchyByPlanId,
  saveLocationsAssignedToTeam
} from '../../api';
import { toast } from 'react-toastify';
import { getLocationByIdAndPlanId } from '../../../location/api';
import { Options } from 'react-select';
import { getOrganizationListSummary } from '../../../organization/api';
import { Column } from 'react-table';
import MapViewAssignments from './map';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import TeamAssignment from './TeamAssignment';
import { LocationAssignmentRequest } from '../../providers/types';

interface Option {
  label: string;
  value: string;
}

const Assign = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanModel>();
  const [open, setOpen] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [geoLocation, setGeoLocation] = useState<LocationModel>();
  const [locationHierarchy, setLocationHierarchy] = useState<PageableModel<LocationModel>>();
  const [assignedLocations, setAssignedLocations] = useState(0);
  const [activeTab, setActiveTab] = useState(LOCATION_ASSIGNMENT_TAB);
  const selectedLocationsIdentifiers: string[] = [];
  const selectedLocationsTeams: LocationModel[] = [];
  const { planId } = useParams();
  const [organizationsList, setOrganizationsList] = useState<Options<Option>>([]);
  const navigate = useNavigate();
  const [notInMove, setNotInMove] = useState(true);
  const [tableHeight, setTableHeight] = useState(0);
  const [isEdited, setIsEdited] = useState(false);
  const { t } = useTranslation();
  const [selectedTeams, setSelectedTeams] = useState<LocationAssignmentRequest>();

  const loadData = useCallback(() => {
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
              setActiveTab(assignedLocationCount.count ? LOCATION_TEAM_ASSIGNMENT_SUMMARY : LOCATION_ASSIGNMENT_TAB);
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
                  setTableHeight(
                    (document.getElementsByClassName('mapboxgl-canvas')[0] as any)?.height -
                      (document.getElementById('title-div')?.clientHeight ?? 0)
                  );
                });
              }
            })
            .catch(err => toast.error(err));
        })
        .catch(_ => {
          toast.error('Plan does not exist, redirected to previous page.');
          navigate(ASSIGNMENT_PAGE);
        });
    } else {
      toast.error('Plan does not exist, redirected to previous page.');
      navigate(ASSIGNMENT_PAGE);
    }
  }, [planId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tableData = React.useMemo<LocationModel[]>(() => {
    return locationHierarchy ? locationHierarchy.content : [];
  }, [locationHierarchy]);

  const showAssignedOnly = (locations: LocationModel[]) => {
    //creates a clone of location object to remove any references
    const loc = JSON.parse(JSON.stringify(locations)) as LocationModel[];
    loc.forEach((el, index) => {
      if (!el.active) {
        loc.splice(index, 1);
      } else {
        if (el.children.length) {
          removeNotAssigned(el.children);
        }
      }
    });
    return loc;
  };

  const removeNotAssigned = (locations: LocationModel[]) => {
    let indexes: number[] = [];
    locations.forEach((el, index) => {
      if (!el.active) {
        indexes.push(index);
      } else {
        if (el.children.length) {
          removeNotAssigned(el.children);
        }
      }
    });
    indexes.reverse().forEach(i => locations.splice(i, 1));
  };

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
                  padding: '0.4em'
                }
              })}
            >
              {row.isExpanded ? (
                <FontAwesomeIcon className="ms-1" icon="chevron-down" />
              ) : (
                <FontAwesomeIcon className={row.depth > 0 ? 'ms-2' : 'ms-1'} icon="chevron-right" />
              )}
            </span>
          ) : null
      },
      ...LOCATION_ASSIGN_TABLE_COLUMNS
    ],
    []
  );

  //CHECK HANDLERS - responsible for checkbox event
  const checkHandler = (id: string, checked: boolean) => {
    setIsEdited(true);
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

  const findLocationToCheck = (id: string, children: LocationModel[], checked: boolean) => {
    children.forEach(childEl => {
      if (childEl.identifier === id) {
        childEl.active = checked;
        checkChildren(childEl, checked);
        selectParent(childEl, checked);
      } else if (childEl.children.length) {
        findLocationToCheck(id, childEl.children, checked);
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

  const selectParent = (location: LocationModel, selected: boolean) => {
    locationHierarchy?.content.forEach(el => {
      if (el.identifier === location.properties.parentIdentifier) {
        if (selected) {
          el.active = selected;
        } else {
          if (!el.children.some(el => el.active)) {
            el.active = selected;
          }
        }
      } else {
        if (el.children.length) {
          findParent(el.children, location.properties.parentIdentifier, selected);
        }
      }
    });
  };

  const findParent = (locations: LocationModel[], identifier: string, selected: boolean) => {
    locations.forEach(el => {
      if (el.identifier === identifier) {
        if (selected) {
          el.active = selected;
          selectParent(el, selected);
        } else {
          if (!el.children.some(el => el.active)) {
            el.active = selected;
            selectParent(el, selected);
          }
        }
      } else if (el.children.length) {
        findParent(el.children, identifier, selected);
      }
    });
  };
  //END OF CHECK HANDLERS

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
      locationHierarchy?.content.forEach(location => {
        filterChildren(location);
      });
      if (activeTab === LOCATION_ASSIGNMENT_TAB) {
        toast
          .promise(assignLocationsToPlan(planId, selectedLocationsIdentifiers), {
            pending: t('toast.loading'),
            success: t('assignPage.assignLocationMessage'),
            error: {
              render({ data }: { data: ErrorModel }) {
                return data.message !== undefined ? data.message : t('assignPage.assignLocationErrorMessage');
              }
            }
          })
          .finally(() => {
            //empty array after sending
            selectedLocationsIdentifiers.length = 0;
            selectedLocationsTeams.length = 0;
            setIsEdited(false);
            getAssignedLocationHierarcyCount(planId).then(res => {
              setAssignedLocations(res.count);
              setActiveTab(res.count ? LOCATION_TEAM_ASSIGNMENT_TAB : LOCATION_ASSIGNMENT_TAB);
            });

            //clear map after changes on grid
            document.getElementById('clear-map-button')?.click();
          });
      } else {
        if (selectedTeams) {
          saveLocationsAssignedToTeam(selectedTeams, planId)
            .then(_ => toast.success('Teams successfully assigned.'))
            .finally(() => {
              setSelectedTeams(undefined);
              loadData();
              document.getElementById('clear-map-button')?.click();
            });
        } else {
          toast.error('Select team to save changes.');
        }
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
            <FontAwesomeIcon size="lg" icon="arrow-left" className="me-2" /> {t('assignPage.subTitle')}
          </Link>
        </Col>
        <Col md={6} className="text-center">
          <h4 className="mx-0 my-3 my-md-0">
            {activeTab === LOCATION_ASSIGNMENT_TAB ? t('assignPage.titleLocations') : t('assignPage.titleTeams')} (
            {currentPlan?.title})
          </h4>
        </Col>
        <Col md={3} className="text-end">
          <Button onClick={() => setShowTable(!showTable)}>{showTable ? 'Show Map' : 'Hide Map'}</Button>
        </Col>
      </Row>
      <hr className="my-3" />
      <Row>
        <Col md={showTable ? 12 : 4} style={{ display: open ? 'none' : '' }}>
          <div className="d-flex justify-content-between align-items-center" id="title-div">
            <span>
              {assignedLocations
                ? `${t('assignPage.titleLocations') + ' | ' + t('assignPage.titleTeams')}: ${assignedLocations}`
                : t('assignPage.selectLocations')}
            </span>
            <Button
              id="save-assignments-button"
              className="w-25"
              disabled={!selectedTeams && activeTab !== LOCATION_ASSIGNMENT_TAB}
              onClick={saveHandler}
            >
              {t('buttons.save')}
            </Button>
          </div>
          <SimpleBar style={{ maxHeight: tableHeight > 0 ? tableHeight : 'auto' }}>
            <hr />
            <Tabs
              mountOnEnter
              unmountOnExit
              id="assignments"
              activeKey={activeTab}
              onSelect={tab => {
                if (tab && assignedLocations && !isEdited) {
                  setActiveTab(tab);
                } else {
                  if (tab === LOCATION_TEAM_ASSIGNMENT_TAB || tab === LOCATION_TEAM_ASSIGNMENT_SUMMARY) {
                    toast.warning(t('assignPage.assignmentsWarningMessage'));
                  }
                  setActiveTab(LOCATION_ASSIGNMENT_TAB);
                }
              }}
              className="mt-2"
            >
              <Tab eventKey={LOCATION_ASSIGNMENT_TAB} title={t('assignPage.titleLocations')}>
                <div>
                  <LocationAssignmentsTable
                    organizationList={organizationsList}
                    checkHandler={checkHandler}
                    teamTab={false}
                    columns={columns}
                    data={tableData}
                  />
                </div>
              </Tab>
              <Tab eventKey={LOCATION_TEAM_ASSIGNMENT_TAB} title={t('assignPage.titleTeams')}>
                <TeamAssignment
                  columns={columns}
                  data={showAssignedOnly(tableData)}
                  planId={planId ?? ''}
                  organizationsList={organizationsList}
                  selectTeams={setSelectedTeams}
                />
              </Tab>
              <Tab eventKey={LOCATION_TEAM_ASSIGNMENT_SUMMARY} title={t('assignPage.assignmentPreview')}>
                <LocationAssignmentsTable
                  teamTab={true}
                  organizationList={organizationsList}
                  checkHandler={checkHandler}
                  columns={columns}
                  clickHandler={(id: string, rowData: any) => {
                    if (rowData.active && notInMove && id !== (geoLocation?.identifier ?? '') && planId) {
                      getLocationByIdAndPlanId(id, planId)
                        .then(res => {
                          setNotInMove(false);
                          setGeoLocation(res);
                        })
                        .catch(err => toast.error(err));
                    }
                  }}
                  data={showAssignedOnly(tableData)}
                />
              </Tab>
            </Tabs>
          </SimpleBar>
        </Col>
        {!showTable && (
          <Col md={open ? 12 : 8}>
            <MapViewAssignments
              collapse={() => setOpen(!open)}
              rerender={open}
              data={geoLocation}
              clearHandler={() => {
                if (locationHierarchy && locationHierarchy.content.length && planId) {
                  getLocationByIdAndPlanId(locationHierarchy.content[0].identifier, planId).then(res => {
                    setNotInMove(false);
                    setGeoLocation(res);
                  });
                }
              }}
              moveend={notMoving}
              reloadData={() => loadData()}
            />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Assign;
