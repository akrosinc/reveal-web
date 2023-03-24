import api from '../../../api/axios';
import { LOCATION_HIERARCHY } from '../../../constants';
import { EntityTag, LookupEntityType, PersonMeta, PlanningLocationResponse } from '../providers/types';
import { SimulationCountResponse } from '../components/Simulation';
import { toast } from 'react-toastify';

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

export const submitSimulationRequest = async (requestData: {
  hierarchyIdentifier: string | undefined;
  locationIdentifier: string | undefined;
  entityFilters: any[];
  filterGeographicLevelList: string[] | undefined;
  inactiveGeographicLevelList: string[] | undefined;
  includeInactive: boolean;
}): Promise<SimulationCountResponse> => {
  const data = await api
    .post<SimulationCountResponse>('entityTag/submitSearchRequest', requestData)
    .then(res => res.data);
  return data;
};

export const getFullHierarchyCSV = async (hierarchyIdentifier: string): Promise<File> => {
  return await api
    .get<File>('entityTag/fullHierarchyCSV?hierarchyIdentifier=' + hierarchyIdentifier)
    .then(res => res.data);
};

export const getFullHierarchyJSON = async (hierarchyIdentifier: string): Promise<PlanningLocationResponse> => {
  return await api
    .get<PlanningLocationResponse>('entityTag/fullHierarchy?hierarchyIdentifier=' + hierarchyIdentifier)
    .then(res => res.data);
};

export const getLocationsSSE = (
  requestData: any,
  messageHandler: (e: MessageEvent<any>) => void,
  closeHandler: (e: any) => any,
  openHandler: () => any
) => {
  console.log('Invoked');
  const events = new EventSource(
    process.env.REACT_APP_API_URL + '/entityTag/filter-sse?simulationRequestId=' + requestData.simulationRequestId
  );
  events.addEventListener('message', messageHandler);
  events.addEventListener('open', e => {
    openHandler();
  });
  events.addEventListener('error', e => {
    toast.error('Error getting locations');
  });
  events.addEventListener('close', e => {
    closeHandler(e);
    return events.close();
  });
};

export const getFullLocationsSSE = (
  requestData: any,
  messageHandler: (e: any) => void,
  closeHandler: () => any,
  openHandler: () => any
) => {
  console.log('Invoked');
  const events = new EventSource(
    process.env.REACT_APP_API_URL +
      '/entityTag/inactive-locations?simulationRequestId=' +
      requestData.simulationRequestId
  );

  events.addEventListener('open', e => {
    openHandler();
  });
  events.addEventListener('error', e => {
    toast.error('Error getting locations');
  });
  events.addEventListener('close', () => {
    closeHandler();
    return events.close();
  });

  events.addEventListener('parent', e => {
    messageHandler(e);
  });
};

export const getPersonMetadata = async (personId: string): Promise<PersonMeta> => {
  const data = await api.get<PersonMeta>(`entityTag/person/${personId}`).then(res => res.data);
  return data;
};
