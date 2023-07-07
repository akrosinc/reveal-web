import { Modal } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';

interface Props {
  title: string;
  closeHandler: (isEdited: boolean) => void;
  element: JSX.Element;
  footer?: JSX.Element;
  size?: 'sm' | 'lg' | 'xl';
}

const ActionDialog = ({ title, closeHandler, element, footer, size }: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  return (
    <Modal
      size={size ? size : 'lg'}
      show={true}
      centered
      backdrop="static"
      keyboard={false}
      onHide={() => closeHandler(false)}
      contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{element}</Modal.Body>
      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
};

export default ActionDialog;
