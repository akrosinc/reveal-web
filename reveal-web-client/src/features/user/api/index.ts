import axios from "../../../api/axios";
import { PageableModel } from "../../../api/sharedModel";
import { USER } from "../../../constants";
import { UserModel } from "../providers/types";


export const getUserList = async (): Promise<PageableModel<UserModel>> => {
  const data = await axios
    .get<PageableModel<UserModel>>(USER)
    .then((response) => response.data);
  return data;
};

export const getUserById = async (id: string): Promise<UserModel> => {
  const data = await axios
    .get<UserModel>(USER + `/${id}`)
    .then((response) => response.data);
  return data;
};


export const createUser = async (user: UserModel): Promise<UserModel> => {
  const data = await axios
    .post<UserModel>(USER, user)
    .then((response) => response.data);
  return data;
};

export const updateUser = async (user: UserModel): Promise<UserModel> => {
  const data = await axios
    .put<UserModel>(USER + `/${user.identifier}`, user)
    .then((response) => response.data);
  return data;
};

export const deleteUserById = async (id: string): Promise<UserModel> => {
  const data = await axios
    .delete<UserModel>(USER + `/${id}`)
    .then((response) => response.data);
  return data;
};


export const uploadUserCsv = async (csv: FormData): Promise<string> => {
  const data = await axios
    .post(USER + '/bulk', csv)
    .then((response) => response.data);
  return data;
};