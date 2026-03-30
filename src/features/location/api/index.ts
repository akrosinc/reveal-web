import {
  GeographicLevel,
  LocationBulkModel,
  LocationHierarchyModel,
  LocationModel,
  LocationBulkDetailsModel
} from '../providers/types';
import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { GENERATED_LOCATION_HIERARCHY, GEOGRAPHIC_LEVEL, LOCATION, LOCATION_HIERARCHY, LOCATION_HIERARCHY_BASE, LOCATION_HIERARCHY_ACTIVATE } from '../../../constants';
import { toast } from 'react-toastify';

export interface LocationHierarchyBaseResponse {
  identifier: string;
  name: string;
  type: string;
  nodeOrder: string[];
  geoTree: GeoTreeNode[];
}

export interface GeoTreeNode {
  identifier: string;
  type: string;
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: GeoTreeProperties;
  active: boolean;
  teams: Team[];
  selected: boolean;
}

export interface GeoTreeProperties {
  name: string;
  status: string;
  externalId: string;
  geographicLevel: string;
  numberOfTeams: number;
  assigned: boolean;
  parentIdentifier: string;
  childrenNumber: number;
  distCoveragePercent: any;
  numberOfChildrenTreated: any;
  numberOfChildrenEligible: any;
  sprayCoverage: any;
  id: string;
  columnDataMap: Record<string, ColumnData>;
  persons: Person[];
  metadata: Metadata[];
  businessStatus: string;
  statusColor: string;
  levelColor: string;
  geographicLevelNodeNumber: number;
  parent: string;
  population: Population;
  numberOfStructures: number;
  xcentroid: number;
  ycentroid: number;
  simulationSearchResult: boolean;
}

export interface ColumnData {
  value: any;
  isPercentage: boolean;
  meta: string;
  dataType: string;
  key: string;
}

export interface Person {
  coreFields: {
    identifier: string;
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    birthDateApprox: boolean;
  };
  metadata: Metadata[];
}

export interface Metadata {
  value: any;
  type: string;
  fieldType: string;
  datasetId: string;
}

export interface Population {
  female: number;
  male: number;
  sum: number;
  Pyramids: PopulationPyramid[];
}

export interface PopulationPyramid {
  AgeGroup: string;
  MalePop: number;
  FemalePop: number;
  TotalPop: number;
}

export interface Team {
  identifier: string;
  name: string;
  type: {
    code: string;
    valueCodableConcept: string;
  };
  active: boolean;
  partOf: string;
  headOf: string[];
  members: TeamMember[];
}

export interface TeamMember {
  identifier: string;
  sid: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  securityGroups: string[];
}

