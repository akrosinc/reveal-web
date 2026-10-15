import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsTrash } from 'react-icons/bs';
import { SIMULATION_DATASET_MENU } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import { RasterDataset } from '../../providers/types';
import DeleteDatasetConfirm from '../DeleteDatasetConfirm';
import styles from './RasterDatasetRow.module.css';

interface Props {
  raster: RasterDataset;
  canEdit: boolean;
  onDelete: (raster: RasterDataset) => Promise<void>;
}

const RasterDatasetRow = ({ raster, canEdit, onDelete }: Props) => {
  const { t } = useTranslation();
  const isEditable = useAuthorization([SIMULATION_DATASET_MENU]) && canEdit;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const closeDelete = useCallback(() => setIsDeleteOpen(false), []);
  const rowRef = useRef<HTMLDivElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div ref={rowRef} className={styles.row}>
        <span className={styles.swatch} />
        <span className={styles.name} title={raster.name}>
          {raster.name}
        </span>
        {isEditable && (
          <button
            ref={deleteButtonRef}
            type="button"
            id={`campaign-planning-delete-raster-${raster.identifier}`}
            className={isDeleteOpen ? `${styles.actionButton} ${styles.deleteActive}` : styles.actionButton}
            title={t('campaignPlanning.deleteDatasetLabel', { name: raster.name })}
            aria-label={t('campaignPlanning.deleteDatasetLabel', { name: raster.name })}
            aria-expanded={isDeleteOpen}
            onClick={() => setIsDeleteOpen(open => !open)}
          >
            <BsTrash />
          </button>
        )}
      </div>
      {isDeleteOpen && (
        <DeleteDatasetConfirm
          dataset={raster}
          title={t('campaignPlanning.deleteRasterDataset')}
          anchor={rowRef.current}
          trigger={deleteButtonRef.current}
          onClose={closeDelete}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default memo(RasterDatasetRow);
