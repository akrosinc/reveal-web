import { Chart as ChartJS, ArcElement, Tooltip, ChartData, ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useRef, useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip);

interface DoghnutChartProps {
  data: ChartData<'doughnut'>;
  cutoutPercentage?: number;
  fontSize?: number;
}

const createCustomLegendPlugin = (fontSize: number, threshold: number = 5) => ({
  id: 'customLegend',
  afterDraw: (chart: any) => {
    const { ctx, width, height } = chart;
    const data = chart.data;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate radius based on chart size
    const chartArea = Math.min(width, height);
    const radius = (chartArea * 0.85) / 2; // Outer radius of the doughnut
    const labelDistance = radius + 10; // Labels positioned just outside the doughnut

    const total = data.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);

    let currentAngle = -0.5 * Math.PI; // Starting angle at top

    data.labels.forEach((label: string, index: number) => {
      const value = data.datasets[0].data[index];
      const slicePercentage = (value / total) * 100;

      if (slicePercentage < threshold) {
        currentAngle += (2 * Math.PI * value) / total; 
        return;
      }

      const sliceAngle = (2 * Math.PI * value) / total;
      const midAngle = currentAngle + sliceAngle / 2;

      const labelX = centerX + Math.cos(midAngle) * labelDistance;
      const labelY = centerY + Math.sin(midAngle) * labelDistance;

      // Save the current context state
      ctx.save();

      // Set font for labels
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = '#333';

      // Align text to the right or left based on angle
      ctx.textAlign = midAngle < -Math.PI / 2 || midAngle > Math.PI / 2 ? 'right' : 'left';
      ctx.textBaseline = 'middle';

      // Draw the label outside, centered on the slice
      ctx.fillText(label, labelX, labelY);

      // Restore the context state
      ctx.restore();

      // Update the angle for the next slice
      currentAngle += sliceAngle;
    });
  },
});

export function DoghnutChart({ data, cutoutPercentage = 40, fontSize = 14 }: DoghnutChartProps) {
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState(data);
  // Options for the Doughnut chart
  const options: ChartOptions<'doughnut'> = {
    cutout: `${cutoutPercentage}%`,
    radius: '85%', // Full radius to make the chart bigger
    responsive: true, // Ensures the chart resizes based on the container size
    maintainAspectRatio: false, // Allows the chart to stretch based on its parent container
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };

  // Register the custom plugin for dynamic label positioning
  const customLegendPlugin = createCustomLegendPlugin(fontSize);
  ChartJS.register(customLegendPlugin);

  // Update chart data when props change
  useEffect(() => {
    setChartData(data);
  }, [data]);

  return <Doughnut ref={chartRef} data={chartData} options={options} />;
}
