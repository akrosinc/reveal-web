import api from '../../../api/axios';
import { OrganizationModel, Groups } from '../providers/types';
import { PageableModel } from '../../../api/providers';
import { KEYCLOAK_SECURITY_GROUPS, ORGANIZATION } from '../../../constants';

export const getOrganizationList = async (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<OrganizationModel>> => {
  const data = await api
    .get<PageableModel<OrganizationModel>>(
      ORGANIZATION +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&_summary=FALSE&root=true&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getOrganizationCount = async (): Promise<{ count: number }> => {
  const data = await api.get<{ count: number }>(ORGANIZATION + '?_summary=COUNT').then(response => response.data);
  return data;
};

export const getOrganizationListSummary = async (): Promise<PageableModel<OrganizationModel>> => {
  const data = await api
    .get<PageableModel<OrganizationModel>>(ORGANIZATION + '?_summary=TRUE&root=false&size=100&page=0')
    .then(response => response.data);
  return data;
};

export const getOrganizationById = async (id: string): Promise<OrganizationModel> => {
  const data = await api
    .get<OrganizationModel>(ORGANIZATION + `/${id}`)
    .then(response => response.data);
  return data;
};

export const createOrganization = async (organization: any): Promise<OrganizationModel> => {
  const data = await api.post<OrganizationModel>(ORGANIZATION, organization).then(response => response.data);
  return data;
};

export const updateOrganization = async (organization: OrganizationModel): Promise<OrganizationModel> => {
  const data = await api
    .put<OrganizationModel>(ORGANIZATION + `/${organization.identifier}`, organization)
    .then(response => response.data);
  return data;
};

export const deleteOrganizationById = async (id: string): Promise<OrganizationModel> => {
  const data = await api.delete<OrganizationModel>(ORGANIZATION + `/${id}`).then(response => response.data);
  return data;
};

export const getSecurityGroups = async (): Promise<Groups[]> => {
  const data = await api
    .get<Groups[]>(KEYCLOAK_SECURITY_GROUPS)
    .then(response => response.data);
  return data;
};
