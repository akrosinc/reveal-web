import { BulkStatus } from "../../user/providers/types";

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
  type:       string;
  geometry:   Geometry;
  properties: Properties;
}

export interface Geometry {
  type:        string;
  coordinates: Array<Array<Array<number[]>>>;
}

export interface Properties {
  name:            string;
  status:          string;
  externalId:      string;
  geographicLevel: string;
}

export interface LocationBulkModel {
  identifier: string;
  filename: string;
  uploadDatetime: Date;
  status: BulkStatus;
}

export interface LocationBulkDetailsModel {
  name: string;
  status: BulkStatus;
  message: string;
}