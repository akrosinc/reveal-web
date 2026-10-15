import { CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { BsTrash } from 'react-icons/bs';
import styles from './DeleteDatasetConfirm.module.css';

const PANEL_GAP = 10;
const EDGE_GAP = 12;

interface Props<T> {
  dataset: T;
  title?: string;
  anchor: HTMLElement | null;
  trigger: HTMLElement | null;
  onClose: () => void;
  onDelete: (dataset: T) => Promise<void>;
}

const DeleteDatasetConfirm = <T extends { identifier: string; name: string }>({
  dataset,
  title,
  anchor,
  trigger,
  onClose,
  onDelete
}: Props<T>) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; arrowTop: number }>();
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = `campaign-planning-delete-dataset-title-${dataset.identifier}`;
  const messageId = `campaign-planning-delete-dataset-message-${dataset.identifier}`;

  useLayoutEffect(() => {
    const place = () => {
      if (!anchor || !cardRef.current) return;
      const row = anchor.getBoundingClientRect();
      const { right } = (anchor.closest('[data-popup-edge]') ?? anchor).getBoundingClientRect();
      const rowCenter = row.top + row.height / 2;
      const height = cardRef.current.offsetHeight;
      const top = Math.max(EDGE_GAP, Math.min(rowCenter - 22, window.innerHeight - height - EDGE_GAP));
      setPosition({ top, left: right + PANEL_GAP, arrowTop: rowCenter - top });
    };
    place();
    window.addEventListener('resize', place);
    document.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      document.removeEventListener('scroll', place, true);
    };
  }, [anchor]);

  const cancel = useCallback(() => {
    onClose();
    trigger?.focus();
  }, [onClose, trigger]);

  useEffect(() => {
    cancelRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (isDeleting) return;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cardRef.current?.contains(target) || trigger?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDeleting, trigger, onClose, cancel]);

  const confirmDelete = () => {
    setIsDeleting(true);
    onDelete(dataset).catch(() => setIsDeleting(false));
  };

  return createPortal(
    <div
      ref={cardRef}
      className={styles.card}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      style={
        position
          ? ({ top: position.top, left: position.left, '--arrow-top': `${position.arrowTop}px` } as CSSProperties)
          : { visibility: 'hidden' }
      }
    >
      <div id={titleId} className={styles.title}>
        <BsTrash className={styles.icon} />
        {title ?? t('campaignPlanning.deleteDataset')}
      </div>
      <p id={messageId} className={styles.message}>
        {t('campaignPlanning.deleteDatasetMessage', { name: dataset.name })}
      </p>
      <div className={styles.actions}>
        <button
          ref={cancelRef}
          type="button"
          id={`campaign-planning-delete-dataset-cancel-${dataset.identifier}`}
          className={styles.cancel}
          disabled={isDeleting}
          onClick={cancel}
        >
          {t('buttons.cancel')}
        </button>
        <button
          type="button"
          id={`campaign-planning-delete-dataset-confirm-${dataset.identifier}`}
          className={styles.delete}
          disabled={isDeleting}
          onClick={confirmDelete}
        >
          {t('buttons.delete')}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default DeleteDatasetConfirm;
