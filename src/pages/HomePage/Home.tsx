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
  PLAN_MANAGEMENT,
  INSTANE_MANAGEMENT_VIEW,
  GROUP_MANAGEMENT_VIEW,
  ASSIGNMENT_VIEW,
  ASSIGNMENT_PLAN,
  LOCATION_VIEW,
  REVEAL_SIMULATION_USER,
  ROLE_MANAGE_USER
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
      role:[ ROLE_MANAGE_USER]
    },
    {
      id: 'instance-configuration',
      to: '/instance-configuration',
      path: '/instance-configuration',
      title: t('buttons.instanceConfiguration'),
      role:[INSTANE_MANAGEMENT_VIEW]
    },
    {
      id: 'group-configuration',
      to: "/groupmanagement",
      path: "/groupmanagement",
      title: t('buttons.groupConfiguration'),
      role:[GROUP_MANAGEMENT_VIEW]
    },
    {
      id: 'plans',
      to: PLANS,
      path: PLANS,
      title: t('buttons.plans'),
      role:[REVEAL_SIMULATION_USER]
    },
    {
      id: 'locations',
      to: LOCATION_PAGE,
      path: LOCATION_PAGE,
      title: t('buttons.locationManagement'),
      role:[LOCATION_VIEW]
    },
    {
      id: 'assign',
      to: ASSIGNMENT_PAGE,
      path: ASSIGNMENT_PAGE,
      title: t('buttons.assign'),
      role:[ASSIGNMENT_PLAN]
    },
    {
      id: 'report',
      to: REPORTING_PAGE,
      path: REPORTING_PAGE,
      title: t('buttons.report'),
      role:[REPORT_VIEW]
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
            roles={feature?.role || []}
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
