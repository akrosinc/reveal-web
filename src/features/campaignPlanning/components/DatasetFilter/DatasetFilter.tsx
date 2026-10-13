import { CSSProperties, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronRight } from 'react-icons/bs';
import { SimulationDataset, ValueRange } from '../../providers/types';
import styles from './DatasetFilter.module.css';

interface Props {
  dataset: SimulationDataset;
  color: string;
  // Lowest and highest value among the areas on the map; undefined until an area with values is selected
  bounds?: ValueRange;
  isOn: boolean;
  range?: ValueRange;
  onToggle: () => void;
  onChange: (range: ValueRange) => void;
}

// Two decimals, as on Simulation's slider (e.g. 99.00)
const formatValue = (value: number) => value.toFixed(2);

// Dataset row like the Simulation page's: opens a Filter switch and a min/max value slider.
// While the filter is on, areas whose value falls outside the range are left unshaded on the map.
const DatasetFilter = ({ dataset, color, bounds, isOn, range, onToggle, onChange }: Props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const hasValues = !!bounds && bounds.max > bounds.min;
  const current = range ?? bounds ?? { min: 0, max: 0 };
  const isActive = isOn && hasValues;
  const toPercent = (value: number) =>
    hasValues && bounds ? ((value - bounds.min) / (bounds.max - bounds.min)) * 100 : 0;
  // When both thumbs meet at the top, the min thumb must sit above the max one or it can't be dragged back
  const isMinOnTop = hasValues && bounds ? current.min > (bounds.min + bounds.max) / 2 : false;

  return (
    <div>
      <button type="button" className={styles.row} aria-expanded={isOpen} onClick={() => setIsOpen(open => !open)}>
        <span className={styles.swatch} style={{ background: color }} />
        <span className={styles.name} title={dataset.name}>
          {dataset.name}
        </span>
        <BsChevronRight className={isOpen ? `${styles.chevron} ${styles.open}` : styles.chevron} />
      </button>
      {isOpen && (
        <div className={styles.body} style={{ '--range-color': color } as CSSProperties}>
          <div className={styles.switchRow}>
            <label htmlFor={`campaign-planning-filter-${dataset.identifier}`}>{t('campaignPlanning.filter')}</label>
            <button
              type="button"
              role="switch"
              id={`campaign-planning-filter-${dataset.identifier}`}
              className={styles.switch}
              aria-checked={isOn}
              onClick={onToggle}
            >
              <span className={styles.knob} />
            </button>
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
                  onChange={e => onChange({ min: Math.min(Number(e.target.value), current.max), max: current.max })}
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
                  onChange={e => onChange({ min: current.min, max: Math.max(Number(e.target.value), current.min) })}
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

export default DatasetFilter;
