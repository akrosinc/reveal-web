export interface PlanModel {
  identifier: string;
  name: string;
  title: string;
  status: string;
  effectivePeriod: Period;
  locationHierarchy: LocationHierarchy;
  interventionType: InterventionType;
  goals: Goal[];
}

export interface Period {
  start: Date;
  end: Date;
}

export interface Goal {
  identifier: string;
  description: string;
  priority: string;
  actions: Action[];
}

export enum Priority {
  LOW_PRIORITY = 'LOW_PRIORITY',
  MEDIUM_PRIORITY = 'MEDIUM_PRIORITY',
  HIGH_PRIORITY = 'HIGH_PRIORITY'
}

export interface Action {
  identifier: string;
  title: string;
  description: string;
  timingPeriod: Period;
  formIdentifier: string;
  type: string;
  conditions: ConditionModel[]
}

export interface ConditionModel {
  identifier: string;
  entity: string;
  entityProperty: string;
  operator: string;
  filterValue: string;
  targets: Target[];
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

export interface PlanCreateModel {
  name: string;
  title: string;
  effectivePeriod: {
    start: string;
    end: string;
  };
  locationHierarchy: string;
  interventionType: string;
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