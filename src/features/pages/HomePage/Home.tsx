import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthorizedElement from '../../../components/AuthorizedElement';
import { MANAGEMENT, PLANS, LOCATION_PAGE } from '../../../constants';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Col, Row } from 'react-bootstrap';
Chart.register(...registerables);

function Home() {
  const { t } = useTranslation();
  return (
    <Container fluid className="text-center my-4">
      <h2>{t('homePage.welcomeMessage')}</h2>
      <h4 className='my-4'>Dashboard</h4>
      <Row>
        <Col md={6}>
          <Line
            datasetIdKey="id"
            data={{
              labels: ['December', 'January', 'February'],
              datasets: [
                {
                  label: 'New registrations',
                  data: [5, 6, 7],
                  backgroundColor: '#198754'
                },
                {
                  label: 'New location imports',
                  data: [3, 2, 14],
                  backgroundColor: '#34511S'
                },
                {
                  label: 'New user imports',
                  data: [0, 7, 10],
                  backgroundColor: '#34568B'
                }
              ]
            }}
          />
        </Col>
        <Col md={6}>
          <Bar
            options={{ responsive: true }}
            data={{
              labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
              datasets: [
                { data: [1, 2, 3, 1, 4, 3, 1], label: 'Users', backgroundColor: '#198754' },
                { data: [3, 2, 3, 6, 4, 3, 3], label: 'Organizations', backgroundColor: '#34568B' }
              ]
            }}
          />
        </Col>
      </Row>
      <p className='my-4'>{t('homePage.description')}</p>
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
