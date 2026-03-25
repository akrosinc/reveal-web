import { OrganizationModel } from '../../organization/providers/types';

export interface UserModel {
  identifier: string;
  sid: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  tempPassword?: boolean;
  organizations?: OrganizationModel[];
  instances?: string[];
  securityGroups: string[];
  selectedAll?: boolean;
}

export interface CreateUserModel {
  username: string;
  firstName: string;
  lastName: string;
  email: string | null;
  password: string;
  tempPassword?: boolean;
  organizations?: string[];
  securityGroups: string[];
}

export interface EditUserModel {
  identifier: string;
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
  tempPassword?: boolean;
  organizations?: string[];
  securityGroups: string[];
}

export interface UserBulk {
  identifier: string;
  filename: string;
  uploadDatetime: Date;
  status: BulkStatus;
  uploadedBy: string;
}

export enum BulkStatus {
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE'
}

export interface BulkDetailsModel {
  username: string;
  message: string;
  status: BulkEntryStatus;
}

export enum BulkEntryStatus {
  ERROR,
  SUCCESSFUL
}

export interface UserInstanceModel {
  identifier: string;
  interventionType: string;
  planIdentifier: string;
  instanceName: string;
  createdDatetime: string;
  planStatus: string;
  startDate: string;
  endDate: string;
  planTitle: string;
}
