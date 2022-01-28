export interface PlanModel {
  identifier: string;
  name: string;
  title: string;
  status: string;
  effectivePeriod: {
    start: Date;
    end: Date;
  };
  locationHierarchy: LocationHierarchy;
  interventionType: InterventionType;
  goals: GoalModel[];
  jurisdictions: string[];
}

export interface InterventionType {
    identifier: string;
    name: string;
    code: string;
}

export interface LocationHierarchy {
    identifier: string;
    name: string;
}

export interface GoalModel {
    identifier: string;
    name: string;
}