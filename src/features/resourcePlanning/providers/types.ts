export interface ResourcePlanningConfig {
  resourcePlanName: string;
  country: { label: string; value: string; ageGroups: AgeGroups[] }[];
  hierarchy: { label: string; value: string };
  lowestLocation: { label: string; value: string };
  populationTag: { label: string; value: string };
  structureCount: boolean;
  structureCountTag: { label: string; value: string };
}

export interface ResourceCountry {
  identifier: string;
  name: string;
  ageGroups: AgeGroups[];
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

export interface ResourceQuestionStepTwo {
  country: string;
  questions: ResourceQuestion[];
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

export interface ResourceDashboardRequest {
  name: string;
  country: string;
  campaign: string;
  locationHierarchy: string;
  lowestGeography: string;
  populationTag: string;
  structureCountTag: string | undefined;
  countBasedOnImportedLocations: boolean;
  stepOneAnswers: any;
  stepTwoAnswers: any;
  minimalAgeGroup: string;
}

export interface ResourceDashboardResponse {
  identifier: string;
  name: string;
  columnDataMap: { [x: string]: CampaignValue };
  hierachy: string[];
  request: ResourceDashboardRequest;
}
export interface CampaignValue {
  value: number;
  isPercentage: boolean;
  meta: null;
  dataType: string;
}

export interface ResourcePlanningHistory {
  identifier: string;
  name: string;
  createdBy: string;
  created: string;
}
