import { CSSProperties, memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronRight, BsPencil } from 'react-icons/bs';
import { SIMULATION_DATASET_MENU } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import { SimulationDataset, ValueRange } from '../../providers/types';
import DatasetColorPopup, { DatasetColorPopupHandle } from '../DatasetColorPopup/DatasetColorPopup';
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
}

// Two decimals, as on Simulation's slider (e.g. 99.00)
const formatValue = (value: number) => value.toFixed(2);

// Dataset row like the Simulation page's: opens a Filter switch and a min/max value slider.
// While the filter is on, areas whose value falls outside the range are left unshaded on the map.
// As on Simulation, the pencil renames the dataset and clicking its colour opens the colour panel.
const DatasetFilter = ({ dataset, color, bounds, isOn, range, onToggle, onChange, canEdit, onSave }: Props) => {
  const { t } = useTranslation();
  const isEditable = useAuthorization([SIMULATION_DATASET_MENU]) && canEdit;
  const [isOpen, setIsOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [newName, setNewName] = useState<string>();
  // Escape leaves the name field without saving; Enter / clicking elsewhere saves
  const isRenameCancelled = useRef(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const colorPopupRef = useRef<DatasetColorPopupHandle>(null);
  const isRenaming = newName !== undefined;

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
      <div ref={rowRef} className={isEditable ? `${styles.rowWrapper} ${styles.editable}` : styles.rowWrapper}>
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
            <span className={styles.swatch} style={{ background: color }} />
          </button>
        ) : (
          <span className={styles.swatch} style={{ background: color }} />
        )}
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
          <button type="button" className={styles.row} aria-expanded={isOpen} onClick={() => setIsOpen(open => !open)}>
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
