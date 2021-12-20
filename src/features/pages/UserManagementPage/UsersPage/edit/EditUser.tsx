import { useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { getUserById } from "../../../../user/api";
import { UserModel } from "../../../../user/providers/types";
import { cancelTokenGenerator } from "../../../../../utils/cancelTokenGenerator";

interface Props {
  show: boolean;
  userId: string;
  handleClose: () => void;
  isEditable: boolean;
}

const EditUser = ({ show, userId, handleClose, isEditable }: Props) => {
  const [user, setUser] = useState<UserModel>();
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const source = cancelTokenGenerator();
    setEdit(isEditable);
    getUserById(userId, source.token).then((res) => {
      setUser(res);
    });
    return () => {
      //Slow networks can cause a memory leak, cancel a request if its not done if modal is closed
      source.cancel(
        "Request is not done, request cancel. We don't need it anymore."
      );
    };
  }, [userId, isEditable]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>User details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Identifier</Form.Label>
            <Form.Control
              readOnly={!edit}
              type="text"
              placeholder="Enter last name"
              defaultValue={user?.identifier}
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  readOnly={!edit}
                  type="text"
                  placeholder="Enter first name"
                  defaultValue={user?.firstName}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  readOnly={!edit}
                  type="text"
                  placeholder="Enter last name"
                  defaultValue={user?.lastName}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              readOnly={!edit}
              type="email"
              placeholder="Enter email"
              defaultValue={user?.email}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              readOnly={!edit}
              type="username"
              placeholder="Enter last name"
              defaultValue={user?.userName}
            />
          </Form.Group>
          {edit ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Change password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                />
              </Form.Group>
              <Form.Group className="mb-3 d-flex">
                <Form.Label>
                  Request user to change password after first login?
                </Form.Label>
                <Form.Check className="ms-2" type="checkbox" />
              </Form.Group>
            </>
          ) : null}
          <hr />
          {edit ? (
            <>
              <Button className="float-end" variant="primary">
                Save
              </Button>
              <Button
                className="float-end me-2 btn-secondary"
                onClick={() => setEdit(!edit)}
              >
                Discard changes
              </Button>
            </>
          ) : (
            <>
              <Button
                className="float-end"
                variant="primary"
                onClick={() => setEdit(!edit)}
              >
                Edit
              </Button>
              <Button
                className="float-start"
                variant="secondary"
                onClick={handleClose}
              >
                Close
              </Button>
            </>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditUser;
