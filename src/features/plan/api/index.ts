import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { PLAN } from '../../../constants';
import { Action, ConditionModel, Goal, InterventionType, PlanCreateModel, PlanModel } from '../providers/types';

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

export const getActionTitles = async (): Promise<string[]> => {
  const data = await api.get<string[]>('action/actionTitles').then(response => response.data);
  return data;
};

export const getPlanCount = async (): Promise<{ count: number }> => {
  const data = await api.get<{ count: number }>(PLAN + '?_summary=COUNT').then(response => response.data);
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

export const updatePlanDetails = async (planDetails: PlanCreateModel, planId: string): Promise<any> => {
  const data = await api.put(`${PLAN}/${planId}`, planDetails).then(response => response.data);
  return data;
}

export const createGoal = async (goal: Goal, planId: string): Promise<any> => {
  const data = await api.post(`${PLAN}/${planId}/goal`, goal).then(response => response.data);
  return data;
};

export const updateGoal = async (goal: Goal, planId: string): Promise<any> => {
  const data = await api.put(`${PLAN}/${planId}/goal/${goal.identifier}`, goal).then(response => response.data);
  return data;
};

export const deleteGoalById = async (goalId: string, planId: string): Promise<any> => {
  const data = await api.delete(`${PLAN}/${planId}/goal/${goalId}`).then(response => response.data);
  return data;
};

export const createAction = async (action: Action, planId: string, goalId: string): Promise<any> => {
  const data = await api.post(`${PLAN}/${planId}/goal/${goalId}/action`, action).then(response => response.data);
  return data;
};

export const updateAction = async (action: Action, planId: string, goalId: string): Promise<any> => {
  const data = await api
    .put(`${PLAN}/${planId}/goal/${goalId}/action/${action.identifier}`, action)
    .then(response => response.data);
  return data;
};

export const deleteAction = async (actionId: string, planId: string, goalId: string): Promise<any> => {
  const data = await api
    .delete(`${PLAN}/${planId}/goal/${goalId}/action/${actionId}`)
    .then(response => response.data);
  return data;
};

export const createCondition = async (
  condtion: ConditionModel,
  planId: string,
  goalId: string,
  actionId: string
): Promise<any> => {
  const data = await api
    .post(`${PLAN}/${planId}/goal/${goalId}/action/${actionId}/condition`, condtion)
    .then(response => response.data);
  return data;
};

export const deleteCondition = async (condition: ConditionModel, planId: string, goalId: string, actionId: string): Promise<any> => {
  const data = await api
    .delete(`${PLAN}/${planId}/goal/${goalId}/action/${actionId}/condition/${condition.identifier}`)
    .then(response => response.data);
  return data;
};

export const getformList = async (): Promise<{ identifier: string; name: string }[]> => {
  const data = await api.get<{ identifier: string; name: string }[]>('form/dropdown').then(response => response.data);
  return data;
};
