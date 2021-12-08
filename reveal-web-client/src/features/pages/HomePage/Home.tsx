import { Button, Row, Col } from "react-bootstrap";
import Container from "react-bootstrap/Container";

function Home() {
  return (
    <Container fluid className="text-center my-5">
      <h2>Welcome to Reveal</h2>
      <p>Get started by selecting an intervention below</p>
      <Row className="justify-content-md-center">
        <Col>
          <Button variant="outline-success" style={{height:"234px", width: "60%"}} className="px-5 mt-4" size="lg">
            Teams
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
