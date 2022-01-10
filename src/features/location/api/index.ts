import { GeographicLevel } from '../providers/types';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { GEOGRAPHIC_LEVEL } from '../../../constants';

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
  const data = await api
    .get<GeographicLevel>(GEOGRAPHIC_LEVEL + `/${id}`)
    .then(response => response.data);
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
  const data = await api
    .delete<GeographicLevel>(GEOGRAPHIC_LEVEL + `/${identifier}`)
    .then(response => response.data);
  return data;
};