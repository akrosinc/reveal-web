import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import {
  ResourceCampaign,
  ResourceCountry,
  ResourceDashboardRequest,
  ResourceDashboardResponse,
  ResourcePlanningHistory,
  ResourceQuestion,
  ResourceQuestionStepTwo
} from '../providers/types';

export const getPopulationCount = async (): Promise<any> => {
  const data = await api.get<any>('').then(res => res.data);
  return data;
};

export const getCountryResource = async (): Promise<ResourceCountry[]> => {
  const data = await api.get<ResourceCountry[]>('resource-planning/country').then(res => res.data);
  return data;
};

export const getCampaignResource = async (): Promise<ResourceCampaign[]> => {
  const data = await api.get<ResourceCampaign[]>('resource-planning/campaign').then(res => res.data);
  return data;
};

export const getQuestionsResource = async (): Promise<ResourceQuestion[]> => {
  const data = await api.get<ResourceQuestion[]>('resource-planning/formula').then(res => res.data);
  return data;
};

export const getQuestionsResourceStepTwo = async (stepTwoRequest: any): Promise<ResourceQuestionStepTwo[]> => {
  const data = await api
    .post<ResourceQuestionStepTwo[]>('resource-planning/formula', stepTwoRequest)
    .then(res => res.data);
  return data;
};

export const getResourceDashboard = async (
  dashboardRequest: ResourceDashboardRequest,
  saveData?: boolean
): Promise<ResourceDashboardResponse[]> => {
  const data = await api
    .post<ResourceDashboardResponse[]>(
      `resource-planning/dashboard${saveData ? '?saveData=true' : ''}`,
      dashboardRequest
    )
    .then(res => res.data);
  return data;
};

export const getResourceHistory = async (
  size: number,
  page: number,
  sortField?: string,
  sortDirection?: boolean
): Promise<PageableModel<ResourcePlanningHistory>> => {
  const data = await api
    .get<PageableModel<ResourcePlanningHistory>>(
      `resource-planning/history?size=${size}&page=${page}${
        sortField ? '&sort=' + sortField + (sortDirection ? ',asc' : ',desc') : ''
      }`
    )
    .then(res => res.data);
  return data;
};

export const getResourceHistoryById = async (id: string): Promise<ResourceDashboardRequest> => {
  const data = await api.get<ResourceDashboardRequest>(`resource-planning/history/${id}`).then(res => res.data);
  return data;
};
