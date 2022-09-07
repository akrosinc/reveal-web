import api from '../../../api/axios';
import { ResourceCampaign, ResourceCountry, ResourceDashboardRequest, ResourceQuestion, ResourceQuestionStepTwo } from '../providers/types';

export const getPopulationCount = async (): Promise<any> => {
  const data = await api.get<Promise<any>>('').then(res => res.data);
  return data;
};

export const getCountryResource = async (): Promise<ResourceCountry[]> => {
  const data = await api.get<Promise<ResourceCountry[]>>('resource-planning/country').then(res => res.data);
  return data;
};

export const getCampaignResource = async (): Promise<ResourceCampaign[]> => {
  const data = await api.get<Promise<ResourceCampaign[]>>('resource-planning/campaign').then(res => res.data);
  return data;
};

export const getQuestionsResource = async (): Promise<ResourceQuestion[]> => {
  const data = await api.get<Promise<ResourceQuestion[]>>('resource-planning/formula').then(res => res.data);
  return data;
};

export const getQuestionsResourceStepTwo = async (stepTwoRequest: any): Promise<ResourceQuestionStepTwo[]> => {
  const data = await api.post<Promise<ResourceQuestionStepTwo[]>>('resource-planning/formula', stepTwoRequest).then(res => res.data);
  return data;
};

export const getResourceDashboard = async (dashboardRequest: ResourceDashboardRequest): Promise<any> => {
  const data = await api.post<Promise<any>>('resource-planning/dashboard', dashboardRequest).then(res => res.data);
  return data;
};