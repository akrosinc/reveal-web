import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronUp, BsListUl } from 'react-icons/bs';
import { ASSIGNED_AREA_COLOR, TEAMS_ASSIGNED_AREA_COLOR } from '../../constants';
import { RasterDataset, SimulationDataset } from '../../providers/types';
import { getDatasetColor } from '../../utils/datasets';
import Switch from '../Switch';
import styles from './MapLegend.module.css';

interface Props {
  datasets: SimulationDataset[];
  rasterDatasets: RasterDataset[];
  showAssigned: boolean;
  onShowAssignedChange: (show: boolean) => void;
}

// Like the Simulation / Campaign Management map legend: closed by default, with Campaign Management's "Toggle assigned"
// switch and assigned-area colours, then the attached datasets (with their map colour) and rasters
const MapLegend = ({ datasets, rasterDatasets, showAssigned, onShowAssignedChange }: Props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div id="campaign-planning-legend" className={styles.card}>
          <div className={styles.title}>{t('campaignPlanning.legend')}</div>
          <div className={styles.toggleRow}>
            <label htmlFor="campaign-planning-toggle-assigned">{t('campaignPlanning.toggleAssigned')}</label>
            <Switch id="campaign-planning-toggle-assigned" checked={showAssigned} onChange={onShowAssignedChange} />
          </div>
          <div className={styles.item}>
            <span className={styles.colorBox} style={{ background: ASSIGNED_AREA_COLOR }} />
            {t('campaignPlanning.assignedLocations')}
          </div>
          <div className={styles.item}>
            <span className={styles.colorBox} style={{ background: TEAMS_ASSIGNED_AREA_COLOR }} />
            {t('campaignPlanning.locationsWithTeams')}
          </div>
          <div className={styles.sectionTitle}>{t('campaignPlanning.datasets')}</div>
          {datasets.length ? (
            datasets.map((dataset, index) => (
              <div key={dataset.identifier} className={styles.item}>
                <span className={styles.colorBox} style={{ background: getDatasetColor(dataset, index) }} />
                {dataset.name}
              </div>
            ))
          ) : (
            <div className={styles.empty}>{t('campaignPlanning.noDatasets')}</div>
          )}
          <div className={styles.sectionTitle}>{t('campaignPlanning.rasters')}</div>
          {rasterDatasets.length ? (
            rasterDatasets.map(raster => (
              <div key={raster.identifier} className={styles.item}>
                <span className={`${styles.colorBox} ${styles.rasterBox}`} />
                {raster.name}
              </div>
            ))
          ) : (
            <div className={styles.empty}>{t('campaignPlanning.noRasterDatasets')}</div>
          )}
        </div>
      )}
      <button
        type="button"
        id="campaign-planning-legend-button"
        className={isOpen ? `${styles.toggle} ${styles.toggleActive}` : styles.toggle}
        aria-expanded={isOpen}
        aria-controls="campaign-planning-legend"
        onClick={() => setIsOpen(open => !open)}
      >
        <BsListUl />
        {t('campaignPlanning.legend')}
        <BsChevronUp className={isOpen ? styles.chevronOpen : styles.chevron} />
      </button>
    </>
  );
};

export default memo(MapLegend);
