import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import RevealTable from "../../../../components/Table/RevealTable";

const tableRowNames = ["Name", "Title", "Active"];
const organizationsList = [["Acros", "Otto", "True"], ["Reveal", "Company", "False"]];

const Organization = () => {
  return (
    <>
      <Row className="my-4">
        <Col>
          <h2>Organizations (0)</h2>
        </Col>
        <Col>
          <Button className="float-end">Create</Button>
        </Col>
      </Row>
      <hr className="my-4" />
      <RevealTable
        head={tableRowNames}
        rows={organizationsList}
      />
    </>
  );
};

export default Organization;
