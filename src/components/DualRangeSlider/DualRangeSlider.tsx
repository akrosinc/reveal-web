import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './DualRangeSlider.module.css';
import { Color } from 'react-color-palette';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  defaultMinValue?: number;
  defaultMaxValue?: number;
  onChange?: (minValue: number, maxValue: number) => void;
  inactive?: boolean;
  color?: Color;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step,
  defaultMinValue = min,
  defaultMaxValue = max,
  onChange,
  inactive = false,
  color = {
    hex: '#808080',
    rgb: { r: 128, g: 128, b: 128 },
    hsl: { h: 0, s: 0, l: 0.5 }
  }
}) => {
  const [minValue, setMinValue] = useState(defaultMinValue);
  const [maxValue, setMaxValue] = useState(defaultMaxValue);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = useCallback((value: number) => ((value - min) / (max - min)) * 100, [min, max]);

  const snapToStep = useCallback(
    (value: number) => {
      const snappedValue = Math.round(value / step) * step;
      return Math.min(Math.max(snappedValue, min), max);
    },
    [min, max, step]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const newValue = snapToStep(min + (percentage / 100) * (max - min));

      if (isDragging === 'min') {
        if (newValue < maxValue) {
          setMinValue(newValue);
          onChange?.(newValue, maxValue);
        }
      } else {
        if (newValue > minValue) {
          setMaxValue(newValue);
          onChange?.(minValue, newValue);
        }
      }
    },
    [isDragging, min, max, minValue, maxValue, onChange, snapToStep]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={`${styles.container} ${!inactive && styles.inactive}`}>
      <div ref={sliderRef} className={styles.track}>
        <div
          className={styles.selectedRange}
          style={{
            left: `${getPercentage(minValue)}%`,
            right: `${100 - getPercentage(maxValue)}%`,
            backgroundColor: color.hex
          }}
        />
      </div>

      {/* Steps */}
      {Array.from({ length: (max - min) / step + 1 }).map((_, index, array) => {
        const value = min + index * step;
        const percentage = getPercentage(value);

        // Skip rendering for the first and last steps
        if (index === 0 || index === array.length - 1) return null;

        return <div key={value} className={styles.step} style={{ left: `${percentage}%` }} />;
      })}

      {/* Handles */}
      <div
        className={styles.handle}
        style={{
          left: `calc(${getPercentage(minValue)}% - 5px)`,
          backgroundColor: color.hex
        }}
        onMouseDown={() => setIsDragging('min')}
      />
      <div
        className={styles.handle}
        style={{
          left: `calc(${getPercentage(maxValue)}% - 5px)`,
          backgroundColor: color.hex
        }}
        onMouseDown={() => setIsDragging('max')}
      />

      {/* Values */}
      <div className={styles.values}>
        <span>{minValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
};
