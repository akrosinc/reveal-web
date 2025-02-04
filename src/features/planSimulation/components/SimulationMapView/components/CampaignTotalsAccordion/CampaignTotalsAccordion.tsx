import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Delete from '../../../../../../assets/svgs/trash-bin.svg';

import CampaignStyles from './CampaignTotalsAccordion.module.css';
import styles from '../../../../../location/components/accordion/Accordion.module.css';

function CampaignTotalsAccordion({ open = false, campaignTotals }: any) {
  const [isOpen, setOpen] = useState(open);

  return (
    <div className={styles.accordion_Wrapper}>
      {/* Accordion Header */}
      <div
        className={`${styles.accordion_dataset} ${isOpen ? styles.open : ''}`}
        onClick={() => setOpen(!isOpen)}
        style={{ position: 'relative' }}
      >
        <span className={CampaignStyles.total}>{campaignTotals.total}</span>
        <span>{campaignTotals.label}</span>
        <FontAwesomeIcon
          style={{ width: '0.9rem', height: '0.9rem' }}
          className={styles.icon}
          icon={isOpen ? 'chevron-down' : 'chevron-right'}
        />
      </div>

      {/* Accordion Content */}
      <div className={`${styles.accordion_item} ${!isOpen ? styles.collapsed : ''}`}>
        <div className={styles.accordion_content}>
          {campaignTotals.targetAreasList.map((area: any, index: number) => (
            <div className={CampaignStyles.targetAreaItem} key={index}>
              <div className={CampaignStyles.itemDot}></div>
              <p className={CampaignStyles.paragraph}>{area?.properties?.name || ''}</p>
              <div className={CampaignStyles.paragraph}>
                <p className={CampaignStyles.paragraph}>{Math.round(area?.properties?.population?.sum) || ''}</p>
                <button className={CampaignStyles.hoverButton}>
                  {campaignTotals.remove && <img src={Delete} alt="Delete" onClick={()=>campaignTotals.remove(area.identifier)} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CampaignTotalsAccordion;
