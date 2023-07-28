import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import PageWrapper from '../../components/PageWrapper';
import { PLAN_VIEW, RESOURCE_PLANNING_PAGE } from '../../constants';
import ConfigTab from '../../features/resourcePlanning/components/ConfigTab';
import DashboardTab from '../../features/resourcePlanning/components/DashboardTab/DashboardTab';
import HistoryTab from '../../features/resourcePlanning/components/HistoryTab';
import InputsTab from '../../features/resourcePlanning/components/InputsTab';
import { RootState } from '../../store/store';

const ResourcePlanning = () => {
  let { tab } = useParams();
  let navigate = useNavigate();
  const configValue = useSelector((state: RootState) => state.resourceConfig.value);
  const dashboardValue = useSelector((state: RootState) => state.resourceConfig.dashboardData);
  const [activeKey, setActiveKey] = useState('config');

  useEffect(() => {
    if (tab === undefined) {
      navigate(RESOURCE_PLANNING_PAGE + '/config');
    } else if (tab === 'inputs' || tab === 'dashboard' || tab === 'config' || tab === 'history') {
      if (configValue || dashboardValue) {
        setActiveKey(tab);
      } else {
        if (tab === 'config' || tab === 'history') {
          setActiveKey(tab);
        }
      }
    } else {
      navigate('/error');
    }
  }, [tab, navigate, configValue, dashboardValue]);

  return (
    <PageWrapper title="Resource Planning">
      <Tabs
        mountOnEnter
        id="resource-planning-tabs"
        className="mb-3"
        activeKey={activeKey}
        onSelect={tabName => {
          setActiveKey(tabName ?? '');
        }}
      >
        <Tab eventKey="config" title="Config">
          <AuthGuard roles={[PLAN_VIEW]}>
            <ConfigTab />
          </AuthGuard>
        </Tab>
        <Tab eventKey="inputs" title="Inputs">
          <AuthGuard roles={[PLAN_VIEW]}>
            <InputsTab />
          </AuthGuard>
        </Tab>
        <Tab eventKey="dashboard" title="Dashboard">
          <AuthGuard roles={[PLAN_VIEW]}>
            <DashboardTab />
          </AuthGuard>
        </Tab>
        <Tab eventKey="history" title="History" unmountOnExit={true}>
          <AuthGuard roles={[PLAN_VIEW]}>
            <HistoryTab />
          </AuthGuard>
        </Tab>
      </Tabs>
    </PageWrapper>
  );
};

export default ResourcePlanning;