export const getGeographicLevelList = async (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<GeographicLevel>> => {
  const data = await api
    .get<PageableModel<GeographicLevel>>(
      GEOGRAPHIC_LEVEL +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getGeographicLevelById = async (id: string): Promise<GeographicLevel> => {
  const data = await api.get<GeographicLevel>(GEOGRAPHIC_LEVEL + `/${id}`).then(response => response.data);
  return data;
};

export const createGeographicLevel = async (formData: { name: string; title: string }): Promise<GeographicLevel> => {
  const data = await api.post<GeographicLevel>(GEOGRAPHIC_LEVEL, formData).then(response => response.data);
  return data;
};

export const updateGeographicLevel = async (formData: GeographicLevel): Promise<GeographicLevel> => {
  const data = await api
    .put<GeographicLevel>(GEOGRAPHIC_LEVEL + `/${formData.identifier}`, formData)
    .then(response => response.data);
  return data;
};

export const deleteGeographicLevel = async (identifier: string): Promise<GeographicLevel> => {
  const data = await api.delete<GeographicLevel>(GEOGRAPHIC_LEVEL + `/${identifier}`).then(response => response.data);
  return data;
};

export const getLocationHierarchyList = async (
  size: number,
  page: number,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<LocationHierarchyModel>> => {
  const data = await api
    .get<PageableModel<LocationHierarchyModel>>(
      LOCATION_HIERARCHY +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}&_summary=${summary.toString()}`
    )
    .then(response => response.data);
  return data;
};

export const getGeneratedLocationHierarchyList = async (): Promise<LocationHierarchyModel[]> => {
  const data = await api
    .get<LocationHierarchyModel[]>(GENERATED_LOCATION_HIERARCHY + '/simulationHierarchy')
    .then(response => response.data);
  return data;
};

export const getGenericHierarchyById = async (id: string, type?: string): Promise<LocationHierarchyModel> => {
  const data = await api
    .get<LocationHierarchyModel>(GENERATED_LOCATION_HIERARCHY + '/simulationHierarchy/' + id + '/' + type)
    .then(response => response.data);
  return data;
};

export const getHierarchyById = async (id: string): Promise<LocationHierarchyModel> => {
  const data = await api.get<LocationHierarchyModel>(LOCATION_HIERARCHY + `/${id}`).then(response => response.data);
  return data;
};

export const createLocationHierarchy = async (formData: {
  name: string;
  nodeOrder: string[];
}): Promise<LocationHierarchyModel> => {
  const data = await api.post<LocationHierarchyModel>(LOCATION_HIERARCHY, formData).then(response => response.data);
  return data;
};

export const createLocationHierarchyBase = async (formData: {
  name: string;
  nodeOrder: string[];
}): Promise<LocationHierarchyBaseResponse> => {
  const data = await api.post<LocationHierarchyBaseResponse>(LOCATION_HIERARCHY_BASE, formData).then(response => response.data);
  return data;
};

export const deleteLocationHierarchy = async (identifier: string): Promise<string> => {
  const data = await api.delete<string>(LOCATION_HIERARCHY + `/${identifier}`).then(response => response.data);
  return data;
};

export const getLocationList = async (
  size: number,
  page: number,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<LocationModel>> => {
  const data = await api
    .get<PageableModel<LocationModel>>(
      LOCATION +
        `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}&_summary=${summary.toString()}`
    )
    .then(response => response.data);
  return data;
};

export const getLocationListByHierarchyId = async (
  size: number,
  page: number,
  identifier: string,
  summary: boolean,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<LocationModel>> => {
  const data = await api
    .get<PageableModel<LocationModel>>(
      LOCATION_HIERARCHY +
        `/${identifier}/location?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
          sortField !== undefined ? sortField : ''
        },${direction ? 'asc' : 'desc'}&_summary=${summary.toString()}`
    )
    .then(response => response.data);
  return data;
};

export const getLocationById = async (id: string): Promise<LocationModel> => {
  const data = await api.get<LocationModel>(LOCATION + `/${id}`).then(response => response.data);
  return data;
};

export const getLocationByIdAndPlanId = async (id: string, planId: string): Promise<LocationModel> => {
  const data = await api.get<LocationModel>(LOCATION + `/${id}/${planId}`).then(response => response.data);
  return data;
};

export const getLocationBulkList = async (
  size: number,
  page: number,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<LocationBulkModel>> => {
  const data = await api
    .get<PageableModel<LocationBulkModel>>(
      LOCATION +
        `/bulk?size=${size}&page=${page}&sort=${sortField !== undefined ? sortField : ''},${direction ? 'asc' : 'desc'}`
    )
    .then(response => response.data);
  return data;
};

export const getLocationBulkListById = async (
  size: number,
  page: number,
  id: string,
  status: string,
  search?: string
): Promise<PageableModel<LocationBulkDetailsModel>> => {
  const data = await api
    .get<PageableModel<LocationBulkDetailsModel>>(LOCATION + `/bulk/${id}?size=${size}&page=${page}&status=${status}`)
    .then(response => response.data);
  return data;
};

export const uploadLocationJSON = async (json: FormData, toastId: string): Promise<{ identifier: string }> => {
  const data = await api
    .post<{ identifier: string }>(LOCATION + '/bulk', json, {
      onUploadProgress: p => {
        const progress = p.loaded / p.total;
        toast.update(toastId, { progress, render: 'JSON file is uploading... ' + Math.round(progress * 100) + '%' });
      }
    })
    .then(response => response.data);
  return data;
};

export const validateLocationJSON = async (json: FormData, toastId: string): Promise<BlobPart> => {
  const data = await api
    .post<BlobPart>(LOCATION + '/bulk/validate', json, {
      onUploadProgress: p => {
        const progress = p.loaded / p.total;
        toast.update(toastId, { progress, render: 'JSON file is validating... ' + Math.round(progress * 100) + '%' });
      }
    })
    .then(response => response.data);
  return data;
};

export const getLocationHierarchyBase = async (): Promise<LocationHierarchyBaseResponse> => {
  const data = await api.get<LocationHierarchyBaseResponse>(LOCATION_HIERARCHY_BASE).then(response => response.data);
  return data;
};

export const activateLocationHierarchy = async (identifier: string): Promise<LocationHierarchyBaseResponse> => {
  const data = await api.post<LocationHierarchyBaseResponse>(LOCATION_HIERARCHY_ACTIVATE + `/${identifier}`).then(response => response.data);
  return data;
};
