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
  disabled?: boolean;
}
interface RangeInputv2Props extends RangeInputProps {
  allYears: number[];
}

function RangeInput({
  min,
  max,
  step = 1,
  value,
  label,
  trackColor = '#3b82f6',
  thumbColor = '#3b82f6',
  onChange,
  disabled = false
}: RangeInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`${styles.rangeContainer} ${disabled ? styles.disabled : ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className='d-flex align-items-center justify-content-center'>
        <span style={{ fontWeight: "bold", fontSize: 13.4, color: 'black' }} className={styles.value}>{value}</span>
      </div>
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
          disabled={disabled}
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
        <span className={styles.value}>{max}</span>
      </div>
    </div>
  );
}
export function RangeInputv2({
  min,
  max,
  step = 1,
  value,
  label,
  trackColor = '#3b82f6',
  thumbColor = '#3b82f6',
  onChange,
  disabled = false,
  allYears = []
}: RangeInputv2Props) {
  const hasYears = allYears && allYears.length > 0;
  
  const currentIndex = hasYears ? allYears.indexOf(value) : -1;
  const actualMin = hasYears ? 0 : min;
  const actualMax = hasYears ? allYears.length - 1 : max;
  const actualValue = hasYears ? Math.max(0, currentIndex) : value;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (hasYears) {
      onChange(allYears[val]);
    } else {
      onChange(val);
    }
  };

  const percentage = actualMax > actualMin ? ((actualValue - actualMin) / (actualMax - actualMin)) * 100 : 0;

  return (
    <div className={`${styles.rangeContainer} ${disabled ? styles.disabled : ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className='d-flex align-items-center justify-content-center'>
        <span style={{ fontWeight: "bold", fontSize: 13.4, color: 'black' }} className={styles.value}>{value}</span>
      </div>
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
          min={actualMin}
          max={actualMax}
          step={step}
          value={actualValue}
          onChange={handleChange}
          disabled={disabled}
          className={styles.range}
          style={
            {
              '--thumb-color': thumbColor
            } as React.CSSProperties
          }
        />
      </div>
      <div className={styles.valueContainer}>
        <span className={styles.value}>{hasYears ? allYears[0] : min}</span>
        <span className={styles.value}>{hasYears ? allYears[allYears.length - 1] : max}</span>
      </div>
    </div>
  );
}

export default RangeInput;
