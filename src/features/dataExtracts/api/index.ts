import api from '../../../api/axios';

export const getDataExtract = async (planIdentifier: string): Promise<File> => {
  return await api.get<File>('data-extract/' + planIdentifier).then(res => res.data);
};
