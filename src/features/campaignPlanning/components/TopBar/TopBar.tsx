import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { HierarchyNode } from '../../providers/types';
import styles from './TopBar.module.css';

interface Props {
  path: HierarchyNode[];
}

const TopBar = ({ path }: Props) => {
  const { t } = useTranslation();

  return (
    <header className={styles.topBar}>
      <span className={styles.brand}>Reveal</span>
      <div className={styles.crumb}>
        {path.map((node, index) => (
          <Fragment key={node.identifier}>
            {index > 0 && <span className={styles.separator}>/</span>}
            <span className={index === path.length - 1 ? styles.current : undefined}>{node.properties.name}</span>
          </Fragment>
        ))}
      </div>
      <nav className={styles.nav}>
        <span className={styles.active}>{t('campaignPlanning.navCampaignPlanning')}</span>
        <span>{t('campaignPlanning.navDashboard')}</span>
        <span>{t('campaignPlanning.navAdmin')}</span>
      </nav>
    </header>
  );
};

export default TopBar;
