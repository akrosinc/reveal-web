import React from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import RevealTable from "../../../../components/Table/RevealTable";
import { USER_MANAGEMENT_SINGLE_USER_CREATE } from "../../../../constants";

//Mocking data for now
const tableRowNames = ["Username", "First Name", "Last Name", "Organization"];
const organizationsList = [["boris.siman", "Boris", "Siman", "Akros"], ["milan.katic", "Milan", "Katic", "Akros"]];

const Users = () => {
  return (
    <>
      <Row className="my-4">
        <Col>
          <h2>Users (0)</h2>
        </Col>
        <Col>
          <Link
            className="btn btn-primary float-end"
            role="button"
            to={USER_MANAGEMENT_SINGLE_USER_CREATE}
          >
            Create
          </Link>
        </Col>
      </Row>
      <hr className="my-4" />
      <RevealTable head={tableRowNames} rows={organizationsList} />
    </>
  );
};

export default Users;
