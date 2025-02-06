import { useState } from 'react';
import { Chart, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './GaugeChart.module.css';
import GaugeIcon from '../../../../assets/svgs/gaugeIcon.svg';

Chart.register(ArcElement, Tooltip);

interface GaugeChartProps {
  value: number; // Current value
  minValue: number; // Minimum value of the range
  maxValue: number; // Maximum value of the range
  label: string; // Chart label
  color: string; // Gauge color
}

export default function GaugeChart({ value, minValue, maxValue, label, color }: GaugeChartProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Ensure value is within range
  const clampedValue = Math.min(Math.max(value, minValue), maxValue);

  // Calculate percentage within the provided range
  const percentage = ((clampedValue - minValue) / (maxValue - minValue)) * 100;

  // Convert large numbers to k/m notation
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)}m`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, '#E0E0E0'],
        borderWidth: 0,
        cutout: '60%',
        circumference: 180, // Half-circle gauge
        rotation: 270
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    tooltips: { enabled: false }
  };

  return (
    <div className={styles.gaugeContainer}>
      <div className={styles.chartTitle}>
        <img src={GaugeIcon} alt="Gauge Icon" className={styles.gaugeIcon} />
        {label}
      </div>
      <div className={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
        <div className={styles.label} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {isHovered ? formatNumber(clampedValue) : `${percentage.toFixed(0)}%`}
        </div>
      </div>
      <div className={styles.rangeLabels}>
        <span>{formatNumber(minValue)}</span>
        <span>{formatNumber(maxValue)}</span>
      </div>
    </div>
  );
}
