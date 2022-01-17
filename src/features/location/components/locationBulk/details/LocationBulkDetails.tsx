import React from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { LocationBulkModel } from '../../../providers/types';
import { formatDate } from '../../../../../utils';

interface Props {
  closeHandler: () => void;
  locationBulkFile: LocationBulkModel;
}

const LocationBulkDetails = ({ closeHandler, locationBulkFile }: Props) => {
  return (
    <Modal show centered size='lg'>
      <Modal.Header>
        <Modal.Title>{locationBulkFile.filename}</Modal.Title>
        <div>
        <p className="mb-0 ms-2 text-end">Upload date: {formatDate(locationBulkFile.uploadDatetime)}</p>
        <p className="mb-0 ms-2 text-end">Created by: user.username</p>
        </div>
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
              <tr>
                <td>{locationBulkFile.identifier}</td>
                <td>{locationBulkFile.filename}</td>
                <td>{locationBulkFile.status}</td>
              </tr>

          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationBulkDetails;
