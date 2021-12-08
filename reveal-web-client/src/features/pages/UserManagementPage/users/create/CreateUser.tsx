import { Button, Container, Form } from "react-bootstrap";

const CreateUser = () => {
  return (
    <Container>
      <Form>
        <h2 className="text-center">Create User</h2>
        <Form.Group className="mb-3" controlId="formGridEmail">
          <Form.Label>Username</Form.Label>
          <Form.Control type="email" placeholder="Enter username" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formGridPassword">
          <Form.Label>First name</Form.Label>
          <Form.Control type="password" placeholder="Enter First Name" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formGridAddress1">
          <Form.Label>Last name</Form.Label>
          <Form.Control placeholder="Enter Last Name" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formGridAddress2">
          <Form.Label>Email</Form.Label>
          <Form.Control placeholder="Enter Email" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formGridCity">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formGridState">
          <Form.Label>Security groups</Form.Label>
          <Form.Select defaultValue="Choose...">
            <option>Choose...</option>
            <option>...</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="formGridState">
          <Form.Label>Organization</Form.Label>
          <Form.Select defaultValue="Choose...">
            <option>Choose...</option>
            <option>...</option>
          </Form.Select>
        </Form.Group>
        <Button className="my-4" variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default CreateUser;
