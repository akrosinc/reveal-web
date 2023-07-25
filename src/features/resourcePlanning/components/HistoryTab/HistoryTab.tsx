import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageableModel } from '../../../../api/providers';
import Paginator from '../../../../components/Pagination';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { PAGINATION_DEFAULT_SIZE, RESOURCE_PLANNING_HISTORY_TABLE_COLUMNS } from '../../../../constants';
import { useAppDispatch } from '../../../../store/hooks';
import { getHierarchyById } from '../../../location/api';
import { setDashboard } from '../../../reducers/resourcePlanningConfig';
import { getResourceDashboard, getResourceHistory, getResourceHistoryById } from '../../api';
import { ResourcePlanningHistory } from '../../providers/types';

const HistoryTab = () => {
  const [historyList, setHistoryList] = useState<PageableModel<ResourcePlanningHistory>>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);

  useEffect(() => {
    if (tab === 'history') {
      getResourceHistory(PAGINATION_DEFAULT_SIZE, 0).then(res => setHistoryList(res));
    }
  }, [tab]);

  useEffect(() => {
    getResourceHistory(PAGINATION_DEFAULT_SIZE, 0, currentSortField, currentSortDirection).then(res =>
      setHistoryList(res)
    );
  }, [currentSortField, currentSortDirection]);

  const sortHandler = (sortValue: string, sortDirection: boolean) => {
    setCurrentSortField(sortValue);
    setCurrentSortDirection(sortDirection);
  };

  const paginationHandler = (page: number, size: number) => {
    getResourceHistory(page, size, currentSortField, currentSortDirection).then(res => setHistoryList(res));
  };

  const loadHistoryHandler = (id: string) => {
    getResourceHistoryById(id).then(res => {
      getHierarchyById(res.locationHierarchy.identifier).then(hierarchyList => {
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
      <h2>Planning History ({historyList?.totalElements})</h2>
      <hr />
      {historyList && historyList.content.length > 0 ? (
        <>
          <DefaultTable
            columns={RESOURCE_PLANNING_HISTORY_TABLE_COLUMNS}
            data={historyList.content}
            clickHandler={loadHistoryHandler}
            clickAccessor="identifier"
            sortHandler={sortHandler}
          />
          <Paginator
            page={historyList.pageable.pageNumber}
            size={historyList.pageable.pageSize}
            totalElements={historyList.totalElements}
            totalPages={historyList.totalPages}
            paginationHandler={paginationHandler}
          />
        </>
      ) : (
        <p>No data found.</p>
      )}
    </>
  );
};

export default HistoryTab;
