import React from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import { ErrorPage } from '../../../components/pages';
import { REPORT_VIEW } from '../../../constants';
import Reports from '../../reporting/components';
import Report from '../../reporting/components/report';

const Reporting = () => {
  const { t } = useTranslation();
  return (
    <Container fluid className="my-4 pb-1 px-2">
      <h2>{t('reportPage.title')}</h2>
      <hr />
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard roles={[REPORT_VIEW]}>
              <Reports />
            </AuthGuard>
          }
        />
        <Route
          path="/report/:planId/reportType/:reportType"
          element={
            <AuthGuard roles={[REPORT_VIEW]}>
              <Report />
            </AuthGuard>
          }
        />        
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Container>
  );
};

export default Reporting;
