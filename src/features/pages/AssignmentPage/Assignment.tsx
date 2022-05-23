import React from 'react';
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import Assign from '../../assignment/components/assign';
import PlanList from '../../assignment/components/plans';

const Assignment = () => {
  return (
    <Container fluid className="my-4 px-2">
      <h2>Assign Plans</h2>
      <hr className="my-4" />
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard roles={[]}>
              <PlanList />
            </AuthGuard>
          }
        />
        <Route
          path="/:planId"
          element={
            <AuthGuard roles={[]}>
              <Assign />
            </AuthGuard>
          }
        />
      </Routes>
    </Container>
  );
};

export default Assignment;
