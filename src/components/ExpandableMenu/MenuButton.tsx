import React, { ButtonHTMLAttributes } from 'react';
import styles from './ExpandableMenu.module.css';

interface MenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function MenuButton({ children, className, active, ...props }: MenuButtonProps) {
  const buttonClassName = [styles.menuItem, active && styles.active, className].filter(Boolean).join(' ');
  return (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
}

export default MenuButton;
