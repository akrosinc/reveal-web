import React, { ChangeEvent, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { uploadMetaData } from '../../../api';

interface Props {
  closeHandler: () => void;
}

const UploadModal = ({ closeHandler }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isError, setIsError] = useState(false);

  const submitHandler = () => {
    if (selectedFile) {
      if (selectedFile.type) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        uploadMetaData(formData)
          .then(res => {
            closeHandler();
            toast.success(res);
          })
          .catch(err => {
            setSelectedFile(undefined);
            setIsError(true);
            toast.error(err);
          });
      } else {
        setSelectedFile(undefined);
        setIsError(true);
      }
    } else {
      setIsError(true);
    }
  };

  return (
    <Modal show centered>
      <Modal.Header>
        <Modal.Title>Upload Meta Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label>Select a file:</Form.Label>
        <br />
        <Form.Control
          type="file"
          accept=".xls, .xlsx"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.length) {
              setIsError(false);
              setSelectedFile(e.target.files[0]);
            } else {
              setIsError(true);
              setSelectedFile(undefined);
            }
          }}
        />
        {isError && <Form.Label className="text-danger mt-2">Please provide a valid XLSX file.</Form.Label>}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeHandler}>Close</Button>
        <Button onClick={submitHandler} disabled={isError}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadModal;
