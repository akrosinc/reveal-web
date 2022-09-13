import React from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';
import { REPORT_VIEW } from '../../constants';
import Reports from '../../features/reporting/components';
import PerformanceDashboard from '../../features/reporting/components/PerformanceDashboard';
import Report from '../../features/reporting/components/report';

const Reporting = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <PageWrapper title={pathname.includes('performance-reports') ? 'Performance Reports' : t('reportPage.title')}>
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
        <Route
          path="/performance-reports"
          element={
            <AuthGuard roles={[REPORT_VIEW]}>
              <Reports />
            </AuthGuard>
          }
        />
        <Route
          path="/performanceReports/:planId"
          element={
            <AuthGuard roles={[REPORT_VIEW]}>
              <PerformanceDashboard />
            </AuthGuard>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </PageWrapper>
  );
};

export default Reporting;
