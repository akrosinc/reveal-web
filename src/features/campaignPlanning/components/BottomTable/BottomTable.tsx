import { useTranslation } from 'react-i18next';
import { HierarchyNode } from '../../providers/types';
import styles from './BottomTable.module.css';

interface Props {
  rows: HierarchyNode[];
  isOpen: boolean;
  isNarrow: boolean;
  onToggle: () => void;
  onSelect: (node: HierarchyNode) => void;
}

// Children of the selected area (spec 4.3). Population, Sites and Status have no API yet, so they show "—".
const BottomTable = ({ rows, isOpen, isNarrow, onToggle, onSelect }: Props) => {
  const { t } = useTranslation();
  const position = isNarrow ? styles.narrow : '';

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
              <th>{t('campaignPlanning.columnPopulation')}</th>
              <th>{t('campaignPlanning.columnSites')}</th>
              <th>{t('campaignPlanning.columnStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.identifier} onClick={() => onSelect(row)}>
                <td>{row.properties.name}</td>
                <td>—</td>
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
