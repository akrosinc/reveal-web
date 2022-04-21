import api from '../../../api/axios';
import { REPORTS } from '../../../constants';

export const getReports = async (): Promise<string[]> => {
    const data = await api.get<string[]>(REPORTS).then(response => response.data);
    return data;
  };