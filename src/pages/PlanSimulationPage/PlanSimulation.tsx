import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';
import { REVEAL_SIMULATION } from '../../constants';
import Simulation from '../../features/planSimulation/components/Simulation';

const PlanSimulation = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard 
            // roles={[REVEAL_SIMULATION]}
            roles={[]}
            >
              <Simulation />
            </AuthGuard>
          }
        />
        <Route
          path="/planId/:planId"
          element={
            <AuthGuard 
            // roles={[REVEAL_SIMULATION]}
            roles={[]}
            >
              <p>Simulation page</p>
            </AuthGuard>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </PageWrapper>
  );
};

export default PlanSimulation;
