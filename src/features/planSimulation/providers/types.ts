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
