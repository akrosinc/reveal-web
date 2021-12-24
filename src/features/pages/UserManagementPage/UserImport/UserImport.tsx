import React from "react";
import { Button, Table, Col, Row } from "react-bootstrap";

const UserImport = () => {
  return (
    <>
          <Row className="mt-2">
              <Col><h2>Import files (0)</h2></Col>
              <Col><Button className="float-end">Bulk import</Button></Col>
          </Row>

      <hr className="my-4" />
      <Table>
        <thead className="border border-2">
          <tr>
            <th>File name</th>
            <th>Upload date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Bulk-File-Name</td>
            <td>Date</td>
            <td>Status</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default UserImport;
