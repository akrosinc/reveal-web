import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsEye, BsEyeSlash, BsPencil, BsTrash } from 'react-icons/bs';
import { CAMPAIGN_PLANNING_DELETE_RASTER, CAMPAIGN_PLANNING_UPDATE_RASTER } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import EditRasterColorModal from '../../../planSimulation/components/modals/EditRasterColorModal';
import { HIDDEN_DATASET_COLOR } from '../../constants';
import { RasterDataset } from '../../providers/types';
import { getRasterBackground } from '../../utils/rasters';
import DeleteDatasetConfirm from '../DeleteDatasetConfirm';
import styles from './RasterDatasetRow.module.css';

interface Props {
  raster: RasterDataset;
  canEdit: boolean;
  isHidden: boolean;
  onVisibilityToggle: (rasterId: string) => void;
  onSave: (raster: RasterDataset, colorRamp: string, opacity?: number, name?: string) => Promise<void>;
  onDelete: (raster: RasterDataset) => Promise<void>;
}

const RasterDatasetRow = ({ raster, canEdit, isHidden, onVisibilityToggle, onSave, onDelete }: Props) => {
  const { t } = useTranslation();
  const canUpdate = useAuthorization([CAMPAIGN_PLANNING_UPDATE_RASTER]) && canEdit;
  const canDelete = useAuthorization([CAMPAIGN_PLANNING_DELETE_RASTER]) && canEdit;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState<string>();
  const isRenameCancelled = useRef(false);
  const closeEdit = useCallback(() => setIsEditOpen(false), []);
  const closeDelete = useCallback(() => setIsDeleteOpen(false), []);
  const rowRef = useRef<HTMLDivElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const visibilityLabel = t(isHidden ? 'campaignPlanning.showLayer' : 'campaignPlanning.hideLayer', {
    name: raster.name
  });
  const swatch = (
    <span
      className={styles.swatch}
      style={{ background: isHidden ? HIDDEN_DATASET_COLOR : getRasterBackground(raster.colorRamp) }}
    />
  );

  const isRenaming = newName !== undefined;

  const startRename = () => {
    isRenameCancelled.current = false;
    setNewName(raster.name);
  };

  const finishRename = () => {
    const name = newName?.trim();
    setNewName(undefined);
    if (!isRenameCancelled.current && name && name !== raster.name)
      onSave(raster, raster.colorRamp ?? '', raster.opacity, name).catch(() => undefined);
  };

  return (
    <>
      <div ref={rowRef} className={isHidden ? `${styles.row} ${styles.hiddenLayer}` : styles.row}>
        {canUpdate ? (
          <button
            type="button"
            id={`campaign-planning-raster-color-${raster.identifier}`}
            className={styles.swatchButton}
            title={t('campaignPlanning.editRasterLabel', { name: raster.name })}
            aria-label={t('campaignPlanning.editRasterLabel', { name: raster.name })}
            onClick={() => setIsEditOpen(true)}
          >
            {swatch}
          </button>
        ) : (
          swatch
        )}
        <div className={styles.nameArea}>
          {isRenaming ? (
            <input
              id={`campaign-planning-raster-name-${raster.identifier}`}
              className={styles.nameInput}
              aria-label={t('campaignPlanning.rasterName')}
              value={newName}
              autoFocus
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') isRenameCancelled.current = true;
                if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();
              }}
              onBlur={finishRename}
            />
          ) : (
            <span className={styles.name} title={raster.name}>
              {raster.name}
            </span>
          )}
          {canUpdate && !isRenaming && (
            <button
              type="button"
              id={`campaign-planning-rename-raster-${raster.identifier}`}
              className={styles.editButton}
              title={t('campaignPlanning.renameDataset', { name: raster.name })}
              aria-label={t('campaignPlanning.renameDataset', { name: raster.name })}
              onClick={startRename}
            >
              <BsPencil />
            </button>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            id={`campaign-planning-raster-visibility-${raster.identifier}`}
            className={styles.actionButton}
            title={visibilityLabel}
            aria-label={visibilityLabel}
            aria-pressed={isHidden}
            onClick={() => onVisibilityToggle(raster.identifier)}
          >
            {isHidden ? <BsEyeSlash /> : <BsEye />}
          </button>
          {canDelete && (
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
      </div>
      {isEditOpen && <EditRasterColorModal show closeHandler={closeEdit} rasterItem={raster} onUpdateColor={onSave} />}
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
