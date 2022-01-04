import { OrganizationModel } from "../../organization/providers/types";

export interface UserModel {
  identifier: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  tempPassword?: boolean;
  organizations: OrganizationModel[];
  securityGroups: string[];
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
}

export enum BulkStatus {
  PROCESSING,
  COMPLETE,
}

export interface BulkDetailsModel {
  username: string;
  message: string;
  status: BulkEntryStatus;
}

export enum BulkEntryStatus {
  ERROR,
  SUCCESSFUL,
}
