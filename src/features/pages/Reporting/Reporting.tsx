import React from 'react';
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import { REPORT_VIEW } from '../../../constants';
import Reports from '../../reporting/components';
import Report from '../../reporting/components/report';

const Reporting = () => {
  return (
    <Container fluid className="my-4 pb-1 px-2">
      <h2>Reports</h2>
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
          path="/:planId/:reportType"
          element={
            <AuthGuard roles={[REPORT_VIEW]}>
              <Report />
            </AuthGuard>
          }
        />
      </Routes>
    </Container>
  );
};

export default Reporting;
