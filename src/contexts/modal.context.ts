import { createContext, ReactNode, RefObject } from 'react';

interface IContext<T = any> {
  // isOpen: boolean;
  openModal: (ref: RefObject<T>, content: ReactNode, backDrop: boolean) => void;
  closeModal: (ref: RefObject<T>) => void;
}

export const ModalContext = createContext({} as IContext);
