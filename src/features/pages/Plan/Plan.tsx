import React from 'react';
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import { PLAN_CREATE, PLAN_UPDATE, PLAN_VIEW } from '../../../constants';
import CreatePlan from '../../plan/components/create';
import Plans from '../../plan/components';
import { ErrorPage } from '../../../components/pages';

const Plan = () => {
  return (
    <Container fluid className="my-4 px-2">
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard roles={[PLAN_VIEW]}>
              <Plans />
            </AuthGuard>
          }
        />
        <Route
          path="create"
          element={
            <AuthGuard roles={[PLAN_CREATE]}>
              <CreatePlan />
            </AuthGuard>
          }
        />
        <Route
          path="planId/:id"
          element={
            <AuthGuard roles={[PLAN_UPDATE]}>
              <CreatePlan />
            </AuthGuard>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Container>
  );
};

export default Plan;
