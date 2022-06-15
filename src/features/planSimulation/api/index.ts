import api from "../../../api/axios";
import { EntityList } from "../providers/types";

export const getPlanSimulationData = (): Promise<EntityList[]> => {
    const data = api.get<EntityList[]>('').then(res => res.data);
    return data;
}