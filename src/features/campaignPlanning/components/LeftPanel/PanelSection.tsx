import { ReactNode, useState } from 'react';
import styles from './LeftPanel.module.css';

interface Props {
  title: string;
  children: ReactNode;
}

const PanelSection = ({ title, children }: Props) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button type="button" className={styles.label} aria-expanded={isOpen} onClick={() => setIsOpen(open => !open)}>
        {title}
      </button>
      {isOpen && children}
    </>
  );
};

export default PanelSection;
