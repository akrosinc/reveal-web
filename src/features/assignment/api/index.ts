import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { LOCATION, PLAN } from '../../../constants';
import { LocationModel } from '../../location/providers/types';
import { OrganizationModel } from '../../organization/providers/types';
import { TeamAssignHierarchyRequest } from '../providers/types';

export const getLocationHierarchyByPlanId = async (planId: string): Promise<PageableModel<LocationModel>> => {
  const data = await api
    .get<PageableModel<LocationModel>>(PLAN + `/${planId}/locationHierarchy`)
    .then(response => response.data);
  return data;
};

export const assignLocationsToPlan = async (planId: string, assignedLocations: string[]): Promise<any> => {
  let payload = {
    locations: assignedLocations
  };
  const data = await api
    .post<PageableModel<LocationModel>>(PLAN + `/${planId}/assignLocations`, payload)
    .then(response => response.data);
  return data;
};

export const assignLocationToPlan = async (planId: string, assignedLocation: string): Promise<any> => {
  const data = await api
    .post<PageableModel<LocationModel>>(PLAN + `/${planId}/assignLocation/${assignedLocation}`)
    .then(response => response.data);
  return data;
};

export const assignTeamsToMultiplePlanLocations = async (
  planId: string,
  assignedLocationIds: string[],
  teamIds: string[],
  assignChildren: boolean
): Promise<any> => {
  const data = await api
    .post<PageableModel<LocationModel>>(PLAN + `/${planId}/multipleTeamAssign`, {
      locations: assignedLocationIds,
      teams: teamIds,
      assignChildren: assignChildren
    })
    .then(response => response.data);
  return data;
};

export const getAssignedLocationHierarcyCount = async (planId: string): Promise<{ count: number }> => {
  const data = await api
    .get<{ count: number }>(PLAN + `/${planId}/locationHierarchy?_summary=COUNT`)
    .then(response => response.data);
  return data;
};

export const assignTeamsToLocation = async (
  planId: string,
  locationId: string,
  teamIds: string[],
  assignChildren: boolean
): Promise<any> => {
  const data = await api
    .post(PLAN + `/${planId}/${locationId}/assignTeams`, { teams: teamIds, assignChildren: assignChildren })
    .then(response => response.data);
  return data;
};

export const assignTeamsToLocationHierarchy = async (
  planId: string,
  locationTeam: TeamAssignHierarchyRequest
): Promise<any> => {
  const data = await api
    .post(PLAN + `/${planId}/assignLocationHierarchyTeams`, locationTeam)
    .then(response => response.data);
  return data;
};

export const getAssignedTeamsByPlanAndLocationId = async (
  planId: string,
  locationId: string
): Promise<OrganizationModel[]> => {
  const data = await api
    .get<OrganizationModel[]>(PLAN + `/${planId}/${locationId}/teams`)
    .then(response => response.data);
  return data;
};

export const getChildLocation = async (locationId: string, planId: string): Promise<LocationModel[]> => {
  const data = await api
    .get<LocationModel[]>(LOCATION + `/${locationId}/children/${planId}`)
    .then(response => response.data);
  return data;
};
