import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthorizedElement from '../../../components/AuthorizedElement';

function Home() {
  const { t } = useTranslation();
  return (
    <Container fluid className="text-center my-5">
      <h2>{t('homePage.welcomeMessage')}</h2>
      <p>{t('homePage.description')}</p>
      <AuthorizedElement roles={['manage-users']}>
        <Link to="/management" className="btn btn-success">
          {t('buttons.management')}
        </Link>
      </AuthorizedElement>
      <br />
      <AuthorizedElement roles={['plan_view']}>
        <Link to="/plans" className="mt-2 btn btn-success">
          {t('buttons.plans')}
        </Link>
      </AuthorizedElement>
    </Container>
  );
}

export default Home;
