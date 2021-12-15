import axios from "../../../api/axios";
import { OrganizationModel } from "../providers/types";
import { PageableModel } from '../../../api/sharedModel';
import { ORGANIZATION } from "../../../constants";

export const getOrganizationList = async (): Promise<PageableModel<OrganizationModel>> => {
  const data = await axios
    .get<PageableModel<OrganizationModel>>(ORGANIZATION + "?_summary=FALSE&root=true")
    .then((response) => response.data);
  return data;
};

export const getAllOrganizations = async (): Promise<PageableModel<OrganizationModel>> => {
  const data = await axios
    .get<PageableModel<OrganizationModel>>(ORGANIZATION + "?_summary=TRUE&root=false")
    .then((response) => response.data);
  return data;
};

export const getOrganizationById = async (id: string): Promise<OrganizationModel> => {
  const data = await axios
    .get<OrganizationModel>(ORGANIZATION + `/${id}`)
    .then((response) => response.data);
  return data;
};


export const createOrganization = async (organization: OrganizationModel): Promise<OrganizationModel> => {
  const data = await axios
    .post<OrganizationModel>(ORGANIZATION, organization)
    .then((response) => response.data);
  return data;
};

export const updateOrganization = async (organization: OrganizationModel): Promise<OrganizationModel> => {
  const data = await axios
    .put<OrganizationModel>(ORGANIZATION + `/${organization.identifier}`, organization)
    .then((response) => response.data);
  return data;
};

export const deleteOrganizationById = async (id: string): Promise<OrganizationModel> => {
  const data = await axios
    .delete<OrganizationModel>(ORGANIZATION + `/${id}`)
    .then((response) => response.data);
  return data;
};