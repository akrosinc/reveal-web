import React, { useState } from "react";
import { Button, Table, Col, Row } from "react-bootstrap";
import { ActionDialog } from "../../../../components/Dialogs";
import CreateBulk from "./create";

const UserImport = () => {
  const [openCreate, setOpenCreate] = useState(false);

  const closeHandler = () => {
    setOpenCreate(false);
  };

  return (
    <>
      <Row className="mt-2">
        <Col>
          <h2 className="m-0">Import files (2)</h2>
        </Col>
        <Col>
          <Button className="float-end" onClick={() => setOpenCreate(true)}>
            Bulk import
          </Button>
        </Col>
      </Row>

      <hr className="my-4" />
      <Table bordered responsive>
        <thead className="border border-2">
          <tr>
            <th>File name</th>
            <th>Upload date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>importFile.csv</td>
            <td>2021-12-27 11:45AM</td>
            <td>Pending</td>
          </tr>
          <tr>
            <td>newFile.csv</td>
            <td>2021-12-27 08:45AM</td>
            <td>Done</td>
          </tr>
        </tbody>
      </Table>
      {openCreate && (
        <ActionDialog
          backdrop={true}
          closeHandler={closeHandler}
          title="Import users"
          element={<CreateBulk handleClose={closeHandler} />}
        />
      )}
    </>
  );
};

export default UserImport;
