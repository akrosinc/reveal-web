import { Route, Routes, Navigate } from 'react-router-dom';

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
  TAG_MANAGEMENT,
  DATA_EXTRACTS, AMDR_IMPORT,
  CampaignManage,
  GROUP_MANAGEMENT,
  INSTANCE_CONFIGURATION
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
import MetaDataImport from '../pages/MetaDataImport';
import AmdrImport from '../pages/AmdrImport';
import ResourcePlanning from '../pages/ResourcePlanning';
import DataProcessingProgress from '../features/technical/components/DataProcessingProgress';
import TagManagement2 from '../pages/TagManagement/TagManagement2';
import DataExtracts from '../pages/DataExtracts/DataExtracts';
import AmdrLandingPage from "../features/reporting/components/AmdrReport/AmdrLandingPage";
import AmdrLandingPage2 from "../features/reporting/components/AmdrReport/AmdrLandingPage2";
import Campaign from '../pages/Campaign';
import InstanceConfiguration from '../features/instanceConfiguration';
import GroupConfiguration from '../features/groupConfiguration';
import {SUPER_ADMIN} from "../constants/userRoles";

interface Props {
  instance?:string;
}

const Router = ({instance}:Props) => {
  const { keycloak, initialized } = useKeycloak();

  if (initialized) {
    if (keycloak.authenticated) {
      return (
        <Routes>
          {instance !== 'AMDR'  ? <>
          <Route index element={<Home />} />
          <Route path={HOME_PAGE} element={<Home />} />
          </>:<>
            <Route index element={<AmdrLandingPage2 />} />
            <Route path={HOME_PAGE} element={<AmdrLandingPage2 />} />
          </>}

          <Route path={PLANS + '/*'} element={<Plan />} />
          <Route path={MANAGEMENT + '/*'} element={<Management />}>
            <Route path=":tab" element={<Management />} />
          </Route>
          <Route path={INSTANCE_CONFIGURATION} element={<InstanceConfiguration />} />
          <Route path={INSTANCE_CONFIGURATION + '/create'} element={<InstanceConfiguration />} />
          <Route path={INSTANCE_CONFIGURATION + '/:id/edit'} element={<InstanceConfiguration />} />
          <Route path={GROUP_MANAGEMENT} element={<GroupConfiguration />} />
          <Route path={GROUP_MANAGEMENT + '/create'} element={<GroupConfiguration />} />
          <Route path={GROUP_MANAGEMENT + '/:id/edit'} element={<GroupConfiguration />} />
          <Route path={LOCATION_PAGE + '/*'} element={<Location />}>
            <Route path=":tab" element={<Location />} />
          </Route>
          <Route path={ASSIGNMENT_PAGE + '/*'} element={<Assignment />} />
          <Route path={REPORTING_PAGE + '/*'} element={<Reporting />} />
          <Route path={SIMULATION_PAGE + '/*'} element={<PlanSimulation />} />
          <Route path={CampaignManage + '/*'} element={<Campaign />} />
          <Route path={TAG_MANAGEMENT + '/*'} element={<TagManagement2 />} />
          {/* <Route path={DATA_PROCESSING_PROGRESS + '/*'} element={<DataProcessingProgress />} /> */}
          <Route path={METADATA_IMPORT + '/*'} element={<MetaDataImport />}>
            <Route path=":tab" element={<MetaDataImport />} />
          </Route>
          <Route path={AMDR_IMPORT + '/*'} element={<AmdrImport />}>
            <Route path=":tab" element={<AmdrImport />} />
          </Route>
          <Route path={RESOURCE_PLANNING_PAGE + '/*'} element={<ResourcePlanning />}>
            <Route path=":tab" element={<ResourcePlanning />} />
          </Route>
          <Route path={DATA_EXTRACTS + '/*'} element={<DataExtracts />}>
            <Route path=":tab" element={<DataExtracts />} />
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
