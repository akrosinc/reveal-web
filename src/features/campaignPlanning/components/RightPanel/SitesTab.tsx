import { useTranslation } from 'react-i18next';
import { BsPencil } from 'react-icons/bs';
import { SiteGeometry } from '../../providers/types';
import { SiteGroup } from '../../utils/sites';
import Field from './Field';
import { ZonesSchoolsCounts } from './ZonesSchoolsModal';
import styles from './RightPanel.module.css';

interface Props {
  siteGroups: SiteGroup[];
  zonesSchools: ZonesSchoolsCounts;
  onEditZonesSchools: () => void;
  onOpenGroup: (group: SiteGroup) => void;
  canAddSites: boolean;
  onAddSite: (geometry: SiteGeometry) => void;
}

const SitesTab = ({ siteGroups, zonesSchools, onEditZonesSchools, onOpenGroup, canAddSites, onAddSite }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={`${styles.sub} ${styles.subRow}`}>
        {t('campaignPlanning.zonesAndSchools')}
        <button
          type="button"
          id="campaign-planning-edit-zones-schools-button"
          className={styles.editButton}
          title={t('campaignPlanning.editZonesAndSchools')}
          aria-label={t('campaignPlanning.editZonesAndSchools')}
          onClick={onEditZonesSchools}
        >
          <BsPencil />
        </button>
      </div>
      <Field label={t('campaignPlanning.zones')} value={zonesSchools.zones} />
      <Field label={t('campaignPlanning.schools')} value={zonesSchools.schools} />
      <div className={styles.sub}>{t('campaignPlanning.sites')}</div>
      {siteGroups.map(group => (
        <div key={group.geometry} className={styles.siteRow}>
          <button type="button" className={styles.statusRow} onClick={() => onOpenGroup(group)}>
            <span className={styles.statusTop}>
              <span className={styles.statusLabel}>{group.label}</span>
              <span className={styles.statusValue}>
                {group.mapped} / {group.target}
              </span>
            </span>
            <span className={styles.track}>
              <span
                className={group.target && group.mapped >= group.target ? styles.fillComplete : styles.fillIncomplete}
                style={{ width: `${group.target ? Math.round((group.mapped / group.target) * 100) : 0}%` }}
              />
            </span>
          </button>
          <button
            type="button"
            id={`campaign-planning-add-${group.geometry}-site-button`}
            className={styles.editButton}
            title={
              canAddSites
                ? t('campaignPlanning.addSiteTo', { name: group.label })
                : t('campaignPlanning.sitesLowestLevelOnly')
            }
            aria-label={t('campaignPlanning.addSiteTo', { name: group.label })}
            aria-disabled={!canAddSites}
            onClick={() => canAddSites && onAddSite(group.geometry)}
          >
            <BsPencil />
          </button>
        </div>
      ))}
    </>
  );
};

export default SitesTab;
