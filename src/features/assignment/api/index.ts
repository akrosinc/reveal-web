import api from "../../../api/axios"
import { PageableModel } from "../../../api/providers";
import { PLAN } from "../../../constants"
import { LocationModel } from "../../location/providers/types";

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