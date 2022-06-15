import api from '../../../api/axios';
import { EntityList, EntityTags } from '../providers/types';

export const getPlanSimulationData = async (): Promise<EntityList[]> => {
  const data = await api.get<EntityList[]>(`entityTag`).then(res => res.data);
  return data;
};

export const getEntityTags = async (entityId: string): Promise<EntityTags[]> => {
  const data = await api.get<EntityTags[]>(`entityTag/${entityId}`).then(res => res.data);
  return data;
};
