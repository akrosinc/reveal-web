import { useTranslation } from 'react-i18next';
import { BsGeoAltFill, BsX } from 'react-icons/bs';
import { CAMPAIGN_PLANNING_ASSIGN_TO_TEAM } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import { LocationFeature, SimulationDataset } from '../../providers/types';
import { getDatasetColor } from '../../utils/datasets';
import { getPopulationTotal } from '../../utils/population';
import styles from './AreaPopup.module.css';

interface Props {
  location: LocationFeature;
  datasets: SimulationDataset[];
  isAssigned: boolean;
  hasTeams: boolean;
  onAssignTeam: () => void;
  onClose: () => void;
}

const AreaPopup = ({ location, datasets, isAssigned, hasTeams, onAssignTeam, onClose }: Props) => {
  const { t } = useTranslation();
  const canAssignTeam = useAuthorization([CAMPAIGN_PLANNING_ASSIGN_TO_TEAM]);
  const { name, geographicLevel, childrenNumber, metadata, population } = location.properties;
  const populationTotal = getPopulationTotal(population)?.toLocaleString();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <BsGeoAltFill className={styles.pin} />
        <div className={styles.titles}>
          <div className={styles.name}>{name}</div>
          <div className={styles.level}>{geographicLevel}</div>
        </div>
        <button
          type="button"
          id="campaign-planning-area-popup-close"
          className={styles.close}
          aria-label={t('campaignPlanning.closeAreaInfo')}
          onClick={onClose}
        >
          <BsX />
        </button>
      </div>

      {populationTotal && !!childrenNumber && (
        <div className={styles.population}>
          <div>
            <div className={styles.label}>{t('campaignPlanning.population')}</div>
            <div className={styles.populationValue}>{populationTotal}</div>
          </div>
          <div>
            <div className={styles.label}>{t('campaignPlanning.childAreas')}</div>
            <div className={styles.populationValue}>{childrenNumber}</div>
          </div>
        </div>
      )}

      {datasets.map((dataset, index) => {
        const value = metadata?.find(item => item.datasetId === dataset.identifier)?.value;
        return (
          <div key={dataset.identifier} className={styles.row}>
            <span className={styles.swatch} style={{ background: getDatasetColor(dataset, index) }} />
            <span className={styles.rowLabel}>{dataset.name}</span>
            <span className={styles.rowValue}>
              {typeof value === 'number' ? Math.round(value * 1000) / 1000 : t('campaignPlanning.notAvailable')}
            </span>
          </div>
        );
      })}

      <div className={styles.actions}>
        {isAssigned && hasTeams && canAssignTeam && (
          <button type="button" id="campaign-planning-assign-team" className={styles.primary} onClick={onAssignTeam}>
            {t('campaignPlanning.assignTeam')}
          </button>
        )}
      </div>
    </div>
  );
};

export default AreaPopup;
