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
    title: string;
    min: number;
    max: number;
}