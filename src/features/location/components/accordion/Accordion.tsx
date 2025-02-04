import React, { useEffect, useState } from 'react';
import styles from './Accordion.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  open?: boolean;
  parent?: boolean;
  removeBorderBottom?: boolean;
}

function Accordion({ title, open = false, children, parent = true, removeBorderBottom = false }: AccordionProps) {
  const [isOpen, setOpen] = useState(open);

  useEffect(() => {
    setOpen(open);
  }, [open]);

  return (
    <div className={`${styles.accordion_Wrapper}`}>
      <div
        className={`${styles.accordion_title} ${isOpen ? styles.open : ''}`}
        onClick={() => {
          setOpen(!isOpen);
        }}
        style={{ position: 'relative' }}
      >
        <span>{title}</span>
        <FontAwesomeIcon
          style={{ width: '0.9rem', height: '0.9rem' }}
          className={styles.icon}
          icon={isOpen ? 'chevron-down' : 'chevron-right'}
        />
      </div>
      <div
        className={`${styles.accordion_item} ${parent && styles.parrentAccordion} ${
          !isOpen ? `${styles.collapsed}` : ''
        }${removeBorderBottom ? styles.noBorder : ''}`}
      >
        <div className={`${styles.accordion_content}`}>{children}</div>
      </div>
    </div>
  );
}

export default Accordion;
