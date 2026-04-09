import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import styles from './ExpandableMenu.module.css';

interface ExpandableMenuProps {
  direction?: 'left' | 'right';
  children?: ReactNode;
  className?: string;
}

export function ExpandableMenu({ direction = 'left', children, className }: ExpandableMenuProps) {
  const containerClassName = [styles.menuContainer, styles[direction], className].filter(Boolean).join(' ');

  return (
    <div
      className={containerClassName}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <div className={styles.kebabIcon}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </div>
      <div className={styles.menuItems}>{children}</div>
    </div>
  );
}

export default ExpandableMenu;
