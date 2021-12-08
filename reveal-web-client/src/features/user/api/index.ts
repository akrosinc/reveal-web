import axios from "../../../api/axios";
import { USER } from "../../../constants";
import { UserModel } from "../providers/types";


export const getOrganizationList = async (): Promise<UserModel[]> => {
  const data = await axios
    .get<UserModel[]>(USER)
    .then((response) => response.data);
  return data;
};