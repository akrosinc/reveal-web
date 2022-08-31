import { FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import dashboardApi from '../../../api/dashboard-axios';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { PLAN, REPORTS } from '../../../constants';
import { PlanModel } from '../../plan/providers/types';
import {
  AdditionalReportInfo,
  MapDataReportRequest,
  PerformanceDashboardModel,
  ReportLocationProperties
} from '../providers/types';

export const getReportTypes = async (): Promise<string[]> => {
  const data = await dashboardApi.get<string[]>(REPORTS + '/reportTypes').then(response => response.data);
  return data;
};

export const getReportTypeInfo = async (reportType: string): Promise<AdditionalReportInfo> => {
  const data = await dashboardApi
    .get<AdditionalReportInfo>(REPORTS + `/reportAdditionalInfo?reportType=${reportType}`)
    .then(response => response.data);
  return data;
};

export const getMapReportData = async (
  mapData: MapDataReportRequest,
  filters?: string[]
): Promise<FeatureCollection<Polygon | MultiPolygon, ReportLocationProperties>> => {
  const data = await dashboardApi
    .get<any>(
      REPORTS +
        `/reportData?reportType=${mapData.reportTypeEnum}&planIdentifier=${mapData.planIdentifier}${
          mapData.parentLocationIdentifier !== null ? '&parentIdentifier=' + mapData.parentLocationIdentifier : ''
        }${filters && filters.length ? '&filters=' + filters : ''}`
    )
    .then(response => response.data);
  return data;
};

export const getPlanReports = async (
  size: number,
  page: number,
  summary: boolean,
  reportType?: string,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<PlanModel>> => {
  const data = await api
    .get(
      PLAN +
        `/reports?reportType=${reportType ?? ''}&_summary=${summary}&search=${
          search !== undefined ? search : ''
        }&size=${size}&page=${page}&sort=${sortField !== undefined ? sortField : ''},${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getPerformanceDashboard = async (planId: string, key?: string): Promise<PerformanceDashboardModel[]> => {
  const data = await dashboardApi
    .get<PerformanceDashboardModel[]>(REPORTS + `/performance-data?planIdentifier=${planId}&key=${key ?? null}`)
    .then(response => response.data);
  return data;
};

export const getPerformanceDashboardDataDetails = async (
  planId: string,
  key?: string
): Promise<PerformanceDashboardModel[]> => {
  const data = await dashboardApi
    .get<PerformanceDashboardModel[]>(
      REPORTS + `/detailed-performance-data?planIdentifier=${planId}&key=${key ?? null}`
    )
    .then(response => response.data);
  return data;
};
