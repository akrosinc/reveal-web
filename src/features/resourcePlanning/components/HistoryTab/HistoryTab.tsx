import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { RESOURCE_PLANNING_HISTORY_TABLE_COLUMNS } from '../../../../constants';
import { useAppDispatch } from '../../../../store/hooks';
import { getHierarchyById } from '../../../location/api';
import { setDashboard } from '../../../reducers/resourcePlanningConfig';
import { getResourceDashboard, getResourceHistory, getResourceHistoryById } from '../../api';
import { ResourcePlanningHistory } from '../../providers/types';

const HistoryTab = () => {
  const [historyList, setHistoryList] = useState<ResourcePlanningHistory[]>([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tab } = useParams();

  useEffect(() => {
    if (tab === 'history') {
      getResourceHistory().then(res => setHistoryList(res.content));
    }
  }, [tab]);

  useEffect(() => {
    getResourceHistory().then(res => setHistoryList(res.content));
  }, []);

  const loadHistoryHandler = (id: string) => {
    getResourceHistoryById(id).then(res => {
      getHierarchyById(res.locationHierarchy).then(hierarchyList => {
        const allowedPath: string[] = [];
        hierarchyList.nodeOrder.some(el => {
          if (el === res.lowestGeography) {
            allowedPath.push(el);
            return true;
          } else {
            allowedPath.push(el);
          }
          return false;
        });
        res.lowestGeography = hierarchyList.nodeOrder.length ? hierarchyList.nodeOrder[0] : res.lowestGeography;
        getResourceDashboard(res).then(dashboardData => {
          dispatch(
            setDashboard({
              response: dashboardData,
              request: res,
              path: allowedPath
            })
          );
          navigate('dashboard');
        });
      });
    });
  };

  return (
    <>
      <h2>Planning History ({historyList.length})</h2>
      <hr />
      {historyList.length > 0 ? (
        <DefaultTable
          columns={RESOURCE_PLANNING_HISTORY_TABLE_COLUMNS}
          data={historyList}
          clickHandler={loadHistoryHandler}
          clickAccessor="identifier"
        />
      ) : (
        <p>No data found.</p>
      )}
    </>
  );
};

export default HistoryTab;
