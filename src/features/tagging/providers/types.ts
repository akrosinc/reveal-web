import { Owners } from '../../metaDataImport/type';

export interface Tag {
  identifier: string;
  tag: string;
  valueType: string;
  definition: string;
  fieldType: string;
  addToMetadata: boolean;
  simulationDisplay: boolean;
  owner: boolean;
  owners: Owners[];
  referencedTag: String;
  aggregate: boolean;
  children?: Tag[];
  deleting: boolean;
}

export interface TagCreateRequest {
  tag: string;
  valueType: string;
  definition: string;
  aggregationMethod: string[];
  addToMetadata: boolean;
  tags: TagItem[];
}

export interface TagItem {
  name: string;
}

export interface TagUpdateRequest {
  identifier: string;
  simulationDisplay: boolean;
}

export enum EntityTypeEnum {
  PERSON_CODE = 'PERSON_CODE',
  LOCATION_CODE = 'LOCATION_CODE'
}
