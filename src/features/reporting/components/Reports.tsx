import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Col, Form, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PageableModel } from '../../../api/providers';
import Paginator from '../../../components/Pagination';
import { PAGINATION_DEFAULT_SIZE, PLAN_TABLE_COLUMNS, REPORTING_PAGE } from '../../../constants';
import { useAppDispatch } from '../../../store/hooks';
import { getPlanList } from '../../plan/api';
import { PlanModel } from '../../plan/providers/types';
import { showLoader } from '../../reducers/loader';
import { getReportTypes } from '../api';
import { ReportType } from '../providers/types';

const Reports = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  //const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [activeSortField, setActiveSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [reportTypes, setReportTypes] = useState<ReportType[]>();
  const [selectedReportType, setSelectedReportType] = useState<ReportType>();

  const loadData = useCallback(
    (size: number, page: number, search?: string, sortDirection?: boolean, sortField?: string) => {
      dispatch(showLoader(true));
      getReportTypes().then(res => {
        setReportTypes(res);
        setSelectedReportType(res.length ? res[0] : undefined);
      });
      getPlanList(size, page, false, search, sortField, sortDirection)
        .then(res => {
          setPlanList(res);
        })
        .finally(() => dispatch(showLoader(false)));
    },
    [dispatch]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData, currentSortField]);

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page, currentSortField);
  };

  const sortHandler = (sortValue: string, direction: boolean) => {
    setCurrentSortDirection(direction);
    setCurrentSortField(sortValue);
  };

  const reportTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as ReportType;
    setSelectedReportType(selected);
  };

  return planList !== undefined && planList.content.length > 0 ? (
    <>
      <Row>
        <Col md={5} lg={3}>
          <Form className="mb-4">
            <Form.Label>Report Type:</Form.Label>
            <Form.Select onChange={reportTypeSelectHandler}>
              {reportTypes?.map(res => (
                <option key={res} value={res}>{res}</option>
              ))}
            </Form.Select>
          </Form>
        </Col>
      </Row>
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
                navigate(REPORTING_PAGE + '/' + el.identifier, {state: {
                  reportType: selectedReportType
                }});
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
    <p className="text-center lead">No plans found.</p>
  );
};

export default Reports;
