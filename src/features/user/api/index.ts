import { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { USER, GROUP_MANAGEMENT } from '../../../constants';
import { BulkDetailsModel, CreateUserModel, EditUserModel, UserBulk, UserModel, UserInstanceModel, UserRolesResponse } from '../providers/types';
import { LocationModel } from '../../location/providers/types';

export const getUserList = async (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<UserModel>> => {
  const data = await api
    .get<PageableModel<UserModel>>(
      USER + '/global' +
      `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${sortField !== undefined ? sortField : ''
      },${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getUserById = async (id: string): Promise<UserModel> => {
  const data = await api
    .get<UserModel>(USER + `/${id}`)
    .then(response => response.data);
  return data;
};

export const createUser = async (user: CreateUserModel): Promise<UserModel> => {
  const data = await api.post<UserModel>(USER + '/global', user).then(response => response.data);
  return data;
};

export const updateUser = async (user: EditUserModel): Promise<UserModel> => {
  const data = await api.put<UserModel>(USER + `/${user.identifier}`, user).then(response => response.data);
  return data;
};

export const deleteUserById = async (id: string): Promise<UserModel> => {
  const data = await api.delete<UserModel>(USER + `/${id}`).then(response => response.data);
  return data;
};

export const resetUserPassword = async (user: any): Promise<AxiosResponse> => {
  const data = await api.put(USER + `/resetPassword/${user.identifier}`, user).then(response => response);
  return data;
};

export const uploadUserCsv = async (csv: FormData, toastId: string): Promise<string> => {
  const data = await api.post(USER + '/bulk', csv, {
    onUploadProgress: p => {
      const progress = p.loaded / p.total;
      toast.update(toastId, { progress, render: 'JSON file is uploading... ' + Math.round(progress * 100) + '%' });
      toast.dismiss(toastId);
    }
  }).then(response => response.data);
  return data;
};

export const getBulkList = async (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<UserBulk>> => {
  const data = await api
    .get<PageableModel<UserBulk>>(
      USER +
      `/bulk?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${sortField !== undefined ? sortField : ''
      },${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getBulkById = async (
  size: number,
  page: number,
  id: string,
  search?: string
): Promise<PageableModel<BulkDetailsModel>> => {
  const data = await api
    .get<PageableModel<BulkDetailsModel>>(USER + `/bulk/${id}?size=${size}&page=${page}`)
    .then(response => response.data);
  return data;
};

export const getUserLocationsTree = async (userId: string): Promise<LocationModel[]> => {
  const data = await api
    .get<LocationModel[]>(`instance/user/${userId}/arealist`)
    .then(response => response.data);
  return data;
};

export const getUserGroupsData = async (userId: string): Promise<string[]> => {
  const data = await api
    .get<string[]>(`${GROUP_MANAGEMENT}/user/${userId}/groups`)
    .then(response => response.data);
  return data;
};

export const getUserDatasetTags = async (userId: string): Promise<UserInstanceModel[]> => {
  const data = await api
    .get<UserInstanceModel[]>(`instance/user/${userId}/datalist`)
    .then(response => response.data);
  return data;
};

export const getUserRoles = async (userId: string): Promise<UserRolesResponse> => {
  const data = await api
    .get<UserRolesResponse>(`instance/user/${userId}/roles`)
    .then(response => response.data);
  return data;
};

export const getUserInstanceList = async (userId: string): Promise<UserInstanceModel[]> => {
  const data = await api
    .get<UserInstanceModel[]>('instance/' + USER + `/${userId}/instancelist`)
    .then(response => response.data);
  return data;
};

export interface CreateInstanceUserPayload {
  username: string;
  firstName: string;
  lastName: string;
  email: string | null;
  password: string;
  tempPassword: boolean;
  securityGroups: string[];
  instanceIdentifier: string;
  isInstanceAdmin: boolean;
}

export const createInstanceUser = async (payload: CreateInstanceUserPayload): Promise<UserModel> => {
  const data = await api.post<UserModel>(`instance/user`, payload).then(response => response.data);
  return data;
};

export interface GroupModel {
  identifier: string;
  name: string;
}

export const getGroupManagementList = async (instanceIdentifier: string): Promise<PageableModel<GroupModel>> => {
  const data = await api
    .get<PageableModel<GroupModel>>(`${GROUP_MANAGEMENT}?instanceIdentifier=${instanceIdentifier}&size=9999`)
    .then(response => response.data);
  return data;
};

export interface CreateGroupAuthUserPayload extends CreateInstanceUserPayload {
  groupIdentifier: string;
}

export const createGroupAuthUser = async (payload: CreateGroupAuthUserPayload): Promise<UserModel> => {
  const data = await api.post<UserModel>(`${GROUP_MANAGEMENT}/org/user`, payload).then(response => response.data);
  return data;
};

