export interface ResourcePlanningConfig {
  country: { label: string; value: string }[];
  hierarchy: { label: string; value: string };
  lowestLocation: { label: string; value: string };
  populationTag: { label: string; value: string };
  structureCount: boolean;
  structureCountTag: { label: string; value: string };
}

export interface ResourceCountry {
    identifier: string;
    name: string;
    ageGroups: AgeGroups[]
}

export interface AgeGroups {
    name: string;
    key: string;
    min: number;
    max: number;
}

export interface ResourceCampaign {
  identifier: string;
  name: string;
  drugs: DrugResponse[];
}

interface DrugResponse {
  name: string;
  min: number;
  max: number;
  half: boolean;
  full: boolean;
  millis: boolean;
  key: string;
}

export interface ResourceQuestion {
  question: string;
  fieldName: string;
  fieldType: FieldType;
  skipPattern: SkipPattern;
}

interface FieldType {
  inputType: 'STRING' | 'INTEGER' | 'DECIMAL' | 'DROPDOWN';
  values: string[];
  min: number;
  max: number;
}

interface SkipPattern {
  skipFieldName: string;
  skipValue: string;
}