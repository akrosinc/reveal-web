import { ReactNode } from 'react';
import styles from './RightPanel.module.css';

interface Props {
  label: string;
  value: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Field = ({ label, value, className, onClick }: Props) => {
  const classes = [styles.field, onClick && styles.clickable, className].filter(Boolean).join(' ');
  const content = (
    <>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </>
  );

  return onClick ? (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={classes}>{content}</div>
  );
};

export default Field;
