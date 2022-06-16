import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import Paginator from '../../../../components/Pagination';
import { ASSIGNMENT_PAGE, PAGINATION_DEFAULT_SIZE, PLAN_TABLE_COLUMNS } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { getPlanList } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';

const PlanList = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const navigate = useNavigate();
  const [currentSortField, setCurrentSortField] = useState('');
  const [activeSortField, setActiveSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

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
        .then(res => setPlanList(res)).catch(err => toast.error(err));
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
          <Table bordered responsive hover variant={isDarkMode ? 'dark' : 'white'}>
            <thead className="border border-2">
              <tr>
                {PLAN_TABLE_COLUMNS.map(el => (
                  <th
                    id={el.name + '-sort'}
                    key={el.name}
                    onClick={() => {
                      setActiveSortField(el.name);
                      setCurrentSortField(el.sortValue);
                      setCurrentSortDirection(!currentSortDirection);
                      sortHandler(el.sortValue, !currentSortDirection);
                    }}
                  >
                    {el.name}{' '}
                    {activeSortField === el.name ? (
                      currentSortDirection ? (
                        <FontAwesomeIcon icon="sort-down" />
                      ) : (
                        <FontAwesomeIcon icon="sort-up" />
                      )
                    ) : (
                      <FontAwesomeIcon icon="sort" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planList.content.map(el => (
                <tr
                  id={el.identifier + 'table-row-button'}
                  key={el.identifier}
                  onClick={() => {
                    navigate(ASSIGNMENT_PAGE + '/planId/' + el.identifier);
                  }}
                >
                  <td>{el.title}</td>
                  <td>{el.status}</td>
                  <td>{el.interventionType.name}</td>
                  <td>{el.locationHierarchy.name}</td>
                  <td>{el.effectivePeriod.start}</td>
                  <td>{el.effectivePeriod.end}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginator
            page={planList.pageable.pageNumber}
            paginationHandler={paginationHandler}
            size={planList.size}
            totalElements={planList.totalElements}
            totalPages={planList.totalPages}
          />
        </>
      ) : (
        <p>{t("general.noContent")}</p>
      )}
    </>
  );
};

export default PlanList;
