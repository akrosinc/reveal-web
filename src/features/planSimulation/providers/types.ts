import { Feature, MultiPolygon, Polygon, Properties } from '@turf/turf';
import { LngLatBounds } from 'mapbox-gl';

export interface EntityTag {
  identifier: string;
  tag: string;
  fieldType: string;
  valueType: string;
  lookupEntityType: LookupEntityType;
  more: EntityTag[];
  range?: [EntityTag, EntityTag];
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
  metadata: {
    [x: string]: string;
  };
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
  features: Feature<MultiPolygon | MultiPolygon, Properties>[];
  parents: Feature<Polygon | MultiPolygon, Properties>[];
}
