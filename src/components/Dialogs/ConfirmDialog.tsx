import React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  title: string;
  message: string;
  closeHandler: (action: boolean) => void;
  backdrop: boolean;
}

const ConfirmDialog = ({ title, message, closeHandler, backdrop }: Props) => {
  return (
    <Modal show={true} centered size="sm" backdrop={backdrop} style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => closeHandler(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => closeHandler(true)}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;
