import { useTranslation } from 'react-i18next';
import { BsGeoAltFill, BsPentagonFill, BsX } from 'react-icons/bs';
import { CAMPAIGN_PLANNING_ASSIGN_TO_TEAM } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import { Site } from '../../providers/types';
import { getSiteTypeName } from '../../utils/sites';
import styles from './AreaPopup.module.css';

interface Props {
  site: Site;
  onClose: () => void;
}

const SitePopup = ({ site, onClose }: Props) => {
  const { t } = useTranslation();
  const canAssignTeam = useAuthorization([CAMPAIGN_PLANNING_ASSIGN_TO_TEAM]);
  const Icon = site.geometry === 'polygon' ? BsPentagonFill : BsGeoAltFill;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Icon className={styles.pin} />
        <div className={styles.titles}>
          <div className={styles.name}>{site.name}</div>
          <div className={styles.level}>{getSiteTypeName(site.typeId)}</div>
        </div>
        <button
          type="button"
          id="campaign-planning-site-popup-close"
          className={styles.close}
          aria-label={t('campaignPlanning.closeSiteInfo')}
          onClick={onClose}
        >
          <BsX />
        </button>
      </div>

      <div className={styles.actions}>
        {canAssignTeam && (
          <button type="button" id="campaign-planning-site-assign-team" className={styles.primary} disabled>
            {t('campaignPlanning.assignToTeam')}
          </button>
        )}
      </div>
    </div>
  );
};

export default SitePopup;
