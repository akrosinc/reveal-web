import { Container, Tab, Tabs } from "react-bootstrap";
import Organization from './organization/Organization';
import Users from "./users/Users";

const UserManagement = () => {
  return (
    <Container fluid className="my-4 px-2">
      <Tabs
        defaultActiveKey="organization"
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
