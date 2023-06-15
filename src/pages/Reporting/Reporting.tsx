import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';
import { REPORT_VIEW } from '../../constants';
import Reports from '../../features/reporting/components';
import PerformanceDashboard from '../../features/reporting/components/PerformanceDashboard';
import Report from '../../features/reporting/components/report';
import SurveyDashboard from '../../features/reporting/components/SurveyDashboard/SurveyDashboard';
import { getColumnHeaderNameTranslations } from '../../features/reporting/api';
import i18n from '../../i18n';

const Reporting = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    getColumnHeaderNameTranslations().then(data => {
      i18n.addResourceBundle('en', 'translation', { dashboard: data['en'] }, true);
      i18n.addResourceBundle('pt', 'translation', { dashboard: data['pt'] }, true);
      i18n.addResourceBundle('de', 'translation', { dashboard: data['de'] }, true);
    });
  }, []);

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
          path="/performance-report/:planId"
          element={
            <AuthGuard roles={[REPORT_VIEW]}>
              <PerformanceDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/survey-data"
          element={
            <AuthGuard roles={['view_survey_data']}>
              <SurveyDashboard />
            </AuthGuard>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </PageWrapper>
  );
};

export default Reporting;
