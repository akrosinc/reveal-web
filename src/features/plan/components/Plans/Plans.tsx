import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Row, Col } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import Paginator from '../../../../components/Pagination';
import { PAGINATION_DEFAULT_SIZE, PLANS, PLAN_TABLE_COLUMNS } from '../../../../constants';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import { getPlanList } from '../../api';
import { PlanModel } from '../../providers/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActivatePlan from './activate';

const Plans = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [activeSortField, setActiveSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState('');

  const loadData = useCallback(
    (size: number, page: number, search?: string, sortDirection?: boolean, sortField?: string) => {
      dispatch(showLoader(true));
      getPlanList(size, page, false, search, sortField, sortDirection)
        .then(res => {
          setPlanList(res);
        })
        .catch(err => toast.error(err.message !== undefined ? err.message : err.toString()))
        .finally(() => dispatch(showLoader(false)));
    },
    [dispatch]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const filterData = (e: any) => {
    setCurrentSearchInput(e.target.value);
    loadData(planList?.size ?? PAGINATION_DEFAULT_SIZE, 0, e.target.value, currentSortDirection, currentSortField);
  };

  const sortHandler = (field: string, sortDirection: boolean) => {
    if (planList !== undefined) {
      loadData(planList.size, 0, currentSearchInput, sortDirection, field);
    }
  };

  const closeHandler = () => {
    setShowActivate(false);
  };

  return (
    <>
      <h2>
        Plans ({planList?.totalElements ?? 0})
        <Row className="my-4">
          <Col md={8} className="mb-2">
            <Link id="create-button" to={PLANS + '/create'} className="btn btn-primary float-end">
              Create
            </Link>
          </Col>
          <Col sm={12} md={4} className="order-md-first">
            <DebounceInput
              id="search-plans-input"
              className="form-control"
              placeholder="Search (minimum 3 charaters)"
              debounceTimeout={800}
              onChange={e => filterData(e)}
              disabled={planList?.totalElements === 0 && currentSearchInput === ''}
            />
          </Col>
        </Row>
      </h2>
      <hr className="mb-4" />
      {planList !== undefined && planList.content.length > 0 ? (
        <>
          <Table bordered responsive hover>
            <thead className="border border-2">
              <tr>
                {PLAN_TABLE_COLUMNS.map(el => (
                  <th
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
                  key={el.identifier}
                  onClick={() => {
                    navigate(PLANS + '/' + el.identifier);
                  }}
                >
                  <td>{el.title}</td>
                  <td>{el.status}</td>
                  <td>{el.interventionType.name}</td>
                  <td>{el.locationHierarchy.name}</td>
                  <td>{el.effectivePeriod.start}</td>
                  <td>{el.effectivePeriod.end}</td>
                  <td className="text-center">
                    <Button
                      onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.stopPropagation();
                        setCurrentPlanId(el.identifier);
                        setShowActivate(true);
                      }}
                      disabled={el.status !== 'DRAFT'}
                    >
                      {el.status === 'DRAFT' ? 'Activate' : 'Active'}
                    </Button>
                  </td>
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
        <p className="text-center lead">No plans found.</p>
      )}
      <ActivatePlan show={showActivate} closeHandler={closeHandler} planId={currentPlanId} />
    </>
  );
};

export default Plans;
