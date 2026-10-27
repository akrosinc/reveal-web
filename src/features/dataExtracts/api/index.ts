import api from '../../../api/axios';
import {DataExtractQueryResponse, DataExtractSeparator} from '../providers/types';

export const getDataExtract = async (planIdentifier: string, queryLabel: string, separator: DataExtractSeparator): Promise<File> => {
  return await api.get<File>('data-extract/extract/' + planIdentifier + '/' + queryLabel + '/' + separator).then(res => res.data);
};

export const getQueryLabels = async (planIdentifier: string): Promise<DataExtractQueryResponse[]> => {
  return await api.get<DataExtractQueryResponse[]>('data-extract/queryLabels/' + planIdentifier).then(res => res.data);
};
