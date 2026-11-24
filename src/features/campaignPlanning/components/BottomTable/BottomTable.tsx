import { memo, useCallback, useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { BsCheckLg, BsFunnel } from 'react-icons/bs';
import { HierarchyNode, LocationFeature, SimulationDataset } from '../../providers/types';
import { getPopulationTotal } from '../../utils/population';
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

const POPULATION_COLUMN = 'population';

const SITES_COLUMN = 'sites';

// Children of the selected area (spec 4.3). One column per attached dataset with its value from location-data;
// Sites has no API yet, so it shows "—".
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
  const populationByLocation = useMemo(
    () => new Map(locations.map(location => [location.identifier, getPopulationTotal(location.properties.population)])),
    [locations]
  );
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const columns = useMemo(
    () => [
      { id: POPULATION_COLUMN, name: t('campaignPlanning.columnPopulation') },
      ...datasets.map(dataset => ({ id: dataset.identifier, name: dataset.name })),
      { id: SITES_COLUMN, name: t('campaignPlanning.columnSites') }
    ],
    [datasets, t]
  );
  const visibleDatasets = useMemo(
    () => datasets.filter(dataset => !hiddenColumns.includes(dataset.identifier)),
    [datasets, hiddenColumns]
  );
  const showPopulation = !hiddenColumns.includes(POPULATION_COLUMN);
  const showSites = !hiddenColumns.includes(SITES_COLUMN);

  const toggleColumn = useCallback((id: string) => {
    setHiddenColumns(current => (current.includes(id) ? current.filter(column => column !== id) : [...current, id]));
  }, []);

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
      <div className={styles.titleRow}>
        <div className={styles.title}>{t('campaignPlanning.tableTitle')}</div>
        <Dropdown align="end" autoClose="outside">
          <Dropdown.Toggle
            as="button"
            type="button"
            id="campaign-planning-table-columns-button"
            className={styles.columnsToggle}
            title={t('campaignPlanning.chooseColumns')}
            aria-label={t('campaignPlanning.chooseColumns')}
          >
            <BsFunnel />
          </Dropdown.Toggle>
          {createPortal(
            <Dropdown.Menu className={styles.columnsMenu} popperConfig={{ strategy: 'fixed' }}>
              <div className={styles.columnsHeading}>{t('campaignPlanning.showColumns')}</div>
              {columns.map(column => {
                const isShown = !hiddenColumns.includes(column.id);
                return (
                  <Dropdown.Item
                    key={column.id}
                    as="button"
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={isShown}
                    className={styles.columnsItem}
                    onClick={() => toggleColumn(column.id)}
                  >
                    <span className={styles.columnsName} title={column.name}>
                      {column.name}
                    </span>
                    {isShown && <BsCheckLg className={styles.columnsCheck} />}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>,
            document.body
          )}
        </Dropdown>
      </div>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('campaignPlanning.columnName')}</th>
              {showPopulation && <th>{t('campaignPlanning.columnPopulation')}</th>}
              {visibleDatasets.map(dataset => (
                <th key={dataset.identifier}>{dataset.name}</th>
              ))}
              {showSites && <th>{t('campaignPlanning.columnSites')}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.identifier} onClick={() => onSelect(row)}>
                <td>{row.properties.name}</td>
                {showPopulation && (
                  <td>
                    {isLoading ? (
                      <span className={styles.cellLoading} />
                    ) : (
                      formatValue(populationByLocation.get(row.identifier))
                    )}
                  </td>
                )}
                {visibleDatasets.map(dataset => (
                  <td key={dataset.identifier}>
                    {isLoading ? (
                      <span className={styles.cellLoading} />
                    ) : (
                      formatValue(metadataByLocation.get(row.identifier)?.get(dataset.identifier))
                    )}
                  </td>
                ))}
                {showSites && <td>—</td>}
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

export default memo(BottomTable);
