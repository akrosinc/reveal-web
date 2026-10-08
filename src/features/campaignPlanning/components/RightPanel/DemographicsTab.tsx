import { useTranslation } from 'react-i18next';
import Field from './Field';
import styles from './RightPanel.module.css';

const DemographicsTab = () => {
  const { t } = useTranslation();

  return (
    <>
      <Field label={t('campaignPlanning.mainReligion')} value="—" />
      <Field label={t('campaignPlanning.mainLanguage')} value="—" />
      <Field label={t('campaignPlanning.mainOccupation')} value="—" className={styles.tabEnd} />
    </>
  );
};

export default DemographicsTab;
