import { FeatureCollection, Properties } from '@turf/turf';
import api from '../../../api/axios';
import { EntityTag, LookupEntityType } from '../providers/types';

export const getEntityList = async (): Promise<LookupEntityType[]> => {
  const data = await api.get<LookupEntityType[]>(`entityTag/entityType`).then(res => res.data);
  return data;
};

export const getEntityTags = async (entityId: string): Promise<EntityTag[]> => {
  const data = await api.get<EntityTag[]>(`entityTag/${entityId}`).then(res => res.data);
  return data;
};

export const filterData = async (submitValue: any[]): Promise<FeatureCollection<Properties>> => {
  const data = await api.post<FeatureCollection<Properties>>('entityTag/filter', submitValue).then(res => res.data);
  return data;
}