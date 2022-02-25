import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Row, Col, Container, Collapse, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
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
import { assignLocationsToPlan, getLocationHierarchyByPlanId } from '../../api';
import { toast } from 'react-toastify';

const Assign = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanModel>();
  const [open, setOpen] = useState(false);
  const [locationHierarchy, setLocationHierarchy] = useState<PageableModel<LocationModel>>();
  const dispatch = useAppDispatch();
  let selectedLocationsIdentifiers: string[] = [];

  const { planId } = useParams();
  useEffect(() => {
    dispatch(showLoader(true));
    if (planId !== undefined) {
      getPlanById(planId)
        .then(res => {
          setCurrentPlan(res);
          getLocationHierarchyByPlanId(planId).then(res => {
            setLocationHierarchy(res);
          });
        })
        .finally(() => dispatch(showLoader(false)));
    }
  }, [planId, dispatch]);

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

  const checkChildren = (parentLocation: LocationModel, checked: boolean) => {
    parentLocation.children.forEach(el => {
      el.active = checked;
      if (el.children.length) {
        checkChildren(el, checked);
      }
    })
  }

  const saveHandler = () => {
    if (planId) {
      dispatch(showLoader(true));
      locationHierarchy?.content.forEach(location => {
        filterChildren(location);
      });
      toast.promise(assignLocationsToPlan(planId, selectedLocationsIdentifiers), {
        pending: 'Loading...',
        success: 'Locations assigned to plan successfully',
        error: {
          render({ data }: { data: ErrorModel }) {
            dispatch(showLoader(false));
            return data.message !== undefined ? data.message : 'An error has occured!';
          }
        }
      }).finally(() => {
        console.log(selectedLocationsIdentifiers);
        //empty array after sending
        selectedLocationsIdentifiers.length = 0;
        dispatch(showLoader(false));
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
        data={undefined}
        locationChildList={[]}
        startingZoom={12}
        clearHandler={() => console.log('works')}
        loadHandler={() => console.log('load')}
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
            Select locations
            {open ? (
              <FontAwesomeIcon className="ms-2 mt-1 float-end" icon="chevron-up" />
            ) : (
              <FontAwesomeIcon className="ms-2 mt-1 float-end" icon="chevron-down" />
            )}
          </Button>
          <Collapse in={open}>
            <div id="expand-table" className="mt-2">
              <div style={{ height: '40vh', width: '100%', overflowY: 'auto' }}>
                <LocationAssignmentsTable
                  checkHandler={(id: string, checked: boolean) => {
                    let b = { ...locationHierarchy } as PageableModel<LocationModel>;
                    b.content?.forEach(el => {
                      if (el.identifier === id) {
                        el.active = checked;
                        checkChildren(el, checked);
                      } else if (el.children.length) {
                        findLocationToCheck(id, el.children, checked);
                      }
                    });
                    setLocationHierarchy(b);
                  }}
                  columns={columns}
                  clickHandler={(id: string, rowData: any) => console.log(id, rowData)}
                  sortHandler={() => console.log('sort')}
                  data={locationHierarchy?.content ?? []}
                />
              </div>
              <hr className="my-3" />
              <Button className="float-end mb-2" onClick={saveHandler}>
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
