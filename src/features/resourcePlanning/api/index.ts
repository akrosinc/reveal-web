import api from '../../../api/axios';
import { ResourceCountry } from '../providers/types';

export const getPopulationCount = async (): Promise<any> => {
  const data = await api.get<Promise<any>>('').then(res => res.data);
  return data;
};

export const getCountryResource = async (): Promise<ResourceCountry[]> => {
  const data = await api.get<Promise<ResourceCountry[]>>('resource-planning').then(res => res.data);
  return data;
};