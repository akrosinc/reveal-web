import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import styles from './DeckModal.module.css';

export interface DeckConfirm {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  isDanger?: boolean;
  isBusy?: boolean;
}

interface Props {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
  confirm?: DeckConfirm;
}

const DeckModal = ({ title, subtitle, onClose, children, confirm }: Props) => {
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
      {confirm && (
        <div className={styles.confirmLayer}>
          <div
            className={styles.confirm}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="deck-modal-confirm-title"
            aria-describedby="deck-modal-confirm-message"
            onKeyDown={e => e.key === 'Escape' && !confirm.isBusy && confirm.onCancel()}
          >
            <div id="deck-modal-confirm-title" className={styles.confirmTitle}>
              {confirm.title ?? t('campaignPlanning.discardChangesTitle')}
            </div>
            <div id="deck-modal-confirm-message" className={styles.confirmMessage}>
              {confirm.message ?? t('campaignPlanning.discardChangesMessage')}
            </div>
            <div className={styles.confirmActions}>
              <button
                type="button"
                id="deck-modal-confirm-cancel"
                className={styles.confirmCancel}
                autoFocus
                disabled={confirm.isBusy}
                onClick={confirm.onCancel}
              >
                {t('buttons.cancel')}
              </button>
              <button
                type="button"
                id="deck-modal-confirm-ok"
                className={`${styles.confirmOk} ${confirm.isDanger ? styles.confirmDanger : ''}`}
                disabled={confirm.isBusy}
                onClick={confirm.onConfirm}
              >
                {confirm.confirmLabel ?? t('campaignPlanning.ok')}
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
