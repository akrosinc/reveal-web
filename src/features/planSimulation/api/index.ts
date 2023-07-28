import api from '../../../api/axios';
import { GENERATED_LOCATION_HIERARCHY } from '../../../constants';
import { EntityTag, LookupEntityType, PersonMeta, PlanningLocationResponse } from '../providers/types';
import { SimulationCountResponse, SimulationRequestData } from '../components/Simulation';
import { SaveHierarchyRequest, SaveHierarchyResponse } from '../components/modals/SaveHierarchyModal';

export const getEntityList = async (): Promise<LookupEntityType[]> => {
  const data = await api.get<LookupEntityType[]>(`entityTag/entityType`).then(res => res.data);
  return data;
};

export const getEntityTags = async (): Promise<EntityTag[]> => {
  const data = await api.get<EntityTag[]>(`entityTag?filter=dataAssociated`).then(res => res.data);
  return data;
};

export const getDataAssociatedEntityTags = async (hierarchyIdentifier: string): Promise<EntityTag[]> => {
  const data = await api.get<EntityTag[]>('entityTag/dataAssociated/' + hierarchyIdentifier).then(res => res.data);
  return data;
};

export const getEventBasedEntityTags = async (): Promise<EntityTag[]> => {
  const data = await api.get<EntityTag[]>(`entityTag/eventBasedTags`).then(res => res.data);
  return data;
};

export const getImportableEntityTags = async (): Promise<EntityTag[]> => {
  const data = await api.get<EntityTag[]>(`entityTag?filter=importable`).then(res => res.data);
  return data;
};

export const getLocationList = async (
  HierarchyId: string,
  type: string,
  geographicLevel: string
): Promise<{ identifier: string; name: string }[]> => {
  const data = await api
    .get<{ identifier: string; name: string }[]>(
      GENERATED_LOCATION_HIERARCHY + `/${HierarchyId}/${type}/${geographicLevel}`
    )
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

export const submitSimulationRequest = async (requestData: SimulationRequestData): Promise<SimulationCountResponse> => {
  const data = await api
    .post<SimulationCountResponse>('entityTag/submitSearchRequest', requestData)
    .then(res => res.data);
  return data;
};

export const updateSimulationRequest = async (
  simulationRequestId: string | undefined,
  resultTags: EntityTag[] | undefined
): Promise<SimulationCountResponse> => {
  const data = await api
    .post<SimulationCountResponse>(
      '/entityTag/updateSimulationRequest?simulationRequestId=' + simulationRequestId,
      resultTags !== undefined && resultTags !== null ? resultTags : [{}]
    )
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
  closeHandler: () => any,
  openHandler: () => any,
  parentHandler: (e: any) => any,
  statsHandler: (e: any) => any,
  locationAggregationHandler: (e: any) => any,
  locationAggregationDefinitionHandler: (e: any) => any,
  resultsErrorHandler: (e: any) => any
) => {
  const events = new EventSource(
    process.env.REACT_APP_API_URL + '/entityTag/filter-sse?simulationRequestId=' + requestData.simulationRequestId
  );
  events.addEventListener('message', messageHandler);
  events.addEventListener('open', _ => {
    openHandler();
  });
  events.addEventListener('parent', e => parentHandler(e));

  events.addEventListener('stats', e => statsHandler(e));
  events.addEventListener('aggregations', e => locationAggregationHandler(e));
  events.addEventListener('aggregationDefinitions', e => locationAggregationDefinitionHandler(e));

  events.addEventListener('error', e => {
    resultsErrorHandler(e);
    return events.close();
  });
  events.addEventListener('close', _ => {
    closeHandler();
    return events.close();
  });
};

export const getFullLocationsSSE = (
  requestData: any,
  messageHandler: (e: any) => void,
  closeHandler: () => any,
  openHandler: () => any,
  resultsErrorHandler: (e: any) => any
) => {
  const events = new EventSource(
    process.env.REACT_APP_API_URL +
      '/entityTag/inactive-locations?simulationRequestId=' +
      requestData.simulationRequestId
  );

  events.addEventListener('open', _ => {
    openHandler();
  });
  events.addEventListener('error', e => {
    resultsErrorHandler(e);
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

export const saveHierarchy = async (saveHierarchyRequest: SaveHierarchyRequest): Promise<SaveHierarchyResponse> => {
  const data = await api
    .post<SaveHierarchyResponse>(GENERATED_LOCATION_HIERARCHY + `/saveSimulationHierarchy`, saveHierarchyRequest)
    .then(res => res.data);
  return data;
};
