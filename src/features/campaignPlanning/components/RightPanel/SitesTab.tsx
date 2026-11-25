import { useTranslation } from 'react-i18next';
import { BsPencil } from 'react-icons/bs';
import { SiteGroup } from '../../utils/sites';
import Field from './Field';
import { ZonesSchoolsCounts } from './ZonesSchoolsModal';
import styles from './RightPanel.module.css';

interface Props {
  siteGroups: SiteGroup[];
  zonesSchools: ZonesSchoolsCounts;
  onEditZonesSchools: () => void;
  onOpenGroup: (group: SiteGroup) => void;
  isCatchment: boolean;
  canEditCounts: boolean;
}

const SitesTab = ({ siteGroups, zonesSchools, onEditZonesSchools, onOpenGroup, isCatchment, canEditCounts }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={`${styles.sub} ${styles.subRow}`}>
        {t('campaignPlanning.zonesAndSchools')}
        <button
          type="button"
          id="campaign-planning-edit-zones-schools-button"
          className={styles.editButton}
          title={
            isCatchment ? t('campaignPlanning.editZonesAndSchools') : t('campaignPlanning.zonesSchoolsCatchmentOnly')
          }
          aria-label={t('campaignPlanning.editZonesAndSchools')}
          aria-disabled={!canEditCounts}
          onClick={() => canEditCounts && onEditZonesSchools()}
        >
          <BsPencil />
        </button>
      </div>
      <Field label={t('campaignPlanning.zones')} value={zonesSchools.zones} />
      <Field label={t('campaignPlanning.schools')} value={zonesSchools.schools} />
      <div className={styles.sub}>{t('campaignPlanning.sites')}</div>
      {siteGroups.map(group => (
        <div key={group.geometry} className={styles.siteRow}>
          <div className={styles.statusRow}>
            <span className={styles.statusTop}>
              <span className={styles.statusLabel}>{group.label}</span>
              <span className={styles.statusValue}>
                {group.mapped} / {group.target}
              </span>
            </span>
            <span className={styles.track}>
              <span
                className={group.target && group.mapped >= group.target ? styles.fillComplete : styles.fillIncomplete}
                style={{
                  width: `${group.target ? Math.min(Math.round((group.mapped / group.target) * 100), 100) : 0}%`
                }}
              />
            </span>
          </div>
          <button
            type="button"
            id={`campaign-planning-edit-${group.geometry}-sites-button`}
            className={styles.editButton}
            title={t('campaignPlanning.editSiteGroup', { name: group.label })}
            aria-label={t('campaignPlanning.editSiteGroup', { name: group.label })}
            onClick={() => onOpenGroup(group)}
          >
            <BsPencil />
          </button>
        </div>
      ))}
    </>
  );
};

export default SitesTab;
