import React from 'react';
import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthorizedElement from '../../components/AuthorizedElement';
import {
  MANAGEMENT,
  PLANS,
  LOCATION_PAGE,
  ASSIGNMENT_PAGE,
  REPORTING_PAGE,
  PLAN_VIEW,
  LOCATION_VIEW,
  ASSIGNMENT_VIEW,
  REPORT_VIEW
} from '../../constants';
import { Col, Row } from 'react-bootstrap';
import Dashboard from '../../features/dashboard';

function Home() {
  const { t } = useTranslation();

  return (
    <Container fluid className="text-center my-4">
      <h2 className='my-5'>{t('homePage.welcomeMessage')}</h2>
      <Dashboard />
      <hr className="w-75 mx-auto" />
      <Row className="justify-content-center">
        <Col md={3}>
          <AuthorizedElement roles={['manage-users']}>
            <Link id="management-button" to={MANAGEMENT} className="m-2 w-100 btn btn-success">
              {t('buttons.management')}
            </Link>
          </AuthorizedElement>
        </Col>
        <Col md={3}>
          <AuthorizedElement roles={[PLAN_VIEW]}>
            <Link id="plans-button" to={PLANS} className="m-2 w-100 btn btn-success">
              {t('buttons.plans')}
            </Link>
          </AuthorizedElement>
        </Col>
        <Col md={3}>
          <AuthorizedElement roles={[LOCATION_VIEW]}>
            <Link id="locations-button" to={LOCATION_PAGE} className="m-2 w-100 btn btn-success">
              {t('buttons.locationManagement')}
            </Link>
          </AuthorizedElement>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={3}>
          <AuthorizedElement roles={[ASSIGNMENT_VIEW]}>
            <Link id="assign-button" to={ASSIGNMENT_PAGE} className="m-2 w-100 btn btn-success">
            {t('buttons.assign')}
            </Link>
          </AuthorizedElement>
        </Col>
        <Col md={3}>
          <AuthorizedElement roles={[REPORT_VIEW]}>
            <Link id="report-button" to={REPORTING_PAGE} className="m-2 w-100 btn btn-success">
            {t('buttons.report')}
            </Link>
          </AuthorizedElement>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
