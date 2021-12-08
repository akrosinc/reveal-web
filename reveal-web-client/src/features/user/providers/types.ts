export interface UserModel {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  tempPassword: string;
  organization: [string];
  securityGroups: [string];
}
