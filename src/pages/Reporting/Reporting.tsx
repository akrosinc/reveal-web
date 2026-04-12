import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';
import {AMDR_REPORT_VIEW, REPORT_VIEW} from '../../constants';
import Reports from '../../features/reporting/components';
import PerformanceDashboard from '../../features/reporting/components/PerformanceDashboard';
import Report from '../../features/reporting/components/report';
import SurveyDashboard from '../../features/reporting/components/SurveyDashboard/SurveyDashboard';
import { getColumnHeaderNameTranslations } from '../../features/reporting/api';
import i18n from '../../i18n';
import AmdrReport from "../../features/reporting/components/AmdrReport/AmdrReport";
import AmdrLandingPage from "../../features/reporting/components/AmdrReport/AmdrLandingPage";
import AmdrLandingPage2 from "../../features/reporting/components/AmdrReport/AmdrLandingPage2";

const Reporting = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    getColumnHeaderNameTranslations().then(data => {
      i18n.addResourceBundle('en', 'translation', { dashboard: data['en'] }, true);
      i18n.addResourceBundle('pt', 'translation', { dashboard: data['pt'] }, true);
      i18n.addResourceBundle('de', 'translation', { dashboard: data['de'] }, true);
      i18n.addResourceBundle('fr', 'translation', { dashboard: data['fr'] }, true);
    });
  }, []);

  return (
    <PageWrapper title={pathname.includes('performance-reports') ? 'Performance Reports' : t('reportPage.title')}>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard
            roles={[REPORT_VIEW]}
            // roles={[]}
            >
              <Reports />
            </AuthGuard>
          }
        />
        <Route
          path="/report/:planId/reportType/:reportType"
          element={
            <AuthGuard
            roles={[REPORT_VIEW]}
            // roles={[]}
            >
              <Report />
            </AuthGuard>
          }
        />
        <Route
          path="/performance-reports"
          element={
            <AuthGuard
            roles={[REPORT_VIEW]}
            // roles={[]}
            >
              <Reports />
            </AuthGuard>
          }
        />
        <Route
          path="/performance-report/:planId"
          element={
            <AuthGuard
            roles={[REPORT_VIEW]}
            // roles={[]}
            >
              <PerformanceDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/survey-data"
          element={
            <AuthGuard
            roles={['view_survey_data',REPORT_VIEW]}
            // roles={[]}
            >
              <SurveyDashboard />
            </AuthGuard>
          }
        />
        <Route
            path="/amdr-data"
            element={
              <AuthGuard roles={[AMDR_REPORT_VIEW]}>
                <AmdrReport />
              </AuthGuard>
            }
        />
        <Route
            path="/amdr-landing"
            element={
              <AuthGuard roles={[AMDR_REPORT_VIEW]}>
                <AmdrLandingPage2 />
              </AuthGuard>
            }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </PageWrapper>
  );
};

export default Reporting;
