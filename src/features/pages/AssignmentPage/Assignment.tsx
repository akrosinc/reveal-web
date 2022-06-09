import React from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import { ErrorPage } from '../../../components/pages';
import { ASSIGNMENT_VIEW } from '../../../constants';
import Assign from '../../assignment/components/assign';
import PlanList from '../../assignment/components/plans';

const Assignment = () => {
  const { t } = useTranslation();
  return (
    <Container fluid className="my-4 px-2">
      <h2>{t('assignPage.title')}</h2>
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
          path="/planId/:planId"
          element={
            <AuthGuard roles={[ASSIGNMENT_VIEW]}>
              <Assign />
            </AuthGuard>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Container>
  );
};

export default Assignment;
