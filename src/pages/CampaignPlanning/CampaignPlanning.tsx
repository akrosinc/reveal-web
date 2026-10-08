import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import CampaignPlanningModule from '../../features/campaignPlanning/components/CampaignPlanning';

// Full-screen standalone module: rendered without PageWrapper / the main app shell (see App.tsx)
// TODO: add the campaign planning permission to roles once it exists on the backend
const CampaignPlanning = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthGuard roles={[]}>
            <CampaignPlanningModule />
          </AuthGuard>
        }
      />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default CampaignPlanning;
