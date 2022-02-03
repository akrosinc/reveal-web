import React from 'react';
import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthorizedElement from '../../../components/AuthorizedElement';
import { MANAGEMENT, PLANS, LOCATION_PAGE } from '../../../constants';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Col, Row } from 'react-bootstrap';
Chart.register(...registerables);

function Home() {
  const { t } = useTranslation();
  const data = {
    labels: ['Users', 'Organizations', 'Plans'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [6, 3, 5],
        backgroundColor: ['#198754', '#34568B', 'rgb(255, 205, 86)'],
        hoverOffset: 4
      }
    ]
  };

  const dougData = {
    labels: ["Active Plans", "Active Organizations"],
    datasets: [{
      label: '# of Votes',
      data: [2, 3],
      backgroundColor: ["#198754", "#34568B"]
    }]
  }

  return (
    <Container fluid className="text-center my-4">
      <h2>{t('homePage.welcomeMessage')}</h2>
      <h4 className="my-4">Dashboard</h4>
      <Row>
        <Col md={6}>
          <Pie data={data} height="450px" width="450px" options={{ maintainAspectRatio: false }} />
        </Col>
        <Col md={6}>
          <Doughnut data={dougData}
            options={{
              maintainAspectRatio: false,
              rotation: 270, 
              circumference: 180,
              cutout: 120
            }}
          />
        </Col>
      </Row>
      <p className="my-4">{t('homePage.description')}</p>
      <Row>
        <Col md={4}>
          <AuthorizedElement roles={['manage-users']}>
            <Link to={MANAGEMENT} className="m-2 w-100 btn btn-success">
              {t('buttons.management')}
            </Link>
          </AuthorizedElement>
        </Col>
        <Col md={4}>
          <AuthorizedElement roles={[]}>
            <Link to={PLANS} className="m-2 w-100 btn btn-success">
              {t('buttons.plans')}
            </Link>
          </AuthorizedElement>
        </Col>
        <Col md={4}>
          <AuthorizedElement roles={[]}>
            <Link to={LOCATION_PAGE} className="m-2 w-100 btn btn-success">
              {t('buttons.locationManagement')}
            </Link>
          </AuthorizedElement>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
