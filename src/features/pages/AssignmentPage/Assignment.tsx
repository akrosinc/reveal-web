import React from 'react';
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import { ASSIGNMENT_VIEW } from '../../../constants';
import Assign from '../../assignment/components/assign';
import PlanList from '../../assignment/components/plans';

const Assignment = () => {
  return (
    <Container fluid className="my-4 px-2">
      <h2>Assignments</h2>
      <hr className="my-4" />
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard roles={[ASSIGNMENT_VIEW]}>
              <PlanList />
            </AuthGuard>
          }
        />
        <Route
          path="/:planId"
          element={
            <AuthGuard roles={[ASSIGNMENT_VIEW]}>
              <Assign />
            </AuthGuard>
          }
        />
      </Routes>
    </Container>
  );
};

export default Assignment;
