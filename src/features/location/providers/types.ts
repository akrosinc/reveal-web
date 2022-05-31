export interface GeographicLevel {
  identifier: string;
  title: string;
  name: string;
}

export interface LocationHierarchyModel {
  identifier?: string;
  name: string;
  nodeOrder: string[];
}

export interface LocationModel {
  identifier: string;
  type: string;
  geometry: Geometry;
  properties: Properties;
  children: LocationModel[];
  active?: boolean;
  teams: Organization[];
}

export interface Organization {
  identifier: string;
  name: string;
}

export interface Geometry {
  type: string;
  coordinates: Array<Array<Array<number[]>>>;
}

export interface Properties {
  id: string;
  parentIdentifier: string;
  assigned: boolean;
  childrenNumber: number;
  numberOfTeams: number;
  name: string;
  status: string;
  externalId: string;
  geographicLevel: string;
}

export interface LocationBulkModel {
  identifier: string;
  filename: string;
  uploadDatetime: Date;
  status: LocationBulkStatus;
  uploadedBy: string;
}

export interface LocationBulkDetailsModel {
  name: string;
  status: LocationBulkStatus;
  message: string;
}

export enum LocationBulkStatus {
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  GENERATING_RELATIONSHIPS = 'GENERATING_RELATIONSHIPS'
}
