import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import Paginator from '../../../../components/Pagination';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { ASSIGNMENT_PAGE, PAGINATION_DEFAULT_SIZE, PLAN_TABLE_COLUMNS } from '../../../../constants';
import { getPlanList } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';

const PlanList = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
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

  const loadData = useCallback(
    (size: number, page: number) => {
      getPlanList(size, page, true, '', currentSortField, currentSortDirection)
        .then(res => setPlanList(res))
        .catch(err => toast.error(err));
    },
    [currentSortDirection, currentSortField]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  return (
    <>
      {planList !== undefined && planList.content.length ? (
        <>
          <DefaultTable
            columns={PLAN_TABLE_COLUMNS}
            data={planList.content}
            sortHandler={sortHandler}
            clickHandler={(id: string) => navigate(ASSIGNMENT_PAGE + '/planId/' + id)}
            clickAccessor="identifier"
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
