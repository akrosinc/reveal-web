import { OrgGrant, UserGrant } from '../../planSimulation/providers/types';

export interface OrganizationModel {
  identifier: string;
  active: boolean;
  type: OrganizationType;
  partOf: string;
  headOf: OrganizationModel[];
  name: string;
}

export interface OrganizationType {
  code: Code;
  valueCodableConcept: string;
}

export interface OrganizationPartOf {
  identifier: string;
}

export enum Code {
  Team = 'TEAM',
  Cg = 'CG',
  Other = 'OTHER'
}

export interface Groups {
  id: string;
  name: string;
  path: string;
  subgroups: Groups[];
}

export interface EntityTagAccessRequest {
  identifier: string;
  public?: boolean;
  resultingOrgs?: OrgGrant[];
  resultingUsers?: UserGrant[];
}

export interface ComplexTagAccessRequest {
  id: string;
  public?: boolean;
  resultingOrgs?: OrgGrant[];
  resultingUsers?: UserGrant[];
}
