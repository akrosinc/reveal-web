import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import BarChartIcon from '../../../../assets/svgs/barChart.svg';
import styles from './StackedBarChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: [''],
  datasets: [
    {
      label: 'Complete',
      data: [82],
      backgroundColor: '#4CAF50'
    },
    {
      label: 'Incomplete',
      data: [8],
      backgroundColor: '#FFC107'
    },
    {
      label: 'Not Visited',
      data: [10],
      backgroundColor: '#F44336'
    }
  ]
};

const options = {
  indexAxis: 'y' as const,
  responsive: true,
  scales: {
    x: {
      stacked: true,
      beginAtZero: true,
      max: 100
    },
    y: {
      stacked: true,
      ticks: {
        display: false
      },
      grid: {
        display: false
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        afterBody: (context: any) => {
          const value = context[0].raw;
          const total = 100;
          return `${value} out of ${total} (${((value / total) * 100).toFixed(1)}%)`;
        }
      }
    },
    legend: {
      position: 'bottom' as const
    }
  },
  maintainAspectRatio: false
};

const StackedBarChart = () => {
  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>
        <img src={BarChartIcon} alt="GadgeIcon" className={styles.barChartIcon} />
        Structure Visit Status
      </h2>
      <div className={styles.chartWrapper}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default StackedBarChart;
