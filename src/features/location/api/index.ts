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

export const createGeographicLevel = async (formData: { name: string; title: string }): Promise<GeographicLevel> => {
  const data = await api.post<GeographicLevel>(GEOGRAPHIC_LEVEL, formData).then(response => response.data);
  return data;
};
