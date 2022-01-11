import { GeographicLevel, LocationHierarchyModel } from '../providers/types';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { GEOGRAPHIC_LEVEL, LOCATION_HIERARCHY } from '../../../constants';

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
