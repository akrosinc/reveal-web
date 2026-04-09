import { useRef } from 'react';
import styles from './DrawerButton.module.css';
import classNames from 'classnames';

interface DrawerButtonProps {
  onClick: (ref: any) => void;
  children: string;
  disabled?: boolean;
}

function DrawerButton({ onClick, children, disabled = false }: DrawerButtonProps) {
  const buttonRef = useRef(null);

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      className={classNames(styles.button, {
        [styles.__disabled]: disabled
      })}
      onClick={e => {
        onClick(buttonRef);
      }}
    >
      {children}
    </button>
  );
}

export default DrawerButton;
