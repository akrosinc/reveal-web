import { Feature, MultiPolygon, Polygon, Properties, Point } from '@turf/turf';
import { LngLatBounds } from 'mapbox-gl';
import { AnalysisLayer } from '../components/Simulation';
import { TagWithFormulaSymbol } from '../components/MetadataFormula/MetadataFormulaPanel';
import { Owners } from '../../metaDataImport/type';

export enum HierarchyType {
  GENERATED = 'generated',
  SAVED = 'saved'
}

export interface TagResponse {
  entityTagResponses: EntityTag[];
  complexTagDtos: ComplexTagResponse[];
}

export interface EntityTag {
  identifier: string;
  tag: string;
  definition: string;
  fieldType: string;
  valueType: string;
  subType?: string;
  more: EntityTag[];
  range?: [EntityTag, EntityTag];
  simulationDisplay: boolean;
  aggregate: boolean;
  created: boolean;
  generated: boolean;
  referencedTag?: string;
  tagAccGrantsOrganization?: string[];
  tagAccGrantsUser?: string[];
  public?: boolean;
  children?: EntityTag[];
  selected?: boolean;
  levels?: string[];
}

export class BaseTag {
  identifier: string;
  tag: string;
  public?: boolean;
  tagAccGrantsOrganization?: OrgGrant[];
  tagAccGrantsUser?: UserGrant[];
  resultingOrgs?: OrgGrant[];
  resultingUsers?: UserGrant[];
  selected?: boolean;
  owner: boolean;
  owners: Owners[];

  constructor(
    identifier: string,
    tag: string,
    owner: boolean,
    owners: Owners[],
    publicval?: boolean,
    tagAccGrantsOrganization?: OrgGrant[],
    tagAccGrantsUser?: UserGrant[],
    resultingOrgs?: OrgGrant[],
    resultingUsers?: UserGrant[],
    selected?: boolean
  ) {
    this.identifier = identifier;
    this.tag = tag;
    this.public = publicval;
    this.tagAccGrantsOrganization = tagAccGrantsOrganization;
    this.tagAccGrantsUser = tagAccGrantsUser;
    this.resultingUsers = resultingUsers;
    this.resultingOrgs = resultingOrgs;
    this.selected = selected;
    this.owner = owner;
    this.owners = owners;
  }
}

export class EntityTagResponse extends BaseTag {
  definition: string;
  valueType: string;
  aggregate: boolean;
  created: boolean;
  metadataImportId: string;
  referencedTag?: string;
  children?: EntityTagResponse[];

  constructor(
    identifier: string,
    tag: string,
    owner: boolean,
    owners: Owners[],
    definition: string,
    valueType: string,
    aggregate: boolean,
    created: boolean,
    metadataImportId: string,
    referencedTag?: string,
    tagAccGrantsOrganization?: OrgGrant[],
    tagAccGrantsUser?: UserGrant[],
    publicVal?: boolean,
    children?: EntityTagResponse[],
    selected?: boolean,
    resultingOrgs?: OrgGrant[],
    resultingUsers?: UserGrant[]
  ) {
    super(
      identifier,
      tag,
      owner,
      owners,
      publicVal,
      tagAccGrantsOrganization,
      tagAccGrantsUser,
      resultingOrgs,
      resultingUsers,
      selected
    );
    this.definition = definition;
    this.valueType = valueType;
    this.aggregate = aggregate;
    this.created = created;
    this.metadataImportId = metadataImportId;
    this.referencedTag = referencedTag;
    this.children = children;
  }
}

export class ComplexTagResponse extends BaseTag {
  id: string;
  hierarchyId: string;
  hierarchyType: string;
  tagName: string;
  tags: TagWithFormulaSymbol[];
  formula: string;
  calculateValue?: number;

  constructor(
    id: string,
    hierarchyId: string,
    hierarchyType: string,
    tagName: string,
    tags: TagWithFormulaSymbol[],
    formula: string,
    owner: boolean,
    owners: Owners[],
    calculateValue?: number,
    publicVal?: boolean,
    tagAccGrantsOrganization?: OrgGrant[],
    tagAccGrantsUser?: UserGrant[],
    selected?: boolean,
    resultingOrgs?: OrgGrant[],
    resultingUsers?: UserGrant[]
  ) {
    super(
      id,
      tagName,
      owner,
      owners,
      publicVal,
      tagAccGrantsOrganization,
      tagAccGrantsUser,
      resultingOrgs,
      resultingUsers,
      selected
    );
    this.id = id;
    this.hierarchyId = hierarchyId;
    this.hierarchyType = hierarchyType;
    this.tagName = tagName;
    this.tags = tags;
    this.formula = formula;
    this.calculateValue = calculateValue;
  }
}

