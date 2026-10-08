import api from '../../../api/axios';
import { InstanceDataset, InstanceHierarchy, Team } from '../providers/types';

export const getInstanceHierarchy = async (instanceId: string): Promise<InstanceHierarchy> => {
  const data = await api
    .get<InstanceHierarchy>(`instance/hierarchy?instanceIdentifier=${instanceId}`)
    .then(response => response.data);
  return data;
};

// Instance-scoped: X-Instance-ID header is added by api/axios.ts
export const getInstanceDatasets = async (): Promise<InstanceDataset[]> => {
  const data = await api.get<InstanceDataset[]>('instance/assigned/dataset/list').then(response => response.data);
  return data;
};

export const getInstanceTeams = async (instanceId: string): Promise<Team[]> => {
  const data = await api
    .get<Team[]>(`organization/instance-members?instanceIdentifier=${instanceId}`)
    .then(response => response.data);
  return data;
};
