import { Container, Tab, Tabs } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Organization from './OrganizationPage/Organization';
import Users from "./UsersPage/Users";


const UserManagement = () => {

  let { tab } = useParams();

  return (
    <Container fluid className="my-4 px-2">
      <Tabs
        defaultActiveKey={tab}
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="organization" title="Organization">
          <Organization/>
        </Tab>
        <Tab eventKey="user" title="User">
          <Users />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default UserManagement;
