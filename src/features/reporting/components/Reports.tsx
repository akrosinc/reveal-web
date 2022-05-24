import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Col, Form, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PageableModel } from '../../../api/providers';
import Paginator from '../../../components/Pagination';
import { PAGINATION_DEFAULT_SIZE, PLAN_TABLE_COLUMNS, REPORTING_PAGE } from '../../../constants';
import { useAppDispatch } from '../../../store/hooks';
import { PlanModel } from '../../plan/providers/types';
import { showLoader } from '../../reducers/loader';
import { getPlanReports, getReportTypes } from '../api';
import { ReportType } from '../providers/types';

const Reports = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  //const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [activeSortField, setActiveSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [reportTypes, setReportTypes] = useState<string[]>();
  const [selectedReportType, setSelectedReportType] = useState<string>();

  const loadData = useCallback(
    (size: number, page: number, reportType: string, search?: string, sortDirection?: boolean, sortField?: string) => {
      dispatch(showLoader(true));
      getPlanReports(size, page, reportType, false, search, sortField, sortDirection)
        .then(plans => {
          setPlanList(plans);
        })
        .finally(() => dispatch(showLoader(false)));
    },
    [dispatch]
  );

  useEffect(() => {
    getReportTypes().then(res => {
      setReportTypes(res);
      setSelectedReportType(res.length ? res[0] : undefined);
      loadData(PAGINATION_DEFAULT_SIZE, 0, res[0]);
    });
  }, [loadData]);

  const paginationHandler = (size: number, page: number) => {
    if (selectedReportType) {
      loadData(size, page, selectedReportType, '', currentSortDirection, currentSortField);
    }
  };

  const sortHandler = (sortValue: string, direction: boolean) => {
    setCurrentSortDirection(direction);
    setCurrentSortField(sortValue);
    if (selectedReportType) {
      loadData(PAGINATION_DEFAULT_SIZE, 0, selectedReportType, '', direction, sortValue);
    }
  };

  const reportTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedReportType(e.target.value);
    getPlanReports(PAGINATION_DEFAULT_SIZE, 0, e.target.value, false).then(res => setPlanList(res));
  };

  const setReportTypeNames = (reportName: string) => {
    switch (reportName) {
      case ReportType.IRS_FULL_COVERAGE:
        return 'IRS';
      case ReportType.MDA_FULL_COVERAGE:
        return 'MDA';
      case ReportType.MDA_FULL_COVERAGE_OPERATIONAL_AREA_LEVEL:
        return 'MDA Lite';
    }
  };

  return (
    <>
      <Row>
        <Col md={5} lg={3}>
          <Form className="mb-4">
            <Form.Label>Report Type:</Form.Label>
            <Form.Select onChange={reportTypeSelectHandler}>
              {reportTypes?.map(res => (
                <option key={res} value={res}>
                  {setReportTypeNames(res)}
                </option>
              ))}
            </Form.Select>
          </Form>
        </Col>
      </Row>
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
                    navigate(REPORTING_PAGE + `/${el.identifier}/${selectedReportType}`);
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
        <p className="text-center lead">No active plans found for selected report type.</p>
      )}
    </>
  );
};

export default Reports;
