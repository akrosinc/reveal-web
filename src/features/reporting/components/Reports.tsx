import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../api/providers';
import Paginator from '../../../components/Pagination';
import DefaultTable from '../../../components/Table/DefaultTable';
import { PAGINATION_DEFAULT_SIZE, PLAN_TABLE_COLUMNS, REPORTING_PAGE } from '../../../constants';
import { PlanModel } from '../../plan/providers/types';
import { getPlanReports, getReportTypes } from '../api';
import { ReportType } from '../providers/types';

const Reports = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const navigate = useNavigate();
  const { state, pathname } = useLocation();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [reportTypes, setReportTypes] = useState<string[]>();
  const [selectedReportType, setSelectedReportType] = useState<string>();
  const { t } = useTranslation();

  const loadData = useCallback(
    (size: number, page: number, reportType?: string, sortDirection?: boolean, sortField?: string) => {
      getPlanReports(size, page, false, reportType, '', sortField, sortDirection)
        .then(plans => {
          setPlanList(plans);
        })
        .catch(err => toast.error(err));
    },
    []
  );

  const performanceDashboardChecker = () => {
    return pathname.includes('performanceReports');
  };

  useEffect(() => {
    if (pathname.includes('performanceReports')) {
      setSelectedReportType(undefined);
      loadData(PAGINATION_DEFAULT_SIZE, 0, undefined);
    } else {
      getReportTypes()
        .then(res => {
          setReportTypes(res);
          setSelectedReportType(state ? state.reportType : res.length ? res[0] : undefined);
          loadData(PAGINATION_DEFAULT_SIZE, 0, state ? state.reportType : res.length ? res[0] : undefined);
        })
        .catch(err => toast.error(err));
    }
  }, [loadData, state, pathname]);

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
      case ReportType.IRS_LITE_COVERAGE:
        return 'IRS Lite';
      case ReportType.IRS_LITE_COVERAGE_OPERATIONAL_AREA_LEVEL:
        return 'IRS Lite Operational Area';
      case ReportType.MDA_FULL_COVERAGE:
        return 'MDA';
      case ReportType.MDA_LITE_COVERAGE:
        return 'MDA Lite';
      case ReportType.MDA_FULL_COVERAGE_OPERATIONAL_AREA_LEVEL:
        return 'MDA Operational Area';
      default:
        return reportName;
    }
  };

  return (
    <>
      {!(performanceDashboardChecker()) && (
        <Row>
          <Col md={5} lg={3}>
            <Form className="mb-4">
              <Form.Label>{t('reportPage.reportType')}:</Form.Label>
              <Form.Select value={selectedReportType} onChange={reportTypeSelectHandler}>
                {reportTypes?.map(res => (
                  <option key={res} value={res}>
                    {setReportTypeNames(res)}
                  </option>
                ))}
              </Form.Select>
            </Form>
          </Col>
        </Row>
      )}
      {planList !== undefined && planList.content.length > 0 ? (
        <>
          <DefaultTable
            columns={PLAN_TABLE_COLUMNS}
            data={planList.content}
            sortHandler={sortHandler}
            clickHandler={(id: string) =>
              performanceDashboardChecker()
                ? navigate(REPORTING_PAGE + `/performanceReports/${id}`)
                : navigate(REPORTING_PAGE + `/report/${id}/reportType/${selectedReportType}`)
            }
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
        <p className="text-center lead">No active plans found for selected type.</p>
      )}
    </>
  );
};

export default Reports;
