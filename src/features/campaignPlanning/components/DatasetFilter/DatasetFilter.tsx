import { CSSProperties, memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronRight, BsEye, BsEyeSlash, BsPencil, BsTrash } from 'react-icons/bs';
import { CAMPAIGN_PLANNING_DELETE_DATASET, CAMPAIGN_PLANNING_UPDATE_DATASET } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import { HIDDEN_DATASET_COLOR } from '../../constants';
import { SimulationDataset, ValueRange } from '../../providers/types';
import DatasetColorPopup, { DatasetColorPopupHandle } from '../DatasetColorPopup/DatasetColorPopup';
import DeleteDatasetConfirm from '../DeleteDatasetConfirm';
import Switch from '../Switch';
import styles from './DatasetFilter.module.css';

interface Props {
  dataset: SimulationDataset;
  color: string;
  // Lowest and highest value among the areas on the map; undefined until an area with values is selected
  bounds?: ValueRange;
  isOn: boolean;
  range?: ValueRange;
  // Called with the dataset id, so the panel can pass the same callbacks to every row (and memo keeps working)
  onToggle: (datasetId: string) => void;
  onChange: (datasetId: string, range: ValueRange) => void;
  // Rename (pencil) and colour panel (colour click), like Simulation; only when the plan has a simulation to save to
  canEdit: boolean;
  onSave: (dataset: SimulationDataset) => void;
  isHidden: boolean;
  onVisibilityToggle: (datasetId: string) => void;
  onDelete: (dataset: SimulationDataset) => Promise<void>;
}

// Two decimals, as on Simulation's slider (e.g. 99.00)
const formatValue = (value: number) => value.toFixed(2);

