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
  REPORT_VIEW,
  REVEAL_MANAGE,
  PLAN_MANAGEMENT
} from '../../constants';
import { Col, Row } from 'react-bootstrap';
import Dashboard from '../../features/dashboard';

function Home() {
  const { t } = useTranslation();

  const features = [
    {
      id: 'management',
      to: MANAGEMENT,
      path: MANAGEMENT,
      title: t('buttons.management'),
    },
    {
      id: 'instance-configuration',
      to: '/instance-configuration',
      path: '/instance-configuration',
      title: t('buttons.instanceConfiguration'),
    },
    {
      id: 'group-configuration',
      to: "/group-configuration",
      path: "/group-configuration",
      title: t('buttons.groupConfiguration'),
    },
    {
      id: 'plans',
      to: PLANS,
      path: PLANS,
      title: t('buttons.plans'),
    },
    {
      id: 'locations',
      to: LOCATION_PAGE,
      path: LOCATION_PAGE,
      title: t('buttons.locationManagement'),
    },
    {
      id: 'assign',
      to: ASSIGNMENT_PAGE,
      path: ASSIGNMENT_PAGE,
      title: t('buttons.assign'),
    },
    {
      id: 'report',
      to: REPORTING_PAGE,
      path: REPORTING_PAGE,
      title: t('buttons.report'),
    },
  ];

  return (
    <Container fluid className="text-center my-4">
      <h2 className='my-5'>{t('homePage.welcomeMessage')}</h2>
      
      <Dashboard />
      
      <Row className="justify-content-center">
        {features.map((feature) => (
          <AuthorizedElement 
            key={feature.id}
            roles={[]}
            path={feature.path}
          >
            <Col xs={12} md={4} className="mb-3">
              <Link 
                to={feature.to} 
                className="w-100 btn btn-success py-3 d-flex align-items-center justify-content-center"
                style={{ fontSize: '1.1rem', fontWeight: '400' }}
              >
                {feature.title}
              </Link>
            </Col>
          </AuthorizedElement>
        ))}
      </Row>
    </Container>
  );
}

export default Home;
