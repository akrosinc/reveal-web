import { AxiosResponse } from 'axios';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { USER } from '../../../constants';
import { BulkDetailsModel, CreateUserModel, EditUserModel, UserBulk, UserModel } from '../providers/types';

export const getUserList = async (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<UserModel>> => {
  const data = await api
    .get<PageableModel<UserModel>>(
      USER +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
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
  const data = await api.post<UserModel>(USER, user).then(response => response.data);
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

export const uploadUserCsv = async (csv: FormData): Promise<string> => {
  const data = await api.post(USER + '/bulk', csv).then(response => response.data);
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
        `/bulk?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
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
