import React, { useEffect, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getMetadataDetailsById } from '../../../api';
import { MetaImportTag } from '../../../providers/types';

interface Props {
  selectedFile: any;
  closeHandler: () => void;
}

const DetailsModal = ({ selectedFile, closeHandler }: Props) => {
  const [importDetails, setImportDetails] = useState<MetaImportTag[]>();

  useEffect(() => {
    getMetadataDetailsById(selectedFile.identifier)
      .then(res => setImportDetails(res))
      .catch(err => toast.error(err));
  }, [selectedFile]);

  return (
    <Modal show centered scrollable size='lg'>
      <Modal.Header>
        <Modal.Title>{selectedFile.filename}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {importDetails && importDetails.length > 0 ? (
        <Table bordered hover style={{height: '100%'}} responsive>
          <thead className='border border-1'>
            <tr>
              <th>Identifier</th>
              <th>Location Name</th>
            </tr>
          </thead>
          <tbody>
            {importDetails.map(el => (
              <tr>
                <td>{el.identifier}</td>
                <td>{el.locationName}</td>
              </tr>
            ))}
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

export default DetailsModal;
