import { Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import PageWrapper from '../../components/PageWrapper';
import { MANAGEMENT, ORGANIZATION_VIEW, ROLE_MANAGE_USER } from '../../constants';
import Organization from '../../features/organization/components';
import UserImport from '../../features/user/components/UserImport/UserImport';
import Users from '../../features/user/components/UsersPage';
import { useKeycloak } from '@react-keycloak/web';

const Management = () => {
  const { t } = useTranslation();

  let navigate = useNavigate();

  const { keycloak } = useKeycloak();

  return (
    <PageWrapper>
      <Tabs
        defaultActiveKey={'user'}
        id="management-tab"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={tabName => {
          navigate(MANAGEMENT + '/' + tabName);
        }}
      >
        {keycloak.hasRealmRole(ORGANIZATION_VIEW) && (
          <Tab eventKey="organization" title={t('managementPage.organization')}>
            <AuthGuard roles={[ORGANIZATION_VIEW]}>
              <Organization />
            </AuthGuard>
          </Tab>
        )}

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
    </PageWrapper>
  );
};

export default Management;
