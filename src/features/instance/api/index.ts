import api from '../../../api/axios';
import { InstanceModel } from '../../reducers/instanceContext';

const INSTANCE_CONTEXT = 'instance/context';
const INSTANCE_USER_LIST = 'instance/user/instancelist';
const INSTANCE_SELECT = (instanceId: string) => `instance/instances/${instanceId}/select`;

export interface InstanceSelectResponse {
  selectedInstance: InstanceModel;
  instancePlan: InstanceModel;
  role: {
    identifier: string;
    name: string;
    permissions: string[];
  };
  groups: any[];
}


export const getInstanceContext = async (): Promise<InstanceSelectResponse> => {
  const data = await api.get<InstanceSelectResponse>(INSTANCE_CONTEXT).then(response => response.data);
  return data;
};

export const getUserInstanceList = async (): Promise<InstanceModel[]> => {
  const data = await api.get<InstanceModel[]>(INSTANCE_USER_LIST).then(response => response.data);
  return data;
};

export const selectInstance = async (instanceId: string): Promise<InstanceSelectResponse> => {
  const data = await api
    .post<InstanceSelectResponse>(INSTANCE_SELECT(instanceId))
    .then(response => response.data);
  return data;
};
