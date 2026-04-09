import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import BarChartIcon from '../../../../assets/svgs/barChart.svg';
import styles from './StackedBarChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartData {
  label: string;
  data: number[];
  backgroundColor: string;
}

interface StackedBarChartProps {
  chartData?: ChartData[];
  title?: string;
  max?: number;
}

const StackedBarChart = ({ chartData, title = 'Structure Visit Status', max }: StackedBarChartProps) => {
  const defaultData = {
    labels: [''],
    datasets: chartData || [
      { label: 'Complete', data: [0], backgroundColor: '#4CAF50' },
      { label: 'Incomplete', data: [0], backgroundColor: '#FFC107' },
      { label: 'Not Visited', data: [0], backgroundColor: '#F44336' }
    ]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        max: max || 100
      },
      y: {
        stacked: true,
        ticks: { display: false },
        grid: { display: false }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          afterBody: (context: any) => {
            const value = context[0]?.raw || 0;
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

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>
        <img src={BarChartIcon} alt="BarChartIcon" className={styles.barChartIcon} />
        {title}
      </h2>
      <div className={styles.chartWrapper}>
        <Bar data={defaultData} options={options} />
      </div>
    </div>
  );
};

export default StackedBarChart;
