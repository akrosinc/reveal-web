import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import { ASSIGNMENT_PAGE, HOME_PAGE, LOCATION_PAGE, MANAGEMENT, PLANS, REPORTING_PAGE } from '../constants/';
import Home from '../features/pages/HomePage/Home';
import Plan from '../features/pages/Plan';
import Management from '../features/pages/Management';
import { useKeycloak } from '@react-keycloak/web';
import PublicPage from './pages/PublicPage';
import ErrorPage from './pages/ErrorPage';
import Location from '../features/pages/Location';
import Assignment from '../features/pages/AssignmentPage';
import Reporting from '../features/pages/Reporting';

export default function Router() {
  const { keycloak, initialized } = useKeycloak();

  if (initialized) {
    if (keycloak.authenticated) {
      return (
        <Routes>
          <Route path="*" element={<ErrorPage />} />
          <Route path={HOME_PAGE} element={<Home />} />
          <Route path={PLANS + '/*'} element={<Plan />} />
          <Route path={MANAGEMENT + '/*'} element={<Management />}>
            <Route path=":tab" element={<Management />} />
          </Route>
          <Route path={LOCATION_PAGE + '/*'} element={<Location />}>
            <Route path=":tab" element={<Location />} />
          </Route>
          <Route path={ASSIGNMENT_PAGE + '/*'} element={<Assignment />} />
          <Route path={REPORTING_PAGE + '/*'} element={<Reporting />} />
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
