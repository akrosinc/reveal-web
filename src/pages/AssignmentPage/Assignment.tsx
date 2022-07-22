import React from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';
import { ASSIGNMENT_VIEW } from '../../constants';
import Assign from '../../features/assignment/components/assign';
import PlanList from '../../features/assignment/components/plans';

const Assignment = () => {
  const { t } = useTranslation();
  return (
    <PageWrapper title={t('assignPage.title')}>
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
          path="/planId/:planId"
          element={
            <AuthGuard roles={[ASSIGNMENT_VIEW]}>
              <Assign />
            </AuthGuard>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </PageWrapper>
  );
};

export default Assignment;
