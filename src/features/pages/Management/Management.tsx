import { Container, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { MANAGEMENT } from '../../../constants';
import Organization from '../../organization/components';
import UserImport from '../../user/components/UserImport/UserImport';
import Users from '../../user/components/UsersPage';

const Management = () => {
  const { t } = useTranslation();

  let { tab } = useParams();
  let navigate = useNavigate();

  const checkTab = () => {
    if (tab === 'organization' || tab === 'user' || tab === 'userBulk') return tab;
  };

  return (
    <Container fluid className="my-4 px-2">
      <Tabs
        defaultActiveKey={checkTab()}
        id="uncontrolled-tab-example"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={tabName => {
          navigate(MANAGEMENT + '/' + tabName);
        }}
      >
        <Tab eventKey="organization" title={t('managementPage.organization')}>
          <Organization />
        </Tab>
        <Tab eventKey="user" title={t('managementPage.user')}>
          <Users />
        </Tab>
        <Tab eventKey="user-import" title={t('managementPage.userImport')}>
          <UserImport />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Management;
