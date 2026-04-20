import React, { ChangeEvent, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { uploadMetaData } from '../../../api';
import { EntityTag } from '../../../../planSimulation/providers/types';

interface Props {
  closeHandler: () => void;
  setTagsCreated: (tags: EntityTag[]) => void;
}

const UploadModal = ({ closeHandler, setTagsCreated }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [datasetName, setDatasetName] = useState('');
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitHandler = () => {
    if (selectedFile && datasetName) {
      if (selectedFile.type) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', datasetName);
        uploadMetaData(formData)
          .then(res => {
            closeHandler();

            let tagsCreated = Object.keys(res).map(value => {
              return res[value];
            });

            setTagsCreated(tagsCreated);

            toast.success('File uploaded successfully');
          })
          .catch(err => {
            setSelectedFile(undefined);
            setIsError(true);
            toast.error(err);
            const message =
                err ||
                err?.response?.data ||
                err?.response?.data?.message ||
                err?.message ||
                "Upload failed";
            setError(message)
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
        <Modal.Title>Upload Meta Data t</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Dataset name:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter dataset name"
            value={datasetName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setDatasetName(e.target.value);
              setIsError(false);
            }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Select a file:</Form.Label>
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
        </Form.Group>
        {isError && (
            <>
          <Form.Label className="text-danger mt-2">
            Please provide a valid XLSX file and dataset name.
          </Form.Label>
              {error &&  <Form.Label className="text-danger mt-2">
                {error}
              </Form.Label>}
            </>
        )}
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
