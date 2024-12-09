import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { ModalContext } from '../contexts/modal.context';
import CustomModal from '../components/CustomModal/CustomModal';
import { useLocation } from 'react-router-dom';

interface IModalProviderType {
  children: ReactNode;
}

type ModalOpenFunc<T = any> = (ref: RefObject<T>, content: ReactNode, hasBackdrop: boolean) => void;
type ModalCloseFunc<T = any> = (ref: T) => void;

export const ModalProvider = ({ children }: IModalProviderType) => {
  const [modals, setModals] = useState<any[]>([]);
  const location = useLocation();

  const updateModalPosition = (element: HTMLElement) => {
    const { top, right } = element.getBoundingClientRect();
    return { top: Math.floor(top), right: Math.floor(right) };
  };

  const openModal: ModalOpenFunc = (ref, content, hasBackdrop) => {
    // setModals([]);
    if (ref && ref.current) {
      const element: HTMLElement = ref.current;
      // const { top, right } = updateModalPosition(element);

      setModals([
        ...modals,
        {
          sourceRef: element,
          content,
          hasBackdrop
          // top,
          // right,
          // handleScroll // Store the scroll handler for cleanup
        }
      ]);
    }
  };

  const closeModal = () => {
    if (modals.length > 0) {
      setModals([]);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal
      }}
    >
      {children}
      {modals.map((modal, index) => (
        <CustomModal
          key={index}
          hasBackdrop={modal.hasBackdrop}
          isOpen
          onClose={closeModal}
          sourceRef={modal.sourceRef}
        >
          {modal.content}
        </CustomModal>
      ))}
    </ModalContext.Provider>
  );
};
