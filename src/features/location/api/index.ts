import { GeographicLevel, LocationBulkModel, LocationHierarchyModel, LocationModel, LocationBulkDetailsModel } from '../providers/types';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { GEOGRAPHIC_LEVEL, LOCATION, LOCATION_HIERARCHY } from '../../../constants';

export const getGeographicLevelList = async (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<GeographicLevel>> => {
  const data = await api
    .get<PageableModel<GeographicLevel>>(
      GEOGRAPHIC_LEVEL +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getGeographicLevelById = async (id: string): Promise<GeographicLevel> => {
  const data = await api.get<GeographicLevel>(GEOGRAPHIC_LEVEL + `/${id}`).then(response => response.data);
  return data;
};

export const createGeographicLevel = async (formData: { name: string; title: string }): Promise<GeographicLevel> => {
  const data = await api.post<GeographicLevel>(GEOGRAPHIC_LEVEL, formData).then(response => response.data);
  return data;
};

export const updateGeographicLevel = async (formData: GeographicLevel): Promise<GeographicLevel> => {
  const data = await api
    .put<GeographicLevel>(GEOGRAPHIC_LEVEL + `/${formData.identifier}`, formData)
    .then(response => response.data);
  return data;
};

export const deleteGeographicLevel = async (identifier: string): Promise<GeographicLevel> => {
  const data = await api.delete<GeographicLevel>(GEOGRAPHIC_LEVEL + `/${identifier}`).then(response => response.data);
  return data;
};

export const getLocationHierarchyList = async (
  size: number,
  page: number,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<LocationHierarchyModel>> => {
  const data = await api
    .get<PageableModel<LocationHierarchyModel>>(
      LOCATION_HIERARCHY +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}&_summary=${summary.toString()}`
    )
    .then(response => response.data);
  return data;
};

export const createLocationHierarchy = async (formData: { nodeOrder: string[] }): Promise<LocationHierarchyModel> => {
  const data = await api.post<LocationHierarchyModel>(LOCATION_HIERARCHY, formData).then(response => response.data);
  return data;
};

export const deleteLocationHierarchy = async (identifier: string): Promise<string> => {
  const data = await api.delete<string>(LOCATION_HIERARCHY + `/${identifier}`).then(response => response.data);
  return data;
};

export const getLocationList = async (
  size: number,
  page: number,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<LocationModel>> => {
  const data = await api
    .get<PageableModel<LocationModel>>(
      LOCATION +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}&_summary=${summary.toString()}`
    )
    .then(response => response.data);
  return data;
};

export const getLocationListByHierarchyId = async (
  size: number,
  page: number,
  identifier: string,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<LocationModel>> => {
  const data = await api
    .get<PageableModel<LocationModel>>(
      LOCATION_HIERARCHY +
        `/${identifier}/location?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}&_summary=${summary.toString()}`
    )
    .then(response => response.data);
  return data;
};

export const getLocationById = async (id: string): Promise<LocationModel> => {
  const data = await api.get<LocationModel>(LOCATION + `/${id}`).then(response => response.data);
  return data;
};

export const getLocationByIdAndPlanId = async (id: string, planId: string): Promise<LocationModel> => {
  const data = await api.get<LocationModel>(LOCATION + `/${id}/${planId}`).then(response => response.data);
  return data;
};

export const getLocationBulkList = async (
  size: number,
  page: number,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<LocationBulkModel>> => {
  const data = await api
    .get<PageableModel<LocationBulkModel>>(
      LOCATION +
        `/bulk?size=${size}&page=${page}&sort=${sortField !== undefined ? sortField : ''},${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getLocationBulkListById = async (
  size: number,
  page: number,
  id: string,
  search?: string
): Promise<PageableModel<LocationBulkDetailsModel>> => {
  const data = await api
    .get<PageableModel<LocationBulkDetailsModel>>(LOCATION + `/bulk/${id}?size=${size}&page=${page}`)
    .then(response => response.data);
  return data;
};

export const uploadLocationJSON = async (json: FormData): Promise<{ identifier: string }> => {
  const data = await api.post<{ identifier: string }>(LOCATION + '/bulk', json).then(response => response.data);
  return data;
};
