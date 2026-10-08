import { useTranslation } from 'react-i18next';
import { SCHOOLS, SITE_GROUPS, SiteGroup, ZONES } from '../../placeholderData';
import Field from './Field';
import styles from './RightPanel.module.css';

interface Props {
  onOpenGroup: (group: SiteGroup) => void;
}

const SitesTab = ({ onOpenGroup }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.sub}>{t('campaignPlanning.zonesAndSchools')}</div>
      <Field label={t('campaignPlanning.zones')} value={ZONES} />
      <Field label={t('campaignPlanning.schools')} value={SCHOOLS} />
      <div className={styles.sub}>{t('campaignPlanning.sites')}</div>
      {SITE_GROUPS.map(group => (
        <button key={group.label} type="button" className={styles.statusRow} onClick={() => onOpenGroup(group)}>
          <span className={styles.statusTop}>
            <span className={styles.statusLabel}>{group.label}</span>
            <span className={styles.statusValue}>
              {group.mapped} / {group.target}
            </span>
          </span>
          <span className={styles.track}>
            <span
              className={group.mapped >= group.target ? styles.fillComplete : styles.fillIncomplete}
              style={{ width: `${Math.round((group.mapped / group.target) * 100)}%` }}
            />
          </span>
        </button>
      ))}
    </>
  );
};

export default SitesTab;
