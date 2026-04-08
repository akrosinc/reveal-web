import React, {useEffect, useState} from 'react';
import {Button, Collapse, Modal, Table} from 'react-bootstrap';
import {getAmdrImportResults} from "../../../api";
import {AmdrImportResultsResponse} from "../../../type";
import {toast} from "react-toastify";

interface Props {
  selectedFile: any;
  closeHandler: () => void;
}

const AmdrDetailsModal = ({selectedFile, closeHandler}: Props) => {
  const [importDetails, setImportDetails] = useState<AmdrImportResultsResponse>();

  useEffect(() => {
    getAmdrImportResults(selectedFile.identifier)
    .then(res => setImportDetails(res))
    .catch(err => toast.error(err));
  }, [selectedFile]);

  return (
      <Modal show centered scrollable size="lg">
        <Modal.Header>
          <Modal.Title>{selectedFile.filename}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {importDetails ? (
              <Table bordered responsive hover>
                <thead className="border border-2">
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
                </thead>
                <tbody>
                {importDetails.statuses && importDetails.statuses.map(status =>
                    <tr>
                    <td>{status.status}</td>
                    <td>{status.count}</td>
                  </tr>
                )}

                </tbody>
              </Table>
          ) : (
              <p>No data found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeHandler}>Close</Button>
        </Modal.Footer>
      </Modal>
  );
};

export default AmdrDetailsModal;
