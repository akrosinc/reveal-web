import api from '../../../../../api/axios';
import { toast } from 'react-toastify';

import { OrganizationModel, Groups } from '../../../../../features/organization/providers/types';
import { PageableModel } from '../../../../../api/providers';
import { ORGANIZATION } from '../../../../../constants';

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

export const getOrganizationListSummary = async (): Promise<PageableModel<OrganizationModel>> => {
  const data = await api
    .get<PageableModel<OrganizationModel>>(ORGANIZATION + '?_summary=TRUE&root=false&size=500&page=0')
    .then(response => response.data);
  return data;
};

export const getOrganizatonsWithMembers = async (): Promise<any[]> => {
  const data = await api.get<any[]>('/organization/members').then(response => response.data);
  return data;
};
