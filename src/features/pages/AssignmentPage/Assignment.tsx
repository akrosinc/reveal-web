import React from 'react';
import { Container } from 'react-bootstrap';
import PlanList from '../../assignment/components/plans';

const Assignment = () => {
  return (
    <Container fluid className="my-4 px-2">
      <h2>Assign Plans</h2>
      <hr className='my-4' />
      <PlanList />
    </Container>
  );
};

export default Assignment;
