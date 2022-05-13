import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import {
  ASSIGNMENT_PAGE,
  HOME_PAGE,
  LOCATION_PAGE,
  MANAGEMENT,
  PLANS,
  REPORTING_PAGE,
  ROLE_MANAGE_USER
} from '../constants/';
import Home from '../features/pages/HomePage/Home';
import Plan from '../features/pages/Plan';
import Management from '../features/pages/Management';
import { useKeycloak } from '@react-keycloak/web';
import AuthGuard from './AuthGuard';
import PublicPage from './pages/PublicPage';
import ErrorPage from './pages/ErrorPage';
import Location from '../features/pages/Location';
import CreatePlan from '../features/plan/components/Plans/create';
import Assignment from '../features/pages/AssignmentPage';
import Assign from '../features/assignment/components/assign';
import Reporting from '../features/pages/Reporting';
import Report from '../features/reporting/components/report';

export default function Router() {
  const { keycloak, initialized } = useKeycloak();

  if (initialized) {
    if (keycloak.authenticated) {
      return (
        <Routes>
          <Route path="*" element={<ErrorPage />} />
          <Route path={HOME_PAGE} element={<Home />} />
          <Route path={PLANS} element={<Plan />} />
          <Route path={PLANS + '/create'} element={<CreatePlan />} />
          <Route path={PLANS + '/:id'} element={<CreatePlan />} />
          <Route
            path={MANAGEMENT}
            element={
              <AuthGuard roles={[ROLE_MANAGE_USER]}>
                <Management />
              </AuthGuard>
            }
          >
            <Route
              path=":tab"
              element={
                <AuthGuard roles={[ROLE_MANAGE_USER]}>
                  <Management />
                </AuthGuard>
              }
            />
          </Route>
          <Route
            path={LOCATION_PAGE}
            element={
              <AuthGuard roles={[]}>
                <Location />
              </AuthGuard>
            }
          >
            <Route
              path=":tab"
              element={
                <AuthGuard roles={[]}>
                  <Location />
                </AuthGuard>
              }
            />
          </Route>
          <Route
            path={ASSIGNMENT_PAGE}
            element={
              <AuthGuard roles={[]}>
                <Assignment />
              </AuthGuard>
            }
          />
          <Route
            path={ASSIGNMENT_PAGE + '/:planId'}
            element={
              <AuthGuard roles={[]}>
                <Assign />
              </AuthGuard>
            }
          />
          <Route
            path={REPORTING_PAGE}
            element={
              <AuthGuard roles={[]}>
                <Reporting />
              </AuthGuard>
            }
           />
           <Route
            path={REPORTING_PAGE + '/:planId'}
            element={
              <AuthGuard roles={[]}>
                <Report />
              </AuthGuard>
            }
           />
        </Routes>
      );
    } else {
      return (
        <Routes>
          <Route path="*" element={<Navigate replace to="/" />} />
          <Route path="/" element={<PublicPage />} />
        </Routes>
      );
    }
  } else {
    return null;
  }
}
