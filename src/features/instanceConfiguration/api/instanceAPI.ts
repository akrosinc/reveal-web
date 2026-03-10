import api from '../../../api/axios';
import { INSTANCE } from '../../../constants/urls';
import { PageableModel } from '../../../api/providers';

export interface InstanceResponse {
  identifier: string;
  name: string;
  planResponse: PlanResponse;
  members: InstanceMember[];
  areas: InstanceArea[];
  locationHierarchy: InstanceLocationHierarchy[];
}

export interface PlanResponse {
  identifier: string;
  name: string;
  title: string;
  status: string;
  date: string;
  effectivePeriod: {
    start: string;
    end: string;
  };
  locationHierarchy: InstanceLocationHierarchy;
  interventionType: InterventionType;
  goals: GoalResponse[];
  planTargetType: string;
}

export interface InterventionType {
  identifier: string;
  name: string;
  code: string;
}

export interface GoalResponse {
  identifier: string;
  priority: string;
  description: string;
  actions: ActionResponse[];
}

export interface ActionResponse {
  identifier: string;
  title: string;
  description: string;
  timingPeriod: {
    start: string;
    end: string;
  };
  subject: string;
  type: string;
  conditions: ConditionResponse[];
  formIdentifier: string;
}

export interface ConditionResponse {
  identifier: string;
  entity: string;
  operator: string;
  filterValue: string;
  entityProperty: string;
  targets: TargetResponse[];
}

export interface TargetResponse {
  identifier: string;
  measure: string;
  value: number;
  comparator: string;
  unit: string;
  due: string;
}

export interface InstanceMember {
  identifier: string;
  name: string;
}

export interface InstanceArea {
  identifier: string;
  type: string;
  geometry: any;
  isActive: boolean;
  properties: any;
  ancestry: string[];
  aggregates: any;
  teams: any[];
}

export interface InstanceLocationHierarchy {
  identifier: string;
  name: string;
  type: string;
  nodeOrder: string[];
  geoTree: any[];
}

/**
 * Get list of instances
 * @param size
 * @param page
 * @param sortField
 * @param direction
 * @returns
 */
export const getInstances = async (
  size?: number,
  page?: number,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<InstanceResponse>> => {
  const params = new URLSearchParams();
  if (size !== undefined) params.append('size', size.toString());
  if (page !== undefined) params.append('page', page.toString());
  if (sortField) {
    params.append('sort', `${sortField},${direction ? 'asc' : 'desc'}`);
  }

  const response = await api.get<PageableModel<InstanceResponse>>(`${INSTANCE}?${params.toString()}`);
  return response.data;
};