export interface UserGrant {
  id: string;
  username: string;
}

export interface OrgGrant {
  id: string;
  name: string;
}

export interface EntityTagMap {
  [tagName: string]: EntityTag;
}

export interface LookupEntityType {
  identifier: string;
  code: string;
  tableName: string;
}

export enum OperatorSignEnum {
  EQUAL = 'EQ',
  GRATER_THAN = 'GT',
  GRATER_THAN_EQUAL = 'GTE',
  LESS_THAN = 'LT',
  LESS_THAN_EQUAL = 'LTE'
}

export interface SearchLocationProperties {
  identifier: string;
  name: string;
  persons: Person[];
  metadata: Metadata[];
  bounds: LngLatBounds;
}

export interface Person {
  coreFields: {
    identifier: string;
    firstName: string;
    lastName: string;
  };
}

export interface PlanningLocationResponse {
  identifier: string | undefined;
  type: 'FeatureCollection';
  features: Feature<Point | Polygon | MultiPolygon, Properties>[];
  parents: Feature<Point | Polygon | MultiPolygon, Properties>[];
  method?: AnalysisLayer;
  source?: 'messageHandler' | 'parentHandler' | 'uploadHandler';
}

export interface RevealFeature {
  identifier: string | undefined;
  geometry: Point | Polygon | MultiPolygon;
  properties: Properties;
  type: 'Feature';
  children: any[] | undefined;
  aggregates: any[] | undefined;
  ancestry: any[] | undefined;
  method?: AnalysisLayer[];
}

export interface PlanningLocationResponseTagged {
  identifier: string | undefined;
  type: 'FeatureCollection';
  features: RevealFeatureTagged;
  parents: RevealFeatureTagged;
  method?: AnalysisLayer[];
  source?: 'messageHandler' | 'parentHandler' | 'uploadHandler';
}

export interface PlanningParentLocationResponse {
  identifier: string | undefined;
  type: 'FeatureCollection';
  features: Feature<Point | Polygon | MultiPolygon, Properties>[];
  featureCount: number;
}

export interface RevealFeatureTagged {
  [identifier: string]: RevealFeature;
}

export interface PersonMeta {
  metadata: Metadata[];
  coreFields: {
    [x: string]: string;
  };
}

export interface Metadata {
  value: string;
  type: string;
  fieldType?: string;
}

export interface MetadataObj {
  [key: string]: any;
}

export interface LocationMetadataObj {
  [key: string]: MetadataObj;
}

export interface MetadataDefinition {
  [key: string]: string;
}

export interface Instance {
  identifier: string;
  interventionType: string;
  planIdentifier: string;
  instanceName: string;
  createdDatetime: string;
  planStatus: string;
  startDate: string;
  endDate: string;
  planTitle: string;
}

export interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

export interface Pageable {
  sort: Sort;
  paged: boolean;
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  number: number;
  sort: Sort;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  content: T[];
  empty: boolean;
}

export interface InstanceHierarchyNode {
  identifier: string;
  type: string;
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: HierarchyProperties;
  active: boolean;
  teams: Team[];
  selected: boolean;
}

export interface GeoConfig {
  identifier: string;
  name: string;
  nodeOrder: string[];
  geoTree: InstanceHierarchyNode[];
}

export interface HierarchyProperties {
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
  columnDataMap: {
    [key: string]: {
      value: any;
      isPercentage: boolean;
      meta: string;
      dataType: string;
      key: string;
    };
  };
  persons: {
    coreFields: {
      identifier: string;
      firstName: string;
      lastName: string;
      gender: string;
      birthDate: string;
      birthDateApprox: boolean;
    };
    metadata: Metadata[];
  }[];
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

export interface Population {
  female: number;
  male: number;
  sum: number;
  Pyramids: AgeGroupPop[];
}

export interface AgeGroupPop {
  AgeGroup: string;
  MalePop: number;
  FemalePop: number;
  TotalPop: number;
}

export interface Team {
  identifier: string;
  name: string;
  type: TeamType;
  active: boolean;
  partOf: string;
  headOf: string[];
  members: TeamMember[];
}

export interface TeamType {
  code: string;
  valueCodableConcept: string;
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
