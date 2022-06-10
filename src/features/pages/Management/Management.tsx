import { useEffect } from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import { MANAGEMENT, ORGANIZATION_VIEW, ROLE_MANAGE_USER } from '../../../constants';
import Organization from '../../organization/components';
import UserImport from '../../user/components/UserImport/UserImport';
import Users from '../../user/components/UsersPage';

const Management = () => {
  const { t } = useTranslation();

  let { tab } = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    if (tab === undefined) {
      navigate(MANAGEMENT + '/organization');
    } else if (tab !== 'organization' && tab !== 'user' && tab !=='user-import') {
      navigate('/error');
    }
  }, [tab, navigate]);

  return (
    <Container fluid className="my-4 px-2">
      <Tabs
        defaultActiveKey={tab}
        id="management-tab"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={tabName => {
          navigate(MANAGEMENT + '/' + tabName);
        }}
      >
        <Tab eventKey="organization" title={t('managementPage.organization')}>
          <AuthGuard roles={[ORGANIZATION_VIEW]}>
            <Organization />
          </AuthGuard>
        </Tab>
        <Tab eventKey="user" title={t('managementPage.user')}>
          <AuthGuard roles={[ROLE_MANAGE_USER]}>
            <Users />
          </AuthGuard>
        </Tab>
        <Tab eventKey="user-import" title={t('managementPage.userImport')}>
          <AuthGuard roles={[ROLE_MANAGE_USER]}>
            <UserImport />
          </AuthGuard>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Management;
