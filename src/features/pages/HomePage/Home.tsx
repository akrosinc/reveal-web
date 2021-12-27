import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";
import AuthorizedElement from "../../../components/AuthorizedElement";

function Home() {
  return (
    <Container fluid className="text-center my-5">
      <h2>Welcome to Reveal</h2>
      <p>Get started by selecting an intervention below</p>
      <AuthorizedElement roles={["manage-users"]}>
        <Link to="/user-management" className="btn btn-success">
          User management
        </Link>
      </AuthorizedElement>
      <br />
      <AuthorizedElement roles={["plan_view"]}>
        <Link to="/plans" className="mt-2 btn btn-success">
          Manage plans
        </Link>
      </AuthorizedElement>
    </Container>
  );
}

export default Home;
