export interface UserModel {
  identifier: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  tempPassword?: boolean;
  organizations: string[];
  securityGroups: string[];
}