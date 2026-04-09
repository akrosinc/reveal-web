import React, { useState } from 'react';
import styles from './Switch.module.css';

interface SwitchProps {
  leftOption: string;
  rightOption: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export function Switch({ leftOption, rightOption, leftContent, rightContent }: SwitchProps) {
  const [isRight, setIsRight] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.switchContainer}>
        <div className={`${styles.switchBackground} ${isRight ? styles.right : ''}`} />

        <button
          onClick={() => setIsRight(false)}
          className={`${styles.option} ${!isRight ? styles.active : styles.inactive}`}
        >
          {leftOption}
        </button>
        <button
          onClick={() => setIsRight(true)}
          className={`${styles.option} ${isRight ? styles.active : styles.inactive}`}
        >
          {rightOption}
        </button>
      </div>

      <div className={styles.contentArea}>
        <div className={`${styles.contentWrapper} ${isRight ? styles.right : ''}`}>
          <div className={styles.content}>{leftContent}</div>
          <div className={styles.content}>{rightContent}</div>
        </div>
      </div>
    </div>
  );
}
