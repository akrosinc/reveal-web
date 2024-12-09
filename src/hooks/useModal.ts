import { useContext } from 'react';
import { ModalContext } from '../contexts/modal.context';

export const useModal = () => {
  const context = useContext(ModalContext);
  return context;
};
