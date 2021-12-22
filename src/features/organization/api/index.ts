import api from "../../../api/axios";
import { OrganizationModel, Groups } from "../providers/types";
import { PageableModel } from '../../../api/sharedModel';
import { KEYCLOAK_SECURITY_GROUPS, ORGANIZATION } from "../../../constants";
import { CancelToken } from "axios";

export const getOrganizationList = async (size: number, page: number, search?: string): Promise<PageableModel<OrganizationModel>> => {
  const data = await api
    .get<PageableModel<OrganizationModel>>(ORGANIZATION + `?search=${search !== undefined ? search : ""}&size=${size}&page=${page}&_summary=FALSE&root=true`)
    .then((response) => response.data);
  return data;
};

export const getOrganizationCount = async (): Promise<{count: number}> => {
  const data = await api
    .get<{count: number}>(ORGANIZATION + "?_summary=COUNT")
    .then((response) => response.data);
  return data;
};

export const getOrganizationListSummary = async (): Promise<PageableModel<OrganizationModel>> => {
  const data = await api
    .get<PageableModel<OrganizationModel>>(ORGANIZATION + "?_summary=TRUE&root=false")
    .then((response) => response.data);
  return data;
};

export const getAllOrganizations = async (cancelToken?: CancelToken): Promise<PageableModel<OrganizationModel>> => {
  const data = await api
    .get<PageableModel<OrganizationModel>>(ORGANIZATION + "?_summary=TRUE&root=false", {
      cancelToken: cancelToken
    })
    .then((response) => response.data);
  return data;
};

export const getOrganizationById = async (id: string, cancelToken: CancelToken): Promise<OrganizationModel> => {
  const data = await api
    .get<OrganizationModel>(ORGANIZATION + `/${id}`, {
      cancelToken: cancelToken
    })
    .then((response) => response.data);
  return data;
};


export const createOrganization = async (organization: any): Promise<OrganizationModel> => {
  const data = await api
    .post<OrganizationModel>(ORGANIZATION, organization)
    .then((response) => response.data);
  return data;
};

export const updateOrganization = async (organization: OrganizationModel): Promise<OrganizationModel> => {
  const data = await api
    .put<OrganizationModel>(ORGANIZATION + `/${organization.identifier}`, organization)
    .then((response) => response.data);
  return data;
};

export const deleteOrganizationById = async (id: string): Promise<OrganizationModel> => {
  const data = await api
    .delete<OrganizationModel>(ORGANIZATION + `/${id}`)
    .then((response) => response.data);
  return data;
};

export const getSecurityGroups = async (cancelToken?: CancelToken): Promise<Groups[]> => {
  const data = await api
    .get<Groups[]>(KEYCLOAK_SECURITY_GROUPS, {
      cancelToken: cancelToken,
    })
    .then((response) => response.data);
  return data;
};