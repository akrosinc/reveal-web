import { Modal } from 'react-bootstrap';

interface Props {
  title: string;
  closeHandler: (isEdited: boolean) => void;
  element: JSX.Element;
}

const ActionDialog = ({ title, closeHandler, element }: Props) => {
  return (
    <Modal show={true} centered backdrop='static' keyboard={false} onHide={() => closeHandler(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{element}</Modal.Body>
    </Modal>
  );
};

export default ActionDialog;
