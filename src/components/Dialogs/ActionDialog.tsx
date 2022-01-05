import { Modal } from 'react-bootstrap';

interface Props {
  title: string;
  closeHandler: () => void;
  backdrop: boolean;
  element: JSX.Element;
}

const ActionDialog = ({ title, closeHandler, backdrop, element }: Props) => {
  return (
    <Modal show={true} centered backdrop={backdrop} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{element}</Modal.Body>
    </Modal>
  );
};

export default ActionDialog;
