import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../api/providers';
import Paginator from '../../../components/Pagination';
import DefaultTable from '../../../components/Table/DefaultTable';
import {
  PAGINATION_DEFAULT_SIZE,
  PLAN_TABLE_COLUMNS,
  REPORTING_PAGE,
  UNEXPECTED_ERROR_STRING
} from '../../../constants';
import { useAppDispatch } from '../../../store/hooks';
import { PlanModel } from '../../plan/providers/types';
import { showLoader } from '../../reducers/loader';
import { getPlanReports, getReportTypes } from '../api';
import { ReportType } from '../providers/types';

const Reports = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [reportTypes, setReportTypes] = useState<string[]>();
  const [selectedReportType, setSelectedReportType] = useState<string>();
  const { t } = useTranslation();

  const loadData = useCallback(
    (size: number, page: number, reportType: string, sortDirection?: boolean, sortField?: string) => {
      dispatch(showLoader(true));
      getPlanReports(size, page, reportType, false, '', sortField, sortDirection)
        .then(plans => {
          setPlanList(plans);
        })
        .catch(err => toast.error(err.message ? err.message : UNEXPECTED_ERROR_STRING))
        .finally(() => dispatch(showLoader(false)));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(showLoader(true));
    getReportTypes()
      .then(res => {
        setReportTypes(res);
        setSelectedReportType(res.length ? res[0] : undefined);
        loadData(PAGINATION_DEFAULT_SIZE, 0, res[0]);
      })
      .catch(err => {
        dispatch(showLoader(false));
        toast.error(err.message ? err.message : UNEXPECTED_ERROR_STRING);
      });
  }, [loadData, dispatch]);

  const paginationHandler = (size: number, page: number) => {
    if (selectedReportType) {
      loadData(size, page, selectedReportType, currentSortDirection, currentSortField);
    }
  };

  const sortHandler = (sortValue: string, direction: boolean) => {
    setCurrentSortDirection(direction);
    setCurrentSortField(sortValue);
    if (selectedReportType) {
      loadData(PAGINATION_DEFAULT_SIZE, 0, selectedReportType, direction, sortValue);
    }
  };

  const reportTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedReportType(e.target.value);
    loadData(PAGINATION_DEFAULT_SIZE, 0, e.target.value);
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
            <Form.Label>{t('reportPage.reportType')}:</Form.Label>
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
          <DefaultTable
            columns={PLAN_TABLE_COLUMNS}
            data={planList.content}
            sortHandler={sortHandler}
            clickHandler={(id: string) => navigate(REPORTING_PAGE + `/planId/${id}/reportType/${selectedReportType}`)}
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
        <p className="text-center lead">No active plans found for selected report type.</p>
      )}
    </>
  );
};

export default Reports;
