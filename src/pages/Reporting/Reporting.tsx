import React from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';
import { REPORT_VIEW } from '../../constants';
import Reports from '../../features/reporting/components';
import Report from '../../features/reporting/components/report';

const Reporting = () => {
  const { t } = useTranslation();
  return (
    <PageWrapper title={t('reportPage.title')}>
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
    </PageWrapper>
  );
};

export default Reporting;
