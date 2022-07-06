export interface EntityTag {
  identifier: string;
  tag: string;
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
}

export interface Person {
  nameUse: string; 
  nameFamily: string
}