import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { getOrganizationCount, getOrganizationList } from '../organization/api';
import { getUserList } from '../user/api';
import { getPlanCount, getPlanList } from '../plan/api';
import { useAppDispatch } from '../../store/hooks';
import { toast } from 'react-toastify';
import AuthorizedElement from '../../components/AuthorizedElement';
import { PLAN_VIEW, USER_VIEW } from '../../constants';
import { ChartData } from 'chart.js/auto';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import { getPlanReports } from '../reporting/api';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState<ChartData<'pie'>>();
  const [dougData, setDougData] = useState<ChartData<'doughnut'>>();
  const dispatch = useAppDispatch();
  const [numbers, setNumber] = useState<{ title: string; count: number }[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      getOrganizationCount(),
      getUserList(5, 0),
      getPlanCount(),
      getOrganizationList(50, 0),
      getPlanList(50, 0, true),
      getPlanReports(5, 0, true)
    ])
      .then(async ([organizationCount, userCount, planCount, orgList, planList, reportList]) => {
        setNumber([
          { title: t('homePage.users'), count: userCount.totalElements },
          { title: t('homePage.organizations'), count: organizationCount.count },
          { title: t('homePage.plans'), count: planCount.count },
          { title: t('homePage.reports'), count: reportList.totalElements }
        ]);
        if (userCount.totalElements > 0 || organizationCount.count > 0 || planCount.count > 0) {
          setData({
            labels: [t('homePage.users'), t('homePage.organizations'), t('homePage.plans')],
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
        let activePlansCount = planList.content.filter(el => el.status === 'ACTIVE').length;
        let activeOrganizationsCount = orgList.content.filter(el => el.active).length;
        if (activePlansCount > 0 || activeOrganizationsCount > 0) {
          setDougData({
            labels: [t('homePage.activePlans'), t('homePage.activeOrganizations')],
            datasets: [
              {
                label: '# of active',
                data: [activePlansCount, activeOrganizationsCount],
                backgroundColor: ['#198754', '#34568B']
              }
            ]
          });
        }
      })
      .catch(err => toast.error(err));
  }, [t, dispatch]);

  return (
    <AuthorizedElement roles={[PLAN_VIEW, USER_VIEW, 'manage-users']}>
      <>
        <Row className="mb-5 justify-content-center">
          {numbers.map((el, index) => (
            <Col md={3} xl={2} key={index}>
              <div className="p-4 my-2 border border-1 rounded">
                <h4>{el.title}</h4>
                <h4>{el.count}</h4>
              </div>
            </Col>
          ))}
        </Row>
        <Row style={{ minHeight: '500px' }} className="justify-content-center align-items-center">
          <Col md={6} xl={4} style={{ height: '400px' }}>
            {data !== undefined && data.datasets[0].data.length ? (
              <Pie
                data={data}
                options={{
                  maintainAspectRatio: false
                }}
              />
            ) : (
              <p className="lead mt-5">No data to display.</p>
            )}
          </Col>
          <Col md={6} xl={4} style={{ height: '450px' }} className="mt-4 mt-md-0">
            {dougData !== undefined && dougData.datasets[0].data.length ? (
              <Doughnut
                data={dougData}
                options={{
                  maintainAspectRatio: false,
                  circumference: 180,
                  rotation: -90
                }}
              />
            ) : (
              <p className="lead mt-5">No data to display.</p>
            )}
          </Col>
        </Row>
      </>
    </AuthorizedElement>
  );
};

export default Dashboard;
