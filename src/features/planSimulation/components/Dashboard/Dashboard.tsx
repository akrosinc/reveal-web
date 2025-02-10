import style from './Dashboard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DoghnutChart } from '../../../location/components/doughnutChart/DoghnutChart';
import { faUsers, faSitemap, faHouseUser, faDiceD20 } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { useState } from 'react';
import { ChartSwitch } from './ChartSwitch/ChartSwitch';
import StackedBarChart from '../../../location/components/StackedBarChart/StackedBarChart';
import GaugeChart from '../../../location/components/GaugeChart/GaugeChart';

library.add(faUsers, faSitemap, faHouseUser, faDiceD20);

interface DashboardProps {
  chartData: Record<string, number[]>;
  chartLabels: string[];
  totals: Record<string, number>;
  polulationChart?: boolean;
  buildingsChart?: boolean;
  targetAreaChart?: boolean;
  structures?: number;
}

function Dashboard({
  chartData,
  chartLabels,
  totals,
  polulationChart = true,
  buildingsChart = true,
  targetAreaChart = false,
  structures = 0
}: DashboardProps) {
  const [chartDataType, setChartDataType] = useState<'summary' | 'male' | 'female'>('summary');

  const handleOptionChange = (option: string) => {
    // Update chart data based on the selected option
    switch (option) {
      case 'Summary':
        setChartDataType('summary');
        break;
      case 'Male':
        setChartDataType('male');
        break;
      case 'Female':
        setChartDataType('female');
        break;
      default:
        setChartDataType('summary');
    }
  };

  return (
    <section className={style.statisticsWrapper}>
      {polulationChart && (
        <div className={style.dashBoardSectionWrapper}>
          <div className={style.populationHeading}>
            <FontAwesomeIcon className={style.populationHeadingIcon} icon="users" />
            <h3 className={style.populationHeadingH3}>Population</h3>
          </div>
          <div className={style.populationChartWrapper}>
            <div className={style.doughnut}>
              <DoghnutChart
                data={{
                  labels: chartLabels,
                  datasets: [
                    {
                      data: chartData[chartDataType] || [],
                      backgroundColor: ['#f1c40e', '#e77e23', '#e74d3c', '#3398db'],
                      borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
                      borderWidth: 1
                    }
                  ]
                }}
                cutoutPercentage={30}
                fontSize={10.5}
              />
            </div>
            <div className={style.populationChartSum}>
              <h3 className={style.populationChartSumH3}>Total:</h3>
              <p className={style.populationChartSumP}>{totals[chartDataType]?.toLocaleString()}</p>
            </div>
          </div>
          <ChartSwitch
            leftOption="Summary"
            middleOption="Male"
            rightOption="Female"
            onOptionChange={handleOptionChange}
          />
        </div>
      )}
      {targetAreaChart && (
        <>
          <StackedBarChart />
          <GaugeChart value={68790} minValue={60000} maxValue={180000} label="Visitation coverage" color="#FF5733" />
          <GaugeChart value={75000} minValue={0} maxValue={180000} label="Completion coverage" color="#4CAF50" />
        </>
      )}

      {!!(buildingsChart && structures && structures > 0) && (
          <div className={`${style.dashBoardSectionWrapper} ${style.structureWrapper}`}>
            <div className={style.structureText}>
              <FontAwesomeIcon className={style.structureIcon} icon="sitemap" />
              <h3 className={style.populationChartSumH3}>Structures</h3>
            </div>
            <p className={style.populationChartSumP}>{structures}</p>
          </div>
      )}
    </section>
  );
}

export default Dashboard;
