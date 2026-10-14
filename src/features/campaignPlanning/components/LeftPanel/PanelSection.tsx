import { ReactNode, useState } from 'react';
import styles from './LeftPanel.module.css';

interface Props {
  title: string;
  // Button at the right of the heading (e.g. the Datasets "+")
  action?: ReactNode;
  children: ReactNode;
}

const PanelSection = ({ title, action, children }: Props) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div className={styles.sectionHeader}>
        <button type="button" className={styles.label} aria-expanded={isOpen} onClick={() => setIsOpen(open => !open)}>
          {title}
        </button>
        {action}
      </div>
      {isOpen && children}
    </>
  );
};

export default PanelSection;
