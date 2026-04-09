import api from '../../../api/axios';
import { INSTANCE, META_IMPORT_DATASET, COMPLEX_TAG } from '../../../constants/urls';
import { PageableModel } from '../../../api/providers';
import { LOCATION_HIERARCHY } from '../../../constants/urls';
import { LocationModel } from '../../location/providers/types';

export interface InstanceResponse {
  identifier: string;
  name: string;
  planResponse?: PlanResponse;
  plan?: PlanResponse;
  members: InstanceMember[];
  areas: InstanceArea[];
  locationHierarchy: InstanceLocationHierarchy[];
  datasets?: any[];
  instanceName?: string;
  datasets_tags?: string[];
  complexTags?: number[];
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

export interface CreateInstanceRequest {
  planRequest: {
    name: string;
    title: string;
    effectivePeriod: {
      start: string;
      end: string;
    };
    interventionType: string;
    locationHierarchy: string;
    goals: {
      description: string;
      priority: string;
      actions: {
        title: string;
        description: string;
        timingPeriod: {
          start: string;
          end: string;
        };
        formIdentifier: string;
        type: string;
        conditions?: any[];
      }[];
    }[];
    hierarchyLevelTarget?: string;
  };
  instanceName: string;
  locationHierarchy: string;
  areas: string[];
  members: string[];
  datasets_tags: string[];
  complexTags: number[];
}

/**
 * Create a new instance
 * @param payload CreateInstanceRequest
 * @returns InstanceResponse
 */
export const createInstance = async (payload: CreateInstanceRequest): Promise<InstanceResponse> => {
  const response = await api.post<InstanceResponse>(INSTANCE, payload);
  return response.data;
};

/**
 * Get locations by hierarchy identifier
 * @returns LocationModel
 */
export const getLocationsByHierarchyIdentifier = async (
  size: number,
  page: number,
  identifier: string,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<LocationModel[]> => {
  const data = await api
    .get<LocationModel[]>(
      `locationHierarchy/location/byhierarchy/${identifier}?search=${search !== undefined ? search : ''
      }&size=${size}&page=${page}&sort=${sortField !== undefined ? sortField : ''},${direction ? 'asc' : 'desc'
      }&_summary=${summary.toString()}`
    )
    .then(response => response.data);
  return data;
};

/**
 * Get instance by identifier
 * @param identifier
 * @returns InstanceResponse
 */
export const getInstanceByIdentifier = async (
  identifier: string
): Promise<InstanceResponse> => {
  const response = await api.get<InstanceResponse>(`${INSTANCE}/${identifier}`);
  return response.data;
};

export interface UpdateInstanceRequest {
  planRequest: {
    name: string;
    title: string;
    effectivePeriod: {
      start: string;
      end: string;
    };
    interventionType: string;
    locationHierarchy: string;
    goals: {
      description: string;
      priority: string;
      actions: {
        title: string;
        description: string;
        timingPeriod: {
          start: string;
          end: string;
        };
        formIdentifier: string;
        type: string;
        conditions?: any[];
      }[];
    }[];
    hierarchyLevelTarget?: string;
  };
  instanceName: string;
  locationHierarchy: string;
  areas: string[];
  members: string[];
  datasets_tags: string[];
  complexTags: number[];
}

/**
 * Update instance by identifier
 * @param identifier
 * @param payload UpdateInstanceRequest
 * @returns InstanceResponse
 */
export const updateInstance = async (
  identifier: string,
  payload: UpdateInstanceRequest
): Promise<InstanceResponse> => {
  const response = await api.put<InstanceResponse>(`${INSTANCE}/${identifier}`, payload);
  return response.data;
};

export interface DatasetEntityTag {
  identifier: string;
  tag: string;
  instances: string[];
  isPublic: boolean;
}

export interface DatasetResponse {
  identifier: string;
  datasetName: string;
  uploadDatetime: string;
  uploadedBy: string;
  datasetEntityTags: DatasetEntityTag[];
}

/**
 * Get list of datasets for instances
 * @param isPublic optional boolean filter
 * @returns PageableModel<DatasetResponse>
 */
export const getInstanceDatasets = async (locationHierarchy: string, isPublic?: boolean): Promise<PageableModel<DatasetResponse>> => {
  let url = `${META_IMPORT_DATASET}?hierarchyIdentifier=${locationHierarchy}`;
  if (isPublic !== undefined) {
    url += `&isPublic=${isPublic}`;
  }
  const response = await api.get<PageableModel<DatasetResponse>>(url);
  return response.data;
};
/**
 * Activate an instance plan
 * @param identifier
 * @returns
 */
export const activateInstance = async (identifier: string): Promise<any> => {
  const response = await api.post(`${INSTANCE}/${identifier}/plan/activate`);
  return response.data;
};

export interface ComplexTagResponse {
  id: number;
  tagName: string;
  formula: string;
  isPublic: boolean;
  owner: string;
}

/**
 * Get list of complex tags for instances
 * @param locationHierarchy
 * @param isPublic optional boolean filter
 * @returns PageableModel<ComplexTagResponse>
 */
export const getComplexTags = async (locationHierarchy: string, isPublic?: boolean): Promise<PageableModel<ComplexTagResponse>> => {
  let url = `${COMPLEX_TAG}?hierarchyIdentifier=${locationHierarchy}`;
  if (isPublic !== undefined) {
    url += `&isPublic=${isPublic}`;
  }
  const response = await api.get<PageableModel<ComplexTagResponse>>(url);
  return response.data;
};
