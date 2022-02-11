import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { PLAN } from '../../../constants';
import { InterventionType, PlanCreateModel, PlanModel } from '../providers/types';

export const getPlanList = async (
  size: number,
  page: number,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<PlanModel>> => {
  const data = await api
    .get<PageableModel<PlanModel>>(
      PLAN +
        `?_summary=${summary}&search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getPlanById = async (id: string): Promise<PlanModel> => {
  const data = await api.get<PlanModel>(PLAN + '/' + id).then(response => response.data);
  return data;
};

export const getPlanCount = async (): Promise<{count: number}> => {
  const data = await api.get<{count: number}>(PLAN + '?_summary=COUNT').then(response => response.data);
  return data;
};

export const getInterventionTypeList = async (): Promise<InterventionType[]> => {
  const data = await api.get<InterventionType[]>('lookupInterventionType').then(response => response.data);
  return data;
};

export const createPlan = async (plan: PlanCreateModel): Promise<PlanModel> => {
  const data = await api.post<PlanModel>(PLAN, plan).then(response => response.data);
  return data;
};

export const updatePlanStatus = async (id: string): Promise<any> => {
  const data = await api.patch(PLAN + '/' + id).then(response => response.data);
  return data;
};

export const getformList = async (): Promise<{identifier: string, name: string}[]> => {
  const data = await api.get<{identifier: string, name: string}[]>('form/dropdown').then(response => response.data);
  return data;
}
