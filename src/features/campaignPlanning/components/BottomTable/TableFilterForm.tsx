import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TableFilter, TableFilterRange } from '../../providers/types';
import { isSameTableFilter } from '../../utils/tableFilter';
import styles from './BottomTable.module.css';

interface Props {
  columns: { id: string; name: string }[];
  filter: TableFilter;
  onApply: (filter: TableFilter) => Promise<void>;
}

type Draft = Record<string, { min: string; max: string }>;

const toText = (value?: number) => (value === undefined ? '' : String(value));

const toBound = (text: string) => {
  const value = Number(text);
  return text.trim() === '' || !Number.isFinite(value) ? undefined : value;
};

const TableFilterForm = ({ columns, filter, onApply }: Props) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Draft>(() =>
    Object.fromEntries(
      columns.map(column => [column.id, { min: toText(filter[column.id]?.min), max: toText(filter[column.id]?.max) }])
    )
  );
  const [isSaving, setIsSaving] = useState(false);

  const draftFilter = useMemo(
    () =>
      columns.reduce((result: TableFilter, column) => {
        const min = toBound(draft[column.id]?.min ?? '');
        const max = toBound(draft[column.id]?.max ?? '');
        if (min === undefined && max === undefined) return result;
        const range: TableFilterRange = {};
        if (min !== undefined) range.min = min;
        if (max !== undefined) range.max = max;
        return { ...result, [column.id]: range };
      }, {}),
    [columns, draft]
  );
  const hasInvalidRange = Object.values(draftFilter).some(
    ({ min, max }) => min !== undefined && max !== undefined && min > max
  );
  const isChanged = !isSameTableFilter(draftFilter, filter);
  const hasDraft = Object.keys(draftFilter).length > 0;

  const setBound = (id: string, bound: 'min' | 'max', text: string) =>
    setDraft(current => ({ ...current, [id]: { ...current[id], [bound]: text } }));

  const clear = () => setDraft(Object.fromEntries(columns.map(column => [column.id, { min: '', max: '' }])));

  const apply = () => {
    setIsSaving(true);
    onApply(draftFilter)
      .catch(() => undefined)
      .finally(() => setIsSaving(false));
  };

  return (
    <div className={styles.filterSection}>
      <div className={styles.columnsHeading}>{t('campaignPlanning.filterRows')}</div>
      {columns.map(column => (
        <div key={column.id} className={styles.filterRow}>
          <span className={styles.filterName} title={column.name}>
            {column.name}
          </span>
          <input
            type="number"
            className={styles.filterInput}
            placeholder={t('campaignPlanning.filterMinShort')}
            aria-label={t('campaignPlanning.filterMin', { name: column.name })}
            value={draft[column.id]?.min ?? ''}
            onChange={event => setBound(column.id, 'min', event.target.value)}
          />
          <input
            type="number"
            className={styles.filterInput}
            placeholder={t('campaignPlanning.filterMaxShort')}
            aria-label={t('campaignPlanning.filterMax', { name: column.name })}
            value={draft[column.id]?.max ?? ''}
            onChange={event => setBound(column.id, 'max', event.target.value)}
          />
        </div>
      ))}
      {hasInvalidRange && <div className={styles.filterError}>{t('campaignPlanning.filterRangeInvalid')}</div>}
      <div className={styles.filterActions}>
        <button
          type="button"
          id="campaign-planning-table-filter-clear-button"
          className={styles.filterButton}
          disabled={!hasDraft || isSaving}
          onClick={clear}
        >
          {t('campaignPlanning.clear')}
        </button>
        <button
          type="button"
          id="campaign-planning-table-filter-apply-button"
          className={`${styles.filterButton} ${styles.filterApply}`}
          disabled={!isChanged || hasInvalidRange || isSaving}
          onClick={apply}
        >
          {t('campaignPlanning.applyFilter')}
        </button>
      </div>
    </div>
  );
};

export default TableFilterForm;
