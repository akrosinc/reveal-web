import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PageableModel } from '../../../../api/providers';
import Paginator from '../../../../components/Pagination';
import { ASSIGNMENT_PAGE, PLAN_TABLE_COLUMNS } from '../../../../constants';
import { useAppDispatch } from '../../../../store/hooks';
import { getPlanList } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { showLoader } from '../../../reducers/loader';

const PlanList = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const navigate = useNavigate();
  const [currentSortField, setCurrentSortField] = useState('');
  const [activeSortField, setActiveSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const dispatch = useAppDispatch();

  const paginationHandler = () => {};

  const sortHandler = (sortValue: string, direction: boolean) => {};

  useEffect(() => {
    dispatch(showLoader(true));
    getPlanList(10, 0, true, '', currentSortField, currentSortDirection)
      .then(res => setPlanList(res))
      .finally(() => dispatch(showLoader(false)));
  }, [currentSortDirection, currentSortField, dispatch]);

  return (
    <>
      {planList !== undefined && planList.content.length ? (
        <>
          <Table bordered responsive hover>
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
                    navigate(ASSIGNMENT_PAGE + '/' + el.identifier);
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
        <p>No content.</p>
      )}
    </>
  );
};

export default PlanList;