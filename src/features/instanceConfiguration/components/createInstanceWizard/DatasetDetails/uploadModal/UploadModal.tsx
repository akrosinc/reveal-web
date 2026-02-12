import React, { ChangeEvent, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

interface Props {
    closeHandler: () => void;
    setTagsCreated: (tags: any[]) => void;
}

const UploadModal = ({ closeHandler, setTagsCreated }: Props) => {
    const [selectedFile, setSelectedFile] = useState<File>();
    const [isError, setIsError] = useState(false);

    const submitHandler = () => {
        if (selectedFile) {
            // Static logic instead of API call
            toast.success('File uploaded successfully (Static Mode)');
            setTagsCreated([]);
            closeHandler();
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
