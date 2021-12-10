export interface OrganizationModel {
  identifier: string;
  active: boolean;
  type: OrganizationType;
  partOf: string;
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
  Team = "TEAM",
  Cg = "CG",
  Other = "OTHER",
}
