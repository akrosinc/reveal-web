import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronRight } from 'react-icons/bs';
import styles from './LeftPanel.module.css';

interface Props {
  title: string;
  // Button at the right of the heading (e.g. the Datasets "+")
  action?: ReactNode;
  children: ReactNode;
}

const PanelSection = ({ title, action, children }: Props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(open => !open);

  return (
    <>
      <div className={styles.sectionHeader}>
        <button type="button" className={styles.label} aria-expanded={isOpen} onClick={toggle}>
          {title}
        </button>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.sectionChevron}
            title={t(isOpen ? 'campaignPlanning.collapseArea' : 'campaignPlanning.expandArea', { name: title })}
            aria-label={t(isOpen ? 'campaignPlanning.collapseArea' : 'campaignPlanning.expandArea', { name: title })}
            aria-expanded={isOpen}
            onClick={toggle}
          >
            <BsChevronRight className={isOpen ? styles.sectionChevronOpen : undefined} />
          </button>
          <span className={styles.actionSlot}>{action}</span>
        </div>
      </div>
      {isOpen && children}
    </>
  );
};

export default PanelSection;
