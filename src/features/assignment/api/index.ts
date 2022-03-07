import api from "../../../api/axios"
import { PageableModel } from "../../../api/providers";
import { PLAN } from "../../../constants"
import { LocationModel } from "../../location/providers/types";
import { OrganizationModel } from "../../organization/providers/types";
import { TeamAssignHierarchyRequest } from "../providers/types";

export const getLocationHierarchyByPlanId = async (planId: string): Promise<PageableModel<LocationModel>> => {
    const data = await api.get<PageableModel<LocationModel>>(PLAN + `/${planId}/locationHierarchy`).then(response => response.data);
    return data;
}

export const assignLocationsToPlan = async (planId: string, assignedLocations: string[]): Promise<any> => {
    let payload = {
        locations: assignedLocations
    }
    const data = await api.post<PageableModel<LocationModel>>(PLAN + `/${planId}/assignLocations`, payload).then(response => response.data);
    return data;
}

export const getAssignedLocationHierarcyCount = async (planId: string): Promise<{count: number}> => {
    const data = await api.get<{count: number}>(PLAN + `/${planId}/locationHierarchy?_summary=COUNT`).then(response => response.data);
    return data;
}

export const assignTeamsToLocation = async (planId: string, locationId: string, teamIds: string[]): Promise<any> => {
    const data = await api.post(PLAN + `/${planId}/${locationId}/assignTeams`, {teams: teamIds}).then(response => response.data);
    return data;
}

export const assignTeamsToLocationHierarchy = async (planId: string, locationTeam: TeamAssignHierarchyRequest): Promise<any> => {
    const data = await api.post(PLAN + `/${planId}/assignLocationHierarchyTeams`, locationTeam).then(response => response.data);
    return data;
}

export const getAssignedTeamsByPlanAndLocationId = async (planId: string, locationId: string): Promise<OrganizationModel[]> => {
    const data = await api.get<OrganizationModel[]>(PLAN + `/${planId}/${locationId}/teams`).then(response => response.data);
    return data;
}