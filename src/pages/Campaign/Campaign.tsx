import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';
import { REVEAL_SIMULATION } from '../../constants';
import Simulation from '../../features/planSimulation/components/Simulation';
import CampaignManagement from '../../features/planSimulation/components/CampaignManagement';
const Campaign = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard roles={[REVEAL_SIMULATION]}>
              <CampaignManagement />
            </AuthGuard>
          }
        />
       
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </PageWrapper>
  );
};

export default Campaign;
