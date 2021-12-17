import axios, { CancelToken } from "axios";
import api from "../../../api/axios";
import { PageableModel } from "../../../api/sharedModel";
import { USER } from "../../../constants";
import { CreateUserModel, UserModel } from "../providers/types";

export const getUserList = async (size: number, page: number, search?: string,): Promise<PageableModel<UserModel>> => {
  const data = await api
    .get<PageableModel<UserModel>>(USER + `?search=${search !== undefined ? search : ""}&size=${size}&page=${page}&_summary=FALSE&root=true`)
    .then((response) => response.data);
  return data;
};

export const getUserById = async (id: string, cancelToken: CancelToken): Promise<UserModel> => {
  const data = await api
    .get<UserModel>(USER + `/${id}`, {
      cancelToken: cancelToken
    })
    .then((response) => response.data).catch(function (thrown) {
      if (axios.isCancel(thrown)) {
        console.log('Request canceled', thrown.message);
      } else {
        return thrown;
      }});
  return data;
};


export const createUser = async (user: CreateUserModel): Promise<UserModel> => {
  const data = await api
    .post<UserModel>(USER, user)
    .then((response) => response.data);
  return data;
};

export const updateUser = async (user: UserModel): Promise<UserModel> => {
  const data = await api
    .put<UserModel>(USER + `/${user.identifier}`, user)
    .then((response) => response.data);
  return data;
};

export const deleteUserById = async (id: string): Promise<UserModel> => {
  const data = await api
    .delete<UserModel>(USER + `/${id}`)
    .then((response) => response.data);
  return data;
};


export const uploadUserCsv = async (csv: FormData): Promise<string> => {
  const data = await api
    .post(USER + '/bulk', csv)
    .then((response) => response.data);
  return data;
};