import axios from "../../../api/axios";
import { OrganizationModel } from "../providers/types";
import { ORGANIZATION } from "../../../constants";

export const getOrganizationList = async (): Promise<OrganizationModel[]> => {
  const data = await axios
    .get<OrganizationModel[]>(ORGANIZATION)
    .then((response) => response.data);
  return data;
};