// Dataset row like the Simulation page's: opens a Filter switch and a min/max value slider.
// While the filter is on, areas whose value falls outside the range are left unshaded on the map.
// As on Simulation, the pencil renames the dataset and clicking its colour opens the colour panel.
const DatasetFilter = ({
  dataset,
  color,
  bounds,
  isOn,
  range,
  onToggle,
  onChange,
  canEdit,
  onSave,
  isHidden,
  onVisibilityToggle,
  onDelete
}: Props) => {
  const { t } = useTranslation();
  const isEditable = useAuthorization([CAMPAIGN_PLANNING_UPDATE_DATASET]) && canEdit;
  const canDelete = useAuthorization([CAMPAIGN_PLANNING_DELETE_DATASET]) && canEdit;
  const [isOpen, setIsOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [newName, setNewName] = useState<string>();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const closeDelete = useCallback(() => setIsDeleteOpen(false), []);
  // Escape leaves the name field without saving; Enter / clicking elsewhere saves
  const isRenameCancelled = useRef(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const colorPopupRef = useRef<DatasetColorPopupHandle>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const isRenaming = newName !== undefined;
  const swatchColor = isHidden ? HIDDEN_DATASET_COLOR : color;
  const visibilityLabel = t(isHidden ? 'campaignPlanning.showLayer' : 'campaignPlanning.hideLayer', {
    name: dataset.name
  });

  const startRename = () => {
    isRenameCancelled.current = false;
    setNewName(dataset.name);
  };

  const finishRename = () => {
    const name = newName?.trim();
    setNewName(undefined);
    if (!isRenameCancelled.current && name && name !== dataset.name) onSave({ ...dataset, name });
  };
  const hasValues = !!bounds && bounds.max > bounds.min;
  const current = range ?? bounds ?? { min: 0, max: 0 };
  const isActive = isOn && hasValues;
  const toPercent = (value: number) =>
    hasValues && bounds ? ((value - bounds.min) / (bounds.max - bounds.min)) * 100 : 0;
  // When both thumbs meet at the top, the min thumb must sit above the max one or it can't be dragged back
  const isMinOnTop = hasValues && bounds ? current.min > (bounds.min + bounds.max) / 2 : false;

  return (
    <div>
      <div
        ref={rowRef}
        className={[styles.rowWrapper, isEditable && styles.editable, isHidden && styles.hiddenLayer]
          .filter(Boolean)
          .join(' ')}
      >
        {isEditable ? (
          <button
            ref={colorButtonRef}
            type="button"
            id={`campaign-planning-dataset-color-${dataset.identifier}`}
            className={styles.swatchButton}
            title={t('campaignPlanning.changeDatasetColor', { name: dataset.name })}
            aria-label={t('campaignPlanning.changeDatasetColor', { name: dataset.name })}
            aria-expanded={isColorOpen}
            // Clicking the colour again closes the panel (and saves), like on Simulation
            onClick={() => (isColorOpen ? colorPopupRef.current?.close() : setIsColorOpen(true))}
          >
            <span className={styles.swatch} style={{ background: swatchColor }} />
          </button>
        ) : (
          <span className={styles.swatch} style={{ background: swatchColor }} />
        )}
        <div className={styles.nameArea}>
          {isRenaming ? (
            <input
              id={`campaign-planning-dataset-name-${dataset.identifier}`}
              className={styles.nameInput}
              aria-label={t('campaignPlanning.datasetName')}
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
            <button
              type="button"
              className={styles.row}
              aria-expanded={isOpen}
              onClick={() => setIsOpen(open => !open)}
            >
              <span className={styles.name} title={dataset.name}>
                {dataset.name}
              </span>
              <BsChevronRight className={isOpen ? `${styles.chevron} ${styles.open}` : styles.chevron} />
            </button>
          )}
          {isEditable && !isRenaming && (
            <button
              type="button"
              id={`campaign-planning-rename-dataset-${dataset.identifier}`}
              className={styles.editButton}
              title={t('campaignPlanning.renameDataset', { name: dataset.name })}
              aria-label={t('campaignPlanning.renameDataset', { name: dataset.name })}
              onClick={startRename}
            >
              <BsPencil />
            </button>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            id={`campaign-planning-dataset-visibility-${dataset.identifier}`}
            className={styles.actionButton}
            title={visibilityLabel}
            aria-label={visibilityLabel}
            aria-pressed={isHidden}
            onClick={() => onVisibilityToggle(dataset.identifier)}
          >
            {isHidden ? <BsEyeSlash /> : <BsEye />}
          </button>
          {canDelete && (
            <button
              ref={deleteButtonRef}
              type="button"
              id={`campaign-planning-delete-dataset-${dataset.identifier}`}
              className={isDeleteOpen ? `${styles.actionButton} ${styles.deleteActive}` : styles.actionButton}
              title={t('campaignPlanning.deleteDatasetLabel', { name: dataset.name })}
              aria-label={t('campaignPlanning.deleteDatasetLabel', { name: dataset.name })}
              aria-expanded={isDeleteOpen}
              onClick={() => setIsDeleteOpen(open => !open)}
            >
              <BsTrash />
            </button>
          )}
        </div>
      </div>
      {isDeleteOpen && (
        <DeleteDatasetConfirm
          dataset={dataset}
          anchor={rowRef.current}
          trigger={deleteButtonRef.current}
          onClose={closeDelete}
          onDelete={onDelete}
        />
      )}
      {isColorOpen && (
        <DatasetColorPopup
          ref={colorPopupRef}
          dataset={dataset}
          color={color}
          anchor={rowRef.current}
          trigger={colorButtonRef.current}
          onClose={() => setIsColorOpen(false)}
          onSave={onSave}
        />
      )}
      {isOpen && (
        <div className={styles.body} style={{ '--range-color': color } as CSSProperties}>
          <div className={styles.switchRow}>
            <label htmlFor={`campaign-planning-filter-${dataset.identifier}`}>{t('campaignPlanning.filter')}</label>
            <Switch
              id={`campaign-planning-filter-${dataset.identifier}`}
              checked={isOn}
              color={color}
              onChange={() => onToggle(dataset.identifier)}
            />
          </div>
          {hasValues && bounds ? (
            <>
              <div className={isActive ? styles.slider : `${styles.slider} ${styles.disabled}`}>
                <div className={styles.track}>
                  <div
                    className={styles.selected}
                    style={{ left: `${toPercent(current.min)}%`, right: `${100 - toPercent(current.max)}%` }}
                  />
                </div>
                <input
                  type="range"
                  className={styles.input}
                  style={isMinOnTop ? { zIndex: 2 } : undefined}
                  min={bounds.min}
                  max={bounds.max}
                  step="any"
                  value={current.min}
                  disabled={!isActive}
                  aria-label={t('campaignPlanning.filterMin', { name: dataset.name })}
                  onChange={e =>
                    onChange(dataset.identifier, {
                      min: Math.min(Number(e.target.value), current.max),
                      max: current.max
                    })
                  }
                />
                <input
                  type="range"
                  className={styles.input}
                  min={bounds.min}
                  max={bounds.max}
                  step="any"
                  value={current.max}
                  disabled={!isActive}
                  aria-label={t('campaignPlanning.filterMax', { name: dataset.name })}
                  onChange={e =>
                    onChange(dataset.identifier, {
                      min: current.min,
                      max: Math.max(Number(e.target.value), current.min)
                    })
                  }
                />
              </div>
              <div className={styles.values}>
                <span>{formatValue(current.min)}</span>
                <span>{formatValue(current.max)}</span>
              </div>
            </>
          ) : (
            <div className={styles.hint}>{t('campaignPlanning.filterNoValues')}</div>
          )}
        </div>
      )}
    </div>
  );
};

// Memoised: dragging one dataset's slider re-renders only that row
export default memo(DatasetFilter);
