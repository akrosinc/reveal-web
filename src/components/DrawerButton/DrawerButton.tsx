import { useRef } from 'react';
import styles from './DrawerButton.module.css';
import classNames from 'classnames';

interface DrawerButtonProps {
  onClick: (ref: any) => void;
  children: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

function DrawerButton({ onClick, children, disabled = false, style = {} }: DrawerButtonProps) {
  const buttonRef = useRef(null);

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      style={style}
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
