import { useTranslation } from 'react-i18next';
import { ACTIVITIES, TRANSPORT_COST, TRANSPORT_MODES } from '../../placeholderData';
import Field from './Field';
import styles from './RightPanel.module.css';

const ActivityTab = () => {
  const { t } = useTranslation();

  return (
    <>
      {ACTIVITIES.map(activity => (
        <Field key={activity.label} label={activity.label} value={activity.count} />
      ))}
      <div className={styles.sub}>{t('campaignPlanning.transportAndCost')}</div>
      <div className={styles.segRow}>
        {TRANSPORT_MODES.map(mode => (
          <span key={mode} className={mode === TRANSPORT_COST.mode ? `${styles.seg} ${styles.segActive}` : styles.seg}>
            {mode}
          </span>
        ))}
      </div>
      <Field label={t('campaignPlanning.distanceFromFacility')} value={TRANSPORT_COST.distance} />
      <Field label={t('campaignPlanning.costPerActivity')} value={TRANSPORT_COST.costPerActivity} />
      <Field label={t('campaignPlanning.fuelCost')} value={TRANSPORT_COST.fuelCost} />
      <Field label={t('campaignPlanning.totalMonthlyActivities')} value={TRANSPORT_COST.totalActivities} />
      <Field
        label={t('campaignPlanning.totalMonthlyCost')}
        value={TRANSPORT_COST.totalMonthlyCost}
        className={styles.tabEnd}
      />
    </>
  );
};

export default ActivityTab;
