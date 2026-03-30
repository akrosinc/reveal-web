import { Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import PageWrapper from '../../components/PageWrapper';
import { GROUP_MANAGEMENT_VIEW, MANAGEMENT, ORGANIZATION_VIEW, ROLE_MANAGE_USER } from '../../constants';
import Organization from '../../features/organization/components';
import UserImport from '../../features/user/components/UserImport/UserImport';
import Users from '../../features/user/components/UsersPage';
import InstanceConfiguration from '../../features/instanceConfiguration';
import GroupConfiguration from '../../features/groupConfiguration';
import { useKeycloak } from '@react-keycloak/web';
import { useAppSelector } from '../../store/hooks';

const Management = () => {
  const { t } = useTranslation();
  const { tab } = useParams();

  let navigate = useNavigate();

  const { keycloak } = useKeycloak();
  const isInstanceAdmin = useAppSelector(state => state?.instanceContext)?.role?.name !== 'ADMIN'
  
  // Standard users see Organization tab; superadmin does NOT
  const isStandardUser = ((keycloak?.tokenParsed as any)?.groups || [])?.includes('/standard_user');
  
  return (
    <PageWrapper>
      <Tabs
        activeKey={tab || 'user'}
        id="management-tab"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={tabName => {
          navigate(MANAGEMENT + '/' + tabName);
        }}
      >
        {/* Organization tab: visible only for standard users */}
        {isStandardUser && isInstanceAdmin && keycloak.hasRealmRole(ORGANIZATION_VIEW) && (
          <Tab eventKey="organization" title={t('managementPage.organization')}>
            <AuthGuard
            roles={[ORGANIZATION_VIEW]}
            // roles={[]}
            >
              <Organization />
            </AuthGuard>
          </Tab>
        )}

        <Tab eventKey="user" title={t('managementPage.user')}>
          <AuthGuard roles={[ROLE_MANAGE_USER]}>
          {/* <AuthGuard roles={[]}> */}
            <Users />
          </AuthGuard>
        </Tab>
        <Tab eventKey="user-import" title={t('managementPage.userImport')}>
          <AuthGuard 
          roles={[ROLE_MANAGE_USER]}
          // roles={[]}
          >
            <UserImport />
          </AuthGuard>
        </Tab>
        {/* Group configuration tab: visible only for standard users */}
        {/* {isStandardUser && ( */}
          {/* <Tab eventKey="group-configuration" title={t('managementPage.groupConfiguration')}>
            <AuthGuard roles={[GROUP_MANAGEMENT_VIEW]}>
              <GroupConfiguration />
            </AuthGuard>
          </Tab> */}
        {/* )} */}
      </Tabs>
    </PageWrapper>
  );
};

export default Management;
