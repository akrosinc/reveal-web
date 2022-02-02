export interface PlanModel {
  identifier: string;
  name: string;
  title: string;
  status: string;
  effectivePeriod: Period;
  locationHierarchy: LocationHierarchy;
  interventionType: InterventionType;
  goals: Goal[];
  jurisdictions: string[];
}

export interface Period {
  start: Date;
  end: Date;
}

export interface PlanCreateModel {
  name: string;
  title: string;
  effectivePeriod: {
    start: string;
    end: string;
  };
  locationHierarchy: string;
  interventionType: string;
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

export interface Goal {
  identifier: string;
  description: string;
  priority: string;
  targets: Target[];
  actions: Action[];
}

export interface Action {
  title: string;
  description: string;
  timingPeriod: Period;
  reason: string;
  formIdentifier: string;
  type: string;
  conditions: ConditionModel[]
}

export interface ConditionModel {
  entity: string;
  entityProperties: string;
  operator: string;
  filterValue: string;
}

export interface Target {
  measure: string;
  detail: Detail;
  due: Date;
}

export interface Detail {
  detailQuantity: DetailQuantity;
}

export interface DetailQuantity {
  value: number;
  comparator: string;
  unit: string;
}
