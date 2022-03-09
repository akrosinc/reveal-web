import React from 'react';
import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthorizedElement from '../../../components/AuthorizedElement';
import { MANAGEMENT, PLANS, LOCATION_PAGE, ASSIGNMENT_PAGE } from '../../../constants';
import { Col, Row } from 'react-bootstrap';
import Dashboard from '../../dashboard';

function Home() {
  const { t } = useTranslation();

  return (
    <Container fluid className="text-center my-4">
      <h2>{t('homePage.welcomeMessage')}</h2>
      <Dashboard />
      <p className="my-5">{t('homePage.description')}</p>
      <Row>
        <Col md={3}>
          <AuthorizedElement roles={['manage-users']}>
            <Link id='management-button' to={MANAGEMENT} className="m-2 w-100 btn btn-success">
              {t('buttons.management')}
            </Link>
          </AuthorizedElement>
        </Col>
        <Col md={3}>
          <AuthorizedElement roles={[]}>
            <Link id='plans-button' to={PLANS} className="m-2 w-100 btn btn-success">
              {t('buttons.plans')}
            </Link>
          </AuthorizedElement>
        </Col>
        <Col md={3}>
          <AuthorizedElement roles={[]}>
            <Link id='locations-button' to={LOCATION_PAGE} className="m-2 w-100 btn btn-success">
              {t('buttons.locationManagement')}
            </Link>
          </AuthorizedElement>
        </Col>
        <Col md={3}>
          <AuthorizedElement roles={[]}>
            <Link id='assign-button' to={ASSIGNMENT_PAGE} className="m-2 w-100 btn btn-success">
              Assign
            </Link>
          </AuthorizedElement>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
