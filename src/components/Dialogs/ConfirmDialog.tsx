import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  message: string;
  closeHandler: (action: boolean) => void;
  backdrop: boolean;
  isDarkMode: boolean;
}

const ConfirmDialog = ({ title, message, closeHandler, backdrop, isDarkMode }: Props) => {
  const { t } = useTranslation();  

  return (
    <Modal show={true} centered size="sm" backdrop={backdrop} style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p style={{wordWrap: 'break-word'}}>{message}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => closeHandler(false)}>
          {t('buttons.cancel')}
        </Button>
        <Button variant="primary" onClick={() => closeHandler(true)}>
        {t('buttons.confirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;
