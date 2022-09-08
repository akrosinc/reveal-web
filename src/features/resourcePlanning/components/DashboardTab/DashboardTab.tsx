import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DashboardTab = () => {
  const location = useLocation();

  const { dashboardData } = location.state;

  useEffect(() => {
    console.log(dashboardData);
  }, [dashboardData]);

  return <div>Dashboard</div>;
};

export default DashboardTab;
