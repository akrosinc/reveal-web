import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { GROUP_MANAGEMENT } from '../../../constants';

export interface GroupModel {
  identifier: string;
  name: string;
  type: string;
}

export interface CreateGroupPayload {
  identifier?: string;
  name: string;
  isTeam: boolean;
  instanceId: string | null;
  areasIdentifiers: string[];
  rolesIdentifiers: string[];
  datasetsIdentifiers: string[];
  membersIdentifiers: string[];
  teamsIdentifiers: string[];
}

export const getGroupList = async (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<GroupModel>> => {
  const searchParam = search !== undefined ? search : '';
  const sortParam = sortField !== undefined ? sortField : '';
  const data = await api
    .get<PageableModel<GroupModel>>(
      `${GROUP_MANAGEMENT}?search=${searchParam}&size=${size}&page=${page}&sort=${sortParam},${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const createGroup = async (payload: CreateGroupPayload): Promise<GroupModel> => {
  const data = await api
    .post<GroupModel>(GROUP_MANAGEMENT, payload)
    .then(response => response.data);
  return data;
};
