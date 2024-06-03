import api from '../../../api/axios';
import { OrganizationModel, EntityTagAccessRequest, ComplexTagAccessRequest } from '../providers/types';
import { PageableModel } from '../../../api/providers';
import { ENTITY_TAG, ORGANIZATION, USER } from '../../../constants';
import { UserModel } from '../../user/providers/types';
import { EntityTagResponse } from '../../planSimulation/providers/types';

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

export const updateEntityTagGrants = async (tags: EntityTagAccessRequest[]): Promise<EntityTagResponse[]> => {
  const data = await api.post<EntityTagResponse[]>(ENTITY_TAG + `/updateGrants`, tags).then(response => response.data);
  return data;
};

export const updateComplexTagGrants = async (tags: ComplexTagAccessRequest[]): Promise<EntityTagResponse[]> => {
  const data = await api
    .post<EntityTagResponse[]>(ENTITY_TAG + `/updateComplexTagGrants`, tags)
    .then(response => response.data);
  return data;
};

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
