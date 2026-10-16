import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './DeckModal.module.css';

interface Props {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const DeckModal = ({ title, subtitle, onClose, children, className }: Props) =>
  createPortal(
    <div className={styles.overlay}>
      <div
        className={className ? `${styles.card} ${className}` : styles.card}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          id="deck-modal-close-button"
          className={styles.close}
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
        {children}
      </div>
    </div>,
    document.body
  );

export default DeckModal;
