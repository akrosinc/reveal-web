import { LookupEntityType } from '../../planSimulation/providers/types';

export interface Tag {
  identifier: string;
  tag: string;
  valueType: string;
  definition: string;
  fieldType: string;
  lookupEntityType: LookupEntityType;
  resultExpression: string;
  generationFormula: string;
  referenceFields: string[];
  isResultLiteral: boolean;
  isGenerated: boolean;
  addToMetadata: boolean;
  simulationDisplay: boolean;
}

export interface TagCreateRequest {
  tag: string;
  valueType: string;
  definition: string;
  entityType: EntityTypeEnum;
  formFieldNames: any;
  generated: boolean;
  referencedFields: string[];
  aggregationMethod: string[];
  generationFormula: string;
  scope: string;
  resultExpression: string;
  isResultLiteral: boolean;
  addToMetadata: boolean;
}

export interface TagUpdateRequest {
  identifier: string;
  simulationDisplay: boolean;
}

export enum EntityTypeEnum {
  PERSON_CODE = "PERSON_CODE",
  LOCATION_CODE = "LOCATION_CODE"
}