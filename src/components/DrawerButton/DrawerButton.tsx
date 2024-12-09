import { useRef } from 'react';
import styles from './DrawerButton.module.css';

interface DrawerButtonProps {
  onClick: (ref: any) => void;
  children: string;
}

function DrawerButton({ onClick, children }: DrawerButtonProps) {
  const buttonRef = useRef(null);

  return (
    <button
      ref={buttonRef}
      className={styles.button}
      onClick={e => {
        onClick(buttonRef);
      }}
    >
      {children}
    </button>
  );
}

export default DrawerButton;
