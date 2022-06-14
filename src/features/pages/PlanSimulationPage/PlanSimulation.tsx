import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import { ErrorPage } from '../../../components/pages';
import { PLAN_VIEW } from '../../../constants';
import Simulation from '../../planSimulation';

const PlanSimulation = () => {
    const { t } = useTranslation();
    return (
      <Container fluid className="my-4 pb-1 px-2">
        <h2>{t('simulationPage.title')}</h2>
        <hr />
        <Routes>
          <Route
            path="/"
            element={
              <AuthGuard roles={[PLAN_VIEW]}>
                <Simulation />
              </AuthGuard>
            }
          />
          <Route
            path="/planId/:planId"
            element={
              <AuthGuard roles={[PLAN_VIEW]}>
                <p>Simulation page</p>
              </AuthGuard>
            }
          />        
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Container>
    );
}

export default PlanSimulation