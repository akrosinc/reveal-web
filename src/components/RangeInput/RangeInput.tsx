import { ChangeEvent } from 'react';
import styles from './RangeInput.module.css';

interface RangeInputProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  label?: string;
  trackColor?: string;
  thumbColor?: string;
  onChange: (value: number) => void;
}

function RangeInput({
  min,
  max,
  step = 1,
  value,
  label,
  trackColor = '#3b82f6',
  thumbColor = '#3b82f6',
  onChange
}: RangeInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.rangeContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.rangeWrapper}>
        <div className={styles.trackBackground} />
        <div
          className={styles.trackProgress}
          style={{
            width: `${percentage}%`,
            backgroundColor: trackColor
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className={styles.range}
          style={
            {
              '--thumb-color': thumbColor
            } as React.CSSProperties
          }
        />
      </div>
      <div className={styles.valueContainer}>
        <span className={styles.value}>{min}</span>
        <span className={styles.value}>{value}</span>
        <span className={styles.value}>{max}</span>
      </div>
    </div>
  );
}

export default RangeInput;
