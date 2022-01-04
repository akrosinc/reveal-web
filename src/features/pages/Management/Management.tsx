import { Container, Tab, Tabs } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { MANAGEMENT } from "../../../constants";
import Organization from '../../organization/components';
import UserImport from "../../user/components/UserImport/UserImport";
import Users from "../../user/components/UsersPage";


const Management = () => {

  let { tab } = useParams();
  let navigate = useNavigate();

  const checkTab = () => {
    if (tab === "organization" || tab === "user" || tab === "userBulk")
    return tab
  }

  return (
    <Container fluid className="my-4 px-2">
      <Tabs
        defaultActiveKey={checkTab()}
        id="uncontrolled-tab-example"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={(tabName) => {
          navigate(MANAGEMENT + "/" + tabName)
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

export default Management;
