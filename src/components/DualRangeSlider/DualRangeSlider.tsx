import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './DualRangeSlider.module.css';
import { Color } from 'react-color-palette';
interface DualRangeSliderProps {
  min: number;
  max: number;
  defaultMinValue?: number;
  step?: number;
  defaultMaxValue?: number;
  onChange?: (minValue: number, maxValue: number) => void;
  inactive?: boolean;
  color?: Color;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
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

  useEffect(() => {
    setMinValue(defaultMinValue);
    setMaxValue(defaultMaxValue);
  }, [defaultMinValue, defaultMaxValue]);

  const getPercentage = useCallback(
    (value: number) => ((value - min) / (max - min)) * 100,
    [min, max]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const newValue = min + (percentage / 100) * (max - min);

      if (isDragging === 'min') {
        if (newValue < maxValue) {
          setMinValue(newValue);
          onChange?.(newValue, maxValue);
        }
      } else if (isDragging === 'max') {
        if (newValue > minValue) {
          setMaxValue(newValue);
          onChange?.(minValue, newValue);
        }
      }
    },
    [isDragging, min, max, minValue, maxValue, onChange]
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
    <div className={`${styles.container} ${inactive && styles.inactive}`}>
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
        <span>{minValue?.toFixed(2)}</span>
        <span>{maxValue?.toFixed(2)}</span>
      </div>
    </div>
  );
};
