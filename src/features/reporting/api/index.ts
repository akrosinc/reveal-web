import { FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { PLAN, REPORTS } from '../../../constants';
import { PlanModel } from '../../plan/providers/types';
import { MapDataReportRequest, ReportLocationProperties } from '../providers/types';

export const getReportTypes = async (): Promise<string[]> => {
  const data = await api.get<string[]>(REPORTS + '/reportTypes').then(response => response.data);
  return data;
};

export const getMapReportData = async (mapData: MapDataReportRequest): Promise<FeatureCollection<Polygon | MultiPolygon, ReportLocationProperties>> => {
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
