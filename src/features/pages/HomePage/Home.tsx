import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthorizedElement from '../../../components/AuthorizedElement';
import { MANAGEMENT, PLANS, LOCATION_PAGE } from '../../../constants';

function Home() {
  const { t } = useTranslation();
  return (
    <Container fluid className="text-center my-5">
      <h2>{t('homePage.welcomeMessage')}</h2>
      <p>{t('homePage.description')}</p>
      <AuthorizedElement roles={['manage-users']}>
        <Link to={MANAGEMENT} className="btn btn-success">
          {t('buttons.management')}
        </Link>
      </AuthorizedElement>
      <br />
      <AuthorizedElement roles={[]}>
        <Link to={PLANS} className="mt-2 btn btn-success">
          {t('buttons.plans')}
        </Link>
      </AuthorizedElement>
      <br />
      <AuthorizedElement roles={[]}>
        <Link to={LOCATION_PAGE} className="mt-2 btn btn-success">
          Location Management
        </Link>
      </AuthorizedElement>
    </Container>
  );
}

export default Home;
