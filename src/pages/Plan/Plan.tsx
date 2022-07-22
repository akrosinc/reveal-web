import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { PLAN_CREATE, PLAN_UPDATE, PLAN_VIEW } from '../../constants';
import CreatePlan from '../../features/plan/components/create';
import Plans from '../../features/plan/components';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';

const Plan = () => {
  return (
    <PageWrapper>
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
    </PageWrapper>
  );
};

export default Plan;
