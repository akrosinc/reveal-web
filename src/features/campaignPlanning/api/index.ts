import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import {
  DatasetDeleteRequest,
  DatasetUpdateRequest,
  InstanceHierarchy,
  InstanceListItem,
  LocationDataRequest,
  LocationFeature,
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
