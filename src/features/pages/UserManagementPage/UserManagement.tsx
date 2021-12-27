import { Container, Tab, Tabs } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { USER_MANAGEMENT } from "../../../constants";
import Organization from './OrganizationPage/Organization';
import UserImport from "./UserImport/UserImport";
import Users from "./UsersPage/Users";


const UserManagement = () => {

  let { tab } = useParams();
  let navigate = useNavigate();

  return (
    <Container fluid className="my-4 px-2">
      <Tabs
        defaultActiveKey={tab}
        id="uncontrolled-tab-example"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={(tabName) => {
          navigate(USER_MANAGEMENT + "/" + tabName)
        }}
      >
        <Tab eventKey="organization" title="Organization">
          <Organization/>
        </Tab>
        <Tab eventKey="user" title="User">
          <Users />
        </Tab>
        <Tab eventKey="user-import" title="User Import">
          <UserImport />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default UserManagement;
