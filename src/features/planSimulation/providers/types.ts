import { Feature, MultiPolygon, Polygon, Properties, Point } from '@turf/turf';
import { LngLatBounds } from 'mapbox-gl';

export interface EntityTag {
  identifier: string;
  tag: string;
  definition: string;
  fieldType: string;
  valueType: string;
  subType?: string;
  more: EntityTag[];
  range?: [EntityTag, EntityTag];
  simulationDisplay: boolean;
}
export interface LookupEntityType {
  identifier: string;
  code: string;
  tableName: string;
}

export enum OperatorSignEnum {
  EQUAL = 'EQ',
  GRATER_THAN = 'GT',
  GRATER_THAN_EQUAL = 'GTE',
  LESS_THAN = 'LT',
  LESS_THAN_EQUAL = 'LTE'
}

export interface SearchLocationProperties {
  identifier: string;
  name: string;
  persons: Person[];
  metadata: Metadata[];
  bounds: LngLatBounds;
}

export interface Person {
  coreFields: {
    identifier: string;
    firstName: string;
    lastName: string;
  };
}

export interface PlanningLocationResponse {
  identifier: string | undefined;
  type: 'FeatureCollection';
  features: Feature<Point | Polygon | MultiPolygon, Properties>[];
  parents: Feature<Point | Polygon | MultiPolygon, Properties>[];
}

export interface RevealFeature {
  identifier: string | undefined;
  geometry: Point | Polygon | MultiPolygon;
  properties: Properties;
  type: 'Feature';
  children: any[] | undefined;
  aggregates: any[] | undefined;
  ancestry: any[] | undefined;
}

export interface PlanningLocationResponseTagged {
  identifier: string | undefined;
  type: 'FeatureCollection';
  features: RevealFeatureTagged;
  parents: RevealFeatureTagged;
}

export interface PlanningParentLocationResponse {
  identifier: string | undefined;
  type: 'FeatureCollection';
  features: Feature<Point | Polygon | MultiPolygon, Properties>[];
  featureCount: number;
}

export interface RevealFeatureTagged {
  [identifier: string]: RevealFeature;
}

export interface PersonMeta {
  metadata: Metadata[];
  coreFields: {
    [x: string]: string;
  };
}

export interface Metadata {
  value: string;
  type: string;
  fieldType?: string;
}
export interface MetadataObj {
  [key: string]: any;
}
export interface LocationMetadataObj {
  [key: string]: MetadataObj;
}
export interface MetadataDefinition {
  [key: string]: string;
}
