import { OrganizationModel } from "../../organization/providers/types";

export interface UserModel {
  identifier: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  tempPassword?: boolean;
  organizations: OrganizationModel[];
  securityGroups: string[];
}

export interface CreateUserModel {
  userName: string;
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