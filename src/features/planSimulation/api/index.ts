import api from '../../../api/axios';
import { LOCATION_HIERARCHY } from '../../../constants';
import { EntityTag, LookupEntityType, PersonMeta, PlanningLocationResponse } from '../providers/types';

export const getEntityList = async (): Promise<LookupEntityType[]> => {
  const data = await api.get<LookupEntityType[]>(`entityTag/entityType`).then(res => res.data);
  return data;
};

export const getEntityTags = async (entityId: string): Promise<EntityTag[]> => {
  const data = await api.get<EntityTag[]>(`entityTag/${entityId}?filter=global`).then(res => res.data);
  return data;
};

export const getImportableEntityTags = async (entityId: string): Promise<EntityTag[]> => {
  const data = await api.get<EntityTag[]>(`entityTag/${entityId}?filter=importable`).then(res => res.data);
  return data;
};

export const getLocationList = async (
  HierarchyId: string,
  geographicLevel: string
): Promise<{ identifier: string; name: string }[]> => {
  const data = await api
    .get<{ identifier: string; name: string }[]>(LOCATION_HIERARCHY + `/${HierarchyId}/${geographicLevel}`)
    .then(res => res.data);
  return data;
};

export const filterData = async (requestData: {
  hierarchyIdentifier: string | undefined;
  locationIdentifier: string | undefined;
  entityFilters: any[];
}): Promise<PlanningLocationResponse> => {
  const data = await api.post<PlanningLocationResponse>('entityTag/filter', requestData).then(res => res.data);
  return data;
};

export const getPersonMetadata = async (personId: string): Promise<PersonMeta> => {
  const data = await api.get<PersonMeta>(`entityTag/person/${personId}`).then(res => res.data);
  return data;
};
