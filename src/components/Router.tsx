import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import {
  ASSIGNMENT_PAGE,
  HOME_PAGE,
  DATA_PROCESSING_PROGRESS,
  LOCATION_PAGE,
  MANAGEMENT,
  METADATA_IMPORT,
  PLANS,
  REPORTING_PAGE,
  RESOURCE_PLANNING_PAGE,
  SIMULATION_PAGE,
  TAG_MANAGEMENT
} from '../constants/';
import Home from '../pages/HomePage';
import Plan from '../pages/Plan';
import Management from '../pages/Management';
import { useKeycloak } from '@react-keycloak/web';
import PublicPage from './pages/PublicPage';
import ErrorPage from './pages/ErrorPage';
import Location from '../pages/Location';
import Assignment from '../pages/AssignmentPage';
import Reporting from '../pages/Reporting';
import PlanSimulation from '../pages/PlanSimulationPage';
import TagManagement from '../pages/TagManagement';
import MetaDataImport from '../pages/MetaDataImport';
import ResourcePlanning from '../pages/ResourcePlanning';
import DataProcessingProgress from '../features/technical/components/DataProcessingProgress';

const Router = () => {
  const { keycloak, initialized } = useKeycloak();

  if (initialized) {
    if (keycloak.authenticated) {
      return (
        <Routes>
          <Route index element={<Home />} />
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
          <Route path={SIMULATION_PAGE + '/*'} element={<PlanSimulation />} />
          <Route path={TAG_MANAGEMENT + '/*'} element={<TagManagement />} />
          <Route path={DATA_PROCESSING_PROGRESS + '/*'} element={<DataProcessingProgress />} />
          <Route path={METADATA_IMPORT + '/*'} element={<MetaDataImport />}>
            <Route path=":tab" element={<MetaDataImport />} />
          </Route>
          <Route path={RESOURCE_PLANNING_PAGE + '/*'} element={<ResourcePlanning />}>
            <Route path=":tab" element={<ResourcePlanning />} />
          </Route>
          <Route path="*" element={<ErrorPage />} />
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
};

export default Router;
