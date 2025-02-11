import api from '../../../../../api/axios';
import { toast } from 'react-toastify';
import { OrganizationModel } from '../../../../../features/organization/providers/types';
import { ORGANIZATION, USER } from '../../../../../constants';
import axios, { AxiosResponse } from 'axios';
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  organizations: string[];
  password: string;
  securityGroups: string[];
  username: string;

}
export interface MemberModel {
  identifier: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  username: string;
}

export interface UserModel {
  identifier: string;
  sid: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  tempPassword?: boolean;
  organizations: OrganizationModel[];
  securityGroups: string[];
  selectedAll?: boolean;
}
export interface UserListResponse {
  content: UserModel[];
  totalElements: number;
  totalPages: number;
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  numberOfElements: number;
  number: number;
  size: number;
  empty: boolean;
  first: boolean;
  last: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

export interface CreateUserResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizations: string[];
  securityGroups: string[];
  username: string;
  success?: boolean;
}

export interface AddUserToOrganizationRequest {
  username: string;
}

export interface AddUserToOrganizationResponse {
  success: boolean;
  message: string;
}

export const getUserList = async (
  search?: string,
  filters?: { firstName?: string; lastName?: string; email?: string },
  sortField?: string,
  direction?: boolean
): Promise<UserModel[]> => {
  const params = new URLSearchParams();

  if (search) params.append('search', search);

  if (filters) {
    if (filters.firstName) params.append('firstName', filters.firstName);
    if (filters.lastName) params.append('lastName', filters.lastName);
    if (filters.email) params.append('email', filters.email);
  }

  if (sortField) {
    params.append('sort', `${sortField},${direction ? 'asc' : 'desc'}`);
  }

  const response = await api.get<UserListResponse>(`${USER}?${params.toString()}`);

  return response.data.content;
};

export const createUser = async (data: CreateUserRequest): Promise<AxiosResponse | null> => {
  try {
    const response: AxiosResponse = await api.post('/user', data);
    return response; 
  } catch (error) {
    console.error('Error creating user:', error);
    return null; 
  }
};

// create

export const createOrganization = async (organization: any): Promise<OrganizationModel> => {
  const data = await api.post<OrganizationModel>(ORGANIZATION, organization).then(response => response.data);
  return data;
};

export const getOrganizationMembers = async (organizationId: string): Promise<MemberModel[]> => {
  try {
    const response = await api.get<MemberModel[]>(`/organization/${organizationId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching organization members:', error);
    throw error;
  }
};

export const addUserToOrganization = async (organizationId: string, username: string) => {
  try {
    const response = await api.post(`/organization/${organizationId}/members`, username);
    return response.data;
  } catch (error) {
    console.error('Error adding user to organization:', error);
    throw error;
  }
};

export const deleteUserFromOrganization = async (organizationId: string, username: string) => {
  try {
    const response = await api.delete(`/organization/${organizationId}/members/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user from organization:', error);
    throw error;
  }
};
