import React from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { BulkDetailsModel, UserBulk } from "../../../providers/types";

interface Props {
  userList: BulkDetailsModel[];
  bulkFile?: UserBulk;
  handleClose: () => void;
}

const BulkDetails = ({ userList, bulkFile, handleClose }: Props) => {
  return (
    <Modal show={true} centered size="lg" scrollable>
      <Modal.Header>
      <Modal.Title>{bulkFile?.filename}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered responsive>
          <thead className="border border-2">
            <tr>
              <th>Username</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, index) => (
              <tr key={index}>
                <td>{user.username}</td>
                <td>{user.message}</td>
                <td>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkDetails;
