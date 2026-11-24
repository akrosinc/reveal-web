import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import styles from './DeckModal.module.css';

interface Props {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
  discardConfirm?: { onConfirm: () => void; onCancel: () => void };
}

const DeckModal = ({ title, subtitle, onClose, children, discardConfirm }: Props) => {
  const { t } = useTranslation();

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true" aria-label={title}>
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
      {discardConfirm && (
        <div className={styles.confirmLayer}>
          <div
            className={styles.confirm}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="deck-modal-discard-title"
            aria-describedby="deck-modal-discard-message"
            onKeyDown={e => e.key === 'Escape' && discardConfirm.onCancel()}
          >
            <div id="deck-modal-discard-title" className={styles.confirmTitle}>
              {t('campaignPlanning.discardChangesTitle')}
            </div>
            <div id="deck-modal-discard-message" className={styles.confirmMessage}>
              {t('campaignPlanning.discardChangesMessage')}
            </div>
            <div className={styles.confirmActions}>
              <button
                type="button"
                id="deck-modal-discard-cancel"
                className={styles.confirmCancel}
                autoFocus
                onClick={discardConfirm.onCancel}
              >
                {t('buttons.cancel')}
              </button>
              <button
                type="button"
                id="deck-modal-discard-ok"
                className={styles.confirmOk}
                onClick={discardConfirm.onConfirm}
              >
                {t('campaignPlanning.ok')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default DeckModal;
