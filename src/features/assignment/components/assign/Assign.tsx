import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Row, Col, Container, Collapse, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import MapView from '../../../../components/MapBox/MapView';
import { ASSIGNMENT_PAGE } from '../../../../constants';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import classes from '../../../location/components/locations/Location.module.css';
import ExpandingTable from '../../../../components/Table/ExpandingTable';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import { getLocationListByHierarchyId } from '../../../location/api';

const Assign = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanModel>();
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const { planId } = useParams();
  useEffect(() => {
    dispatch(showLoader(true));
    if (planId !== undefined) {
      getPlanById(planId)
        .then(res => {
          setCurrentPlan(res);
          getLocationListByHierarchyId(
            10,
            0,
            res.locationHierarchy.identifier,
            true
          );
        })
        .finally(() => dispatch(showLoader(false)));
    }
  }, [planId, dispatch]);
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
        <div className={classes.floatingLocationPicker + ' bg-white p-2 rounded'}>
          <Button
            onClick={() => setOpen(!open)}
            aria-controls="expand-table"
            aria-expanded={open}
            style={{ width: '100%', border: 'none' }}
            variant="light"
            className="text-start bg-white"
          >
            Browse locations
            {open ? (
              <FontAwesomeIcon className="ms-2 mt-1 float-end" icon="chevron-up" />
            ) : (
              <FontAwesomeIcon className="ms-2 mt-1 float-end" icon="chevron-down" />
            )}
          </Button>
          <Collapse in={open}>
            <div style={{ height: '40vh', width: '100%', overflowY: 'auto' }}>
              <ExpandingTable
                columns={[]}
                clickHandler={(identifier: string, col?: any) => {
                  setOpen(!open);
                  console.log(identifier, col);
                }}
                data={[]}
                sortHandler={() => console.log('sort')}
              />
            </div>
          </Collapse>
        </div>
      </MapView>
    </Container>
  );
};

export default Assign;
