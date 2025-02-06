import api from '../../../../../api/axios';
import { toast } from 'react-toastify';
import { OrganizationModel } from '../../../../../features/organization/providers/types';
import { USER } from '../../../../../constants';
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
  id: string;
  name: string;
  email: string;
  role: string;
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

export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse | null> => {
  try {
    const response = await api.post<CreateUserResponse>('/user', data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const getOrganizationMembers = async (organizationId: string): Promise<MemberModel[]> => {
  try {
    const response = await api.get<MemberModel[]>(`/api/v1/organization/${organizationId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching organization members:', error);
    throw error;
  }
};
