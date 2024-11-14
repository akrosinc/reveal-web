import { useState } from 'react';
import styles from './ChartSwitch.module.css';

interface SwitchProps {
  leftOption: string;
  middleOption: string;
  rightOption: string;
  onOptionChange: (option: string) => void;
}

export function ChartSwitch({ leftOption, middleOption, rightOption, onOptionChange }: SwitchProps) {
  const [selectedOption, setSelectedOption] = useState(leftOption);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    onOptionChange(option); // Notify the parent component
  };

  return (
    <div className={styles.container}>
      <div className={styles.switchContainer}>
        <div
          className={`${styles.switchBackground} ${
            selectedOption === middleOption ? styles.middle : selectedOption === rightOption ? styles.right : ''
          }`}
        />

        <button
          onClick={() => handleOptionClick(leftOption)}
          className={`${styles.option} ${selectedOption === leftOption ? styles.active : styles.inactive}`}
        >
          {leftOption}
        </button>

        <button
          onClick={() => handleOptionClick(middleOption)}
          className={`${styles.option} ${selectedOption === middleOption ? styles.active : styles.inactive}`}
        >
          {middleOption}
        </button>

        <button
          onClick={() => handleOptionClick(rightOption)}
          className={`${styles.option} ${selectedOption === rightOption ? styles.active : styles.inactive}`}
        >
          {rightOption}
        </button>
      </div>
    </div>
  );
}
