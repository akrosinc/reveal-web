import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import {
  ActionLocationRecaptureLimitRequest,
  ActionLocationRecaptureLimitResponse,
  CostByLocationRequest,
  CostByLocationResponse,
  DatasetDeleteRequest,
  DatasetUpdateRequest,
  InstanceHierarchy,
  InstanceListItem,
  LocationDataRequest,
  LocationFeature,
  Plan,
  PlanSimulation,
  Team
} from '../providers/types';

export const getInstances = async (): Promise<PageableModel<InstanceListItem>> => {
  const data = await api
    .get<PageableModel<InstanceListItem>>('instance?page=0&size=1000')
    .then(response => response.data);
  return data;
};

export const getInstanceHierarchy = async (instanceId: string): Promise<InstanceHierarchy> => {
  const data = await api
    .get<InstanceHierarchy>(`instance/hierarchy?instanceIdentifier=${instanceId}`)
    .then(response => response.data);
  return data;
};

export const getInstanceTeams = async (instanceId: string): Promise<Team[]> => {
  const data = await api
    .get<Team[]>(`organization/instance-members?instanceIdentifier=${instanceId}`)
    .then(response => response.data);
  return data;
};

// The plan's simulation lists the datasets attached to it (the ones the Simulation page loads by default)
export const getPlanSimulation = async (planId: string): Promise<PlanSimulation> => {
  const data = await api.get<PlanSimulation>(`simulation/${planId}`).then(response => response.data);
  return data;
};

// Locations under the parent with their dataset values in properties.metadata
export const getLocationData = async (request: LocationDataRequest): Promise<LocationFeature[]> => {
  const data = await api
    .post<LocationFeature[]>('simulation/dataset/location-data', request)
    .then(response => response.data);
  return data;
};

// Saves a dataset's name, colours and line width to the simulation (same call as Simulation's Edit dataset popup)
export const updateSimulationDataset = async (request: DatasetUpdateRequest): Promise<PlanSimulation> => {
  const data = await api.put<PlanSimulation>('simulation/dataset', request).then(response => response.data);
  return data;
};

export const deleteSimulationDataset = async (request: DatasetDeleteRequest): Promise<void> => {
  await api.delete('simulation/dataset', { data: request });
};

export const assignLocationsToPlan = async (planId: string, locationIds: string[]): Promise<void> => {
  await api.post(`plan/${planId}/assignLocations`, { locations: locationIds });
};

export const getTeamLocations = async (teamId: string, planId: string): Promise<string[]> => {
  const data = await api.get<string[]>(`plan/${planId}/assigned-locations/${teamId}`).then(response => response.data);
  return data;
};

export const assignLocationsToTeam = async (teamId: string, locationIds: string[], planId: string): Promise<void> => {
  await api.post(`plan/assignLocationsToTeam/${planId}`, {
    organizationIdentifier: teamId,
    locationIdentifiers: locationIds
  });
};

// The plan with its goals and their actions (PlanResponse); the right panel lists these actions
export const getPlan = async (planId: string): Promise<Plan> => {
  const data = await api.get<Plan>(`plan/${planId}`).then(response => response.data);
  return data;
};

// Saves the computed cost for an action at a location (cost_by_location)
export const saveCostByLocation = async (request: CostByLocationRequest): Promise<void> => {
  await api.post('cost-by-location', request);
};

// Saves the recapture limit count for an action at a location (action_location_recapture_limit)
export const saveActionLocationRecaptureLimit = async (
  request: ActionLocationRecaptureLimitRequest
): Promise<void> => {
  await api.post('action-location-recapture-limit', request);
};

// Costs saved for a location within an instance (cost_by_location)
export const getCostsByInstanceAndLocation = async (
  instanceId: string,
  locationId: string
): Promise<CostByLocationResponse[]> => {
  const data = await api
    .get<CostByLocationResponse[]>(
      `cost-by-location?instanceIdentifier=${instanceId}&locationIdentifier=${locationId}`
    )
    .then(response => response.data);
  return data;
};

// Recapture limits saved for a location within an instance (action_location_recapture_limit)
export const getRecaptureLimitsByInstanceAndLocation = async (
  instanceId: string,
  locationId: string
): Promise<ActionLocationRecaptureLimitResponse[]> => {
  const data = await api
    .get<ActionLocationRecaptureLimitResponse[]>(
      `action-location-recapture-limit?instanceIdentifier=${instanceId}&locationIdentifier=${locationId}`
    )
    .then(response => response.data);
  return data;
};
