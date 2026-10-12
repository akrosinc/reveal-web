import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HierarchyNode, LocationFeature, SimulationDataset } from '../../providers/types';
import styles from './BottomTable.module.css';

interface Props {
  rows: HierarchyNode[];
  locations: LocationFeature[];
  datasets: SimulationDataset[];
  isLoading: boolean;
  isOpen: boolean;
  isNarrow: boolean;
  onToggle: () => void;
  onSelect: (node: HierarchyNode) => void;
}

// Big totals (population) as whole numbers, small values (rates) keep 2 decimals
const formatValue = (value?: number) =>
  value === undefined
    ? '—'
    : value.toLocaleString(undefined, { maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2 });

// Children of the selected area (spec 4.3). One column per attached dataset with its value from location-data;
// Sites and Status have no API yet, so they show "—".
const BottomTable = ({ rows, locations, datasets, isLoading, isOpen, isNarrow, onToggle, onSelect }: Props) => {
  const { t } = useTranslation();
  const position = isNarrow ? styles.narrow : '';
  const metadataByLocation = useMemo(
    () =>
      new Map(
        locations.map(location => [
          location.identifier,
          new Map(location.properties.metadata?.map(item => [item.datasetId, item.value]))
        ])
      ),
    [locations]
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        id="campaign-planning-open-table-button"
        className={`${styles.bar} ${position}`}
        aria-expanded={false}
        onClick={onToggle}
      >
        <span className={styles.barLabel}>{t('campaignPlanning.tableSummary', { count: rows.length })}</span>
        <span className={styles.handle} />
      </button>
    );
  }

  return (
    <div className={`${styles.sheet} ${position}`}>
      <button
        type="button"
        id="campaign-planning-close-table-button"
        className={styles.handleRow}
        title={t('campaignPlanning.hideTable')}
        aria-label={t('campaignPlanning.hideTable')}
        aria-expanded
        onClick={onToggle}
      >
        <span className={styles.handle} />
      </button>
      <div className={styles.title}>{t('campaignPlanning.tableTitle')}</div>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('campaignPlanning.columnName')}</th>
              {datasets.map(dataset => (
                <th key={dataset.identifier}>{dataset.name}</th>
              ))}
              <th>{t('campaignPlanning.columnSites')}</th>
              <th>{t('campaignPlanning.columnStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.identifier} onClick={() => onSelect(row)}>
                <td>{row.properties.name}</td>
                {datasets.map(dataset => (
                  <td key={dataset.identifier}>
                    {isLoading ? (
                      <span className={styles.cellLoading} />
                    ) : (
                      formatValue(metadataByLocation.get(row.identifier)?.get(dataset.identifier))
                    )}
                  </td>
                ))}
                <td>—</td>
                <td>—</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className={styles.empty}>{t('campaignPlanning.noChildren')}</div>}
      </div>
      <div className={styles.fade} />
    </div>
  );
};

export default BottomTable;
