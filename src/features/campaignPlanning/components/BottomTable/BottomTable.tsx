import { memo, useCallback, useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { BsCheckLg, BsFunnel } from 'react-icons/bs';
import {
  getSiteAddedTag,
  getSiteTargetTag,
  SITE_TYPES,
  TAG_MOH_POPULATION,
  TAG_SCHOOLS,
  TAG_USER_POPULATION,
  TAG_ZONES
} from '../../constants';
import { HierarchyNode, LocationFeature, SimulationDataset } from '../../providers/types';
import { getDatasetValues, getTagValues } from '../../utils/tableValues';
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

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// Big totals (population) as whole numbers, small values (rates) keep 2 decimals
const formatValue = (value?: number) =>
  value === undefined
    ? '—'
    : value.toLocaleString(undefined, { maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2 });

const SITES_COLUMN = 'sites';

// Children of the selected area (spec 4.3). One column per attached dataset with its value from location-data;
// Sites has no API yet, so it shows "—".
const BottomTable = ({ rows, locations, datasets, isLoading, isOpen, isNarrow, onToggle, onSelect }: Props) => {
  const { t } = useTranslation();
  const position = isNarrow ? styles.narrow : '';
  const datasetValuesByLocation = useMemo(
    () => new Map(locations.map(location => [location.identifier, getDatasetValues(location.properties.metadata)])),
    [locations]
  );
  const tagValuesByLocation = useMemo(
    () => new Map(locations.map(location => [location.identifier, getTagValues(location.properties.metadata)])),
    [locations]
  );
  const tagColumns = useMemo(
    () => [
      { id: TAG_MOH_POPULATION, name: t('campaignPlanning.mohPopulation') },
      { id: TAG_USER_POPULATION, name: t('campaignPlanning.userPopulation') },
      { id: TAG_ZONES, name: t('campaignPlanning.zones') },
      { id: TAG_SCHOOLS, name: t('campaignPlanning.schools') },
      ...SITE_TYPES.map(type => ({
        id: getSiteTargetTag(type.subtype),
        name: t('campaignPlanning.columnSiteTarget', { name: capitalize(type.name) })
      })),
      ...SITE_TYPES.map(type => ({
        id: getSiteAddedTag(type.subtype),
        name: t('campaignPlanning.columnSitesAdded', { name: capitalize(type.name) })
      }))
    ],
    [t]
  );
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const columns = useMemo(
    () => [
      ...datasets.map(dataset => ({ id: dataset.identifier, name: dataset.name })),
      ...tagColumns,
      { id: SITES_COLUMN, name: t('campaignPlanning.columnSites') }
    ],
    [datasets, tagColumns, t]
  );
  const visibleDatasets = useMemo(
    () => datasets.filter(dataset => !hiddenColumns.includes(dataset.identifier)),
    [datasets, hiddenColumns]
  );
  const visibleTagColumns = useMemo(
    () => tagColumns.filter(column => !hiddenColumns.includes(column.id)),
    [tagColumns, hiddenColumns]
  );
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
              {visibleDatasets.map(dataset => (
                <th key={dataset.identifier}>{dataset.name}</th>
              ))}
              {visibleTagColumns.map(column => (
                <th key={column.id}>{column.name}</th>
              ))}
              {showSites && <th>{t('campaignPlanning.columnSites')}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.identifier} onClick={() => onSelect(row)}>
                <td>{row.properties.name}</td>
                {visibleDatasets.map(dataset => (
                  <td key={dataset.identifier}>
                    {isLoading ? (
                      <span className={styles.cellLoading} />
                    ) : (
                      formatValue(datasetValuesByLocation.get(row.identifier)?.[dataset.identifier])
                    )}
                  </td>
                ))}
                {visibleTagColumns.map(column => (
                  <td key={column.id}>
                    {isLoading ? (
                      <span className={styles.cellLoading} />
                    ) : (
                      formatValue(tagValuesByLocation.get(row.identifier)?.[column.id])
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
