import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { GROUP_MANAGEMENT } from '../../../constants';
import { LocationModel } from '../../location/providers/types';

export interface GroupMember {
  identifier: string;
  name: string;
}

export interface GroupDataset {
  identifier: string;
  name: string;
}

export interface GroupRole {
  identifier: string;
  name: string;
}

export interface GroupArea {
  identifier: string;
  properties: {
    name: string;
    geographicLevel: string;
    [key: string]: any;
  };
  children?: GroupArea[];
}

export interface GroupModel {
  identifier: string;
  name: string;
  type: string;
  active: boolean;
  members?: GroupMember[];
  datasets?: GroupDataset[];
  roles?: GroupRole[];
  areas?: GroupArea[];
  organizationType?:string
}


export interface CreateGroupPayload {
  identifier?: string;
  name: string;
  isTeam: boolean;
  instanceId: string | null;
  areasIdentifiers: string[];
  rolesIdentifiers: string[];
  datasetsIdentifiers: string[];
  membersIdentifiers: string[];
}

export interface AssignedUserModel {
  identifier: string;
  name: string;
}

export interface AssignedDatasetModel {
  identifier: string;
  name: string;
}

export interface AssignedRoleModel {
  identifier: string;
  name: string;
}

export const getGroupList = async (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<GroupModel>> => {
  const data = await api
    .get<PageableModel<GroupModel>>(
      GROUP_MANAGEMENT +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};



export const createGroup = async (payload: CreateGroupPayload): Promise<GroupModel> => {
  const data = await api
    .post<GroupModel>(GROUP_MANAGEMENT, payload)
    .then(response => response.data);
  return data;
};

export const getAssignedUserList = async (): Promise<AssignedUserModel[]> => {
  try {
    const response = await api.get<AssignedUserModel[]>('instance/assigned/user/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned user list:', error);
    throw error;
  }
};

export const getAssignedAreaTree = async (): Promise<LocationModel[]> => {
  try {
    const response = await api.get<LocationModel[]>('groupmanagement/instance/locationassigments');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned area tree:', error);
    throw error;
  }
};

export const getAssignedDatasetList = async (): Promise<AssignedDatasetModel[]> => {
  try {
    const response = await api.get<AssignedDatasetModel[]>('instance/assigned/dataset/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned dataset list:', error);
    throw error;
  }
};

export const getAssignedRoleList = async (): Promise<AssignedRoleModel[]> => {
  try {
    const response = await api.get<AssignedRoleModel[]>(GROUP_MANAGEMENT + '/roles/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned role list:', error);
    throw error;
  }
};

export const assignLocationToGroup = async (requestBody: { organizationIdentifier: string; locationIdentifiers: string[] }): Promise<any> => {
  const data = await api
    .post(`${GROUP_MANAGEMENT}/assignlocation`, requestBody)
    .then(response => response.data);
  return data;
};

export const getGroupByIdentifier = async (identifier: string): Promise<GroupModel> => {
  const response = await api.get<GroupModel>(`${GROUP_MANAGEMENT}/${identifier}`);
  return response.data;
};

export const updateGroup = async (identifier: string, payload: CreateGroupPayload): Promise<GroupModel> => {
  const response = await api.put<GroupModel>(`${GROUP_MANAGEMENT}/${identifier}`, payload);
  return response.data;
};