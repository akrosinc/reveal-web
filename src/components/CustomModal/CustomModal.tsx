import React, { useEffect, useRef } from 'react';
import styles from './CustomModal.module.css';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sourceRef?: HTMLElement;
  hasBackdrop?: boolean;
}

function CustomModal({ isOpen, onClose, children, sourceRef, hasBackdrop = true }: CustomModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const updateModalPosition = () => {
    if (modalRef.current && sourceRef) {
      const { top, right } = sourceRef.getBoundingClientRect();
      modalRef.current.style.top = `${top}px`;
      modalRef.current.style.right = `${right}px`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('wheel', updateModalPosition, { passive: true });
      updateModalPosition();
    }
    return () => {
      window.removeEventListener('wheel', updateModalPosition);
    };
  }, [isOpen, sourceRef]);

  if (!isOpen) return null;

  return (
    <div
      className={hasBackdrop ? styles.modal_backdrop : ''}
      onClick={() => {
        // Clean up the event listener
        // (modalRef.current as any).removeEventListener('wheel', onWheelFeedback);
        onClose();
      }}
    >
      <div
        ref={modalRef}
        className={hasBackdrop ? styles.modal_content_backdrop : styles.modal_content}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.modal_close} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default CustomModal;
