import React, { useEffect, useState } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Col, Row } from 'react-bootstrap';
import { getOrganizationCount, getOrganizationList } from '../organization/api';
import { getUserList } from '../user/api';
import { getPlanCount, getPlanList } from '../plan/api';
import { useAppDispatch } from '../../store/hooks';
import { showLoader } from '../reducers/loader';
Chart.register(...registerables);

const Dashboard = () => {
  const [data, setData] = useState<any>();
  const [dougData, setDougData] = useState<any>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(showLoader(true));
    Promise.all([getOrganizationCount(), getUserList(5, 0), getPlanCount(), getOrganizationList(50, 0), getPlanList(50, 0, true)]).then(
      async ([organizationCount, userCount, planCount, orgList, planList]) => {
        if (userCount.totalElements !== 0 || organizationCount.count !== 0 || planCount.count !== 0) {
          setData({
            labels: ['Users', 'Organizations', 'Plans'],
            datasets: [
              {
                label: 'Count',
                data: [userCount.totalElements, organizationCount.count, planCount.count],
                backgroundColor: ['#198754', '#34568B', 'rgb(255, 205, 86)'],
                hoverOffset: 4
              }
            ]
          });
        }
        setDougData({
          labels: ['Active Plans', 'Active Organizations'],
          datasets: [
            {
              label: '# of active',
              data: [planList.content.filter(el => el.status === 'ACTIVE').length, orgList.content.filter(el => el.active).length],
              backgroundColor: ['#198754', '#34568B']
            }
          ]
        });
      }
    ).catch(err => console.log(err)).finally(() => dispatch(showLoader(false)));
  }, [dispatch]);

  return (
    <>
      <h4 className="my-4">Dashboard</h4>
      <Row>
        <Col md={6}>
          {data !== undefined && data.datasets[0].data.length ? (
            <Pie
              data={data}
              height="450px"
              width="450px"
              options={{
                maintainAspectRatio: false
              }}
            />
          ) : <p className='lead mt-5'>No data to display.</p>}
        </Col>
        <Col md={6}>
          {dougData !== undefined && dougData.datasets[0].data.length && (
            <Doughnut
              data={dougData}
              height="450px"
              width="450px"
              options={{
                maintainAspectRatio: false,
                rotation: 270,
                circumference: 180,
                cutout: 120
              }}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
