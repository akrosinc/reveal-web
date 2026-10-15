import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import { CAMPAIGN_PLANNING_VIEW } from '../../constants';
import CampaignPlanningModule from '../../features/campaignPlanning/components/CampaignPlanning';

// Full-screen standalone module: rendered without PageWrapper / the main app shell (see App.tsx)
const CampaignPlanning = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthGuard roles={[CAMPAIGN_PLANNING_VIEW]}>
            <CampaignPlanningModule />
          </AuthGuard>
        }
      />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default CampaignPlanning;
