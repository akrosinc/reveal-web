import style from './Dashboard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DoghnutChart } from '../../../location/components/doughnutChart/DoghnutChart';
import { faUsers, faSitemap, faHouseUser, faDiceD20 } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import House from '../../../../assets/svgs/house.svg';
import Sphere from '../../../../assets/svgs/sphere.svg';
import { useState } from 'react';
import { ChartSwitch } from './ChartSwitch/ChartSwitch';

library.add(faUsers, faSitemap, faHouseUser, faDiceD20);

interface DashboardProps {
  chartData: Record<string, number[]>;
}

function Dashboard({ chartData }: DashboardProps) {
  const [chartDataType, setChartDataType] = useState('summary');

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
      <div className={style.dashBoardSectionWrapper}>
        <div className={style.populationHeading}>
          <FontAwesomeIcon className={style.populationHeadingIcon} icon="users" />
          <h3 className={style.populationHeadingH3}>Population</h3>
        </div>
        <div className={style.populationChartWrapper}>
          <div className={style.populationChartSum}>
            <h3 className={style.populationChartSumH3}>Total</h3>
            <p className={style.populationChartSumP}>1,721</p>
          </div>
          <div className={style.doughnut}>
            <DoghnutChart
              data={{
                labels: ['0-4', '5-10', '11-18', '19-25'],
                datasets: [
                  {
                    data: chartData[chartDataType],
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
        </div>
        <ChartSwitch
          leftOption="Summary"
          middleOption="Male"
          rightOption="Female"
          onOptionChange={handleOptionChange}
        />
      </div>
      <div className={`${style.dashBoardSectionWrapper} ${style.structureWrapper}`}>
        <div className={style.structureText}>
          <FontAwesomeIcon className={style.structureIcon} icon="sitemap" />
          <h3 className={style.populationChartSumH3}>Structures</h3>
        </div>
        <p className={style.populationChartSumP}>79</p>
      </div>
      <div className={style.facilitiesStatisticWrapper}>
        <div className={`${style.dashBoardSectionWrapper} ${style.facilitiesWrapper}`}>
          <div className={style.facilitiesText}>
            <img src={House} className={style.houseIcon} alt="Facilities" />
            <h3 className={style.populationChartSumH3}>Facilities</h3>
          </div>
          <p className={style.populationChartSumP}>26</p>
        </div>
        <div className={`${style.dashBoardSectionWrapper} ${style.facilitiesWrapper}`}>
          <div className={style.facilitiesText}>
            {/* <FontAwesomeIcon className={style.structureIcon} icon={faDiceD20} /> */}
            <img src={Sphere} alt="Distribution" className={style.houseIcon} />
            <h3 className={style.populationChartSumH3}>Distribution</h3>
          </div>
          <p className={style.populationChartSumP}>31</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
