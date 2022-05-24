import { FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { PLAN, REPORTS } from '../../../constants';
import { LocationProperties } from '../../../utils';
import { PlanModel } from '../../plan/providers/types';
import { MapDataReportRequest, ReportResponse, TableReportRequest } from '../providers/types';

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

export const getReportTypes = async (): Promise<string[]> => {
  const data = await api.get<string[]>(REPORTS + '/reportTypes').then(response => response.data);
  return data;
};

export const getMapReportData = async (mapData: MapDataReportRequest): Promise<FeatureCollection<Polygon | MultiPolygon, LocationProperties>> => {
  const data = await api
    .get<any>(
      REPORTS +
        `/reportData?reportType=${mapData.reportTypeEnum}&planIdentifier=${mapData.planIdentifier}${
          mapData.parentLocationIdentifier !== null ? '&parentIdentifier=' + mapData.parentLocationIdentifier : ''
        }`
    )
    .then(response => response.data);
  return data;
};

export const getPlanReports = async (
  size: number,
  page: number,
  reportType: string,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<PlanModel>> => {
  const data = await api
    .get(
      PLAN +
        `/reports?reportType=${reportType}&_summary=${summary}&search=${
          search !== undefined ? search : ''
        }&size=${size}&page=${page}&sort=${sortField !== undefined ? sortField : ''},${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};
