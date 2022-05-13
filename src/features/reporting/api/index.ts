import api from '../../../api/axios';
import { REPORTS } from '../../../constants';
import { ReportResponse, ReportType, TableReportRequest } from '../providers/types';

export const getReportByPlanId = async (tableReportRequest: TableReportRequest): Promise<ReportResponse> => {
  const data = await api
    .get<ReportResponse>(
      `${REPORTS}/row?planIdentifier=${tableReportRequest.planIdentifier}&reportTypeEnum=${
        tableReportRequest.reportTypeEnum
      }${
        tableReportRequest.parentLocationIdentifier !== null
          ? '&parentLocationIdentifier=' + tableReportRequest.parentLocationIdentifier
          : ''
      }&getChildren=${tableReportRequest.getChildren}`
    )
    .then(response => response.data);
  return data;
};

export const getReportTypes = async (): Promise<ReportType[]> => {
  const data = await api.get(REPORTS + '/reportTypes').then(response => response.data);
  return data;
};
