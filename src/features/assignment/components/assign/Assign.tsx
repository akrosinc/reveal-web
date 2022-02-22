import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import MapView from '../../../../components/MapBox/MapView';
import { ASSIGNMENT_PAGE } from '../../../../constants';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';

const Assign = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanModel>();

  const { planId } = useParams();
  useEffect(() => {
    if (planId !== undefined) {
      getPlanById(planId).then(res => setCurrentPlan(res));
    }
  }, [planId]);
  return (
    <Container fluid className='my-4'>
      <Row className="mt-3">
        <Col md={3}>
          <Link to={ASSIGNMENT_PAGE} className="btn btn-primary">
            <FontAwesomeIcon size="lg" icon="arrow-left" className="me-2" /> Assign Plans
          </Link>
        </Col>
        <Col md={6} className="text-center">
          <h2 className='m-0'>Plan Assignments - {currentPlan?.name}</h2>
        </Col>
      </Row>
      <hr className='my-3'/>
      <MapView
        data={undefined}
        locationChildList={[]}
        startingZoom={12}
        clearHandler={() => console.log('works')}
        loadHandler={() => console.log('load')}
      >
        <div className="bg-white rounded p-3">
          <h2>Location list dropdown</h2>
        </div>
      </MapView>
    </Container>
  );
};

export default Assign;
