import api from '../../../../../api/axios';

export const assignLocationToTeam = async (teamId: number, locationId: string[], planId: string) => {
  const response = await api.post(`/plan/assignLocationsToTeam/${planId}`, {
    organizationIdentifier: teamId,
    locationIdentifiers: locationId
  });

  return response.data;
};

export const getLocationsAssignedToATeam = async (teamId: number, planId: string) => {
  const response = await api.get(`/plan/${planId}/assigned-locations/${teamId}`);

  return response.data;
};
