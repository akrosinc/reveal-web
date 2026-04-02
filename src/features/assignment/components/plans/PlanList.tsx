import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Paginator from '../../../../components/Pagination';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { ASSIGNMENT_PAGE, INSTANCE_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE, PLAN_ASSIGNMENT_INSTANCE_SELECTION, REDIRECT_TO_ASSIGNED_INSTANCE } from '../../../../constants';
import { getInstances } from '../../../planSimulation/api';
import { Instance, PaginatedResponse } from '../../../planSimulation/providers/types';
import { useAppSelector } from '../../../../store/hooks';
import { useAuthorization } from '../../../../hooks/useAuthorization';

const PlanList = () => {
  const isAuthorized = useAuthorization([PLAN_ASSIGNMENT_INSTANCE_SELECTION])
  const isAuthorizedForRedirectToAssignedInstance = useAuthorization([REDIRECT_TO_ASSIGNED_INSTANCE])
  const ctx = useAppSelector(state => state.instanceContext)
  // console.log(ctx?.instancePlan?.identifier, 'Selected instance')
  const [planList, setPlanList] = useState<PaginatedResponse<Instance>>();
  const navigate = useNavigate();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const { t } = useTranslation();

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const sortHandler = (sortValue: string, direction: boolean) => {
    setCurrentSortDirection(direction);
    setCurrentSortField(sortValue);
  };

  const sortedData = useMemo(() => {
    if (!planList?.content) return [];
    if (!currentSortField) return planList.content;

    return [...planList.content].sort((a: any, b: any) => {
      const aVal = a[currentSortField] || '';
      const bVal = b[currentSortField] || '';

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return currentSortDirection ? comparison : -comparison;
    });
  }, [planList, currentSortField, currentSortDirection]);

  const loadData = useCallback(
    (size: number, page: number) => {
      getInstances(page, size)
        .then(res => {

          if (isAuthorizedForRedirectToAssignedInstance && ctx?.instancePlan?.identifier) {
            navigate(ASSIGNMENT_PAGE + '/planId/' + ctx.instancePlan.identifier, { state: { hideBackButton: true } });
          } else {
            setPlanList(res);
          }
        })
        .catch(err => toast.error(err));
    },
    [ctx?.instancePlan?.identifier, navigate]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  return (
    <>
      {!isAuthorized && planList !== undefined && planList.content.length ? (
        <>
          <DefaultTable
            pageKey="instancesPage.table."
            columns={INSTANCE_TABLE_COLUMNS}
            data={sortedData}
            sortHandler={sortHandler}
            clickHandler={(id: string) => navigate(ASSIGNMENT_PAGE + '/planId/' + id)}
            clickAccessor="planIdentifier"
          />
          <Paginator
            page={planList.pageable.pageNumber}
            paginationHandler={paginationHandler}
            size={planList.size}
            totalElements={planList.totalElements}
            totalPages={planList.totalPages}
          />
        </>
      ) : (
        <p>{t('general.noContent')}</p>
      )}
    </>
  );
};

export default PlanList;
