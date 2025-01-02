import api from '../../../api/axios';
import { DataExtractQueryResponse } from '../providers/types';

export const getDataExtract = async (planIdentifier: string, queryLabel: string): Promise<File> => {
  return await api.get<File>('data-extract/extract/' + planIdentifier + '/' + queryLabel).then(res => res.data);
};

export const getQueryLabels = async (planIdentifier: string): Promise<DataExtractQueryResponse[]> => {
  return await api.get<DataExtractQueryResponse[]>('data-extract/queryLabels/' + planIdentifier).then(res => res.data);
};
