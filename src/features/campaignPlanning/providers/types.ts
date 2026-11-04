import { RasterExtent } from '../../../utils/rasterHelper';

export interface HierarchyNodeProperties {
  name: string;
  geographicLevel: string;
  parentIdentifier: string;
  childrenNumber: number;
}

export interface HierarchyNode {
  identifier: string;
  properties: HierarchyNodeProperties;
  children?: HierarchyNode[];
}

export interface InstanceHierarchy {
  identifier: string;
  name: string;
  nodeOrder: string[];
  geoTree: HierarchyNode[];
}

export interface InstanceListItem {
  identifier: string;
  instanceName: string;
  planIdentifier?: string;
  planTitle?: string;
}

export interface TeamMember {
  identifier: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Team {
  identifier: string;
  name: string;
  active: boolean;
  members: TeamMember[];
}

export interface LocationMetadata {
  value: number;
  type: string;
  fieldType: string;
  datasetId: string;
}

export interface LocationFeature {
  identifier: string;
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: HierarchyNodeProperties & {
    id: string;
    metadata: LocationMetadata[];
    assigned?: boolean;
    population?: { sum?: number } | string;
  };
  ancestry: string[];
}

// One dataset = one tag (e.g. "asthma-min"), so it gives one value per location
export interface SimulationDataset {
  identifier: string;
  name: string;
  hexColor?: string;
  borderColor?: string;
  lineWidth?: number;
  isUserDataset?: boolean;
  // Fill opacity in % from the Edit dataset popup; kept on this page only, like Simulation's opacity slider
  opacity?: number;
}

// Body of PUT simulation/dataset (Simulation's Edit dataset popup / rename)
export interface DatasetDeleteRequest {
  simulationId: string;
  datasetId: string[];
  datasetType?: 'RASTER';
}

export interface DatasetUpdateRequest {
  simulationId: string;
  datasetId: string;
  name: string;
  hexColor: string;
  lineWidth: number;
  borderColor: string;
  datasetType?: 'RASTER';
  metadata?: Record<string, unknown>;
}

// Value range of a dataset (lowest/highest value, or the part kept by a filter)
export interface ValueRange {
  min: number;
  max: number;
}

// The plan's simulation holds the dataset ids that location-data expects
// Raster layer attached to the simulation (added on the Simulation page, from raster/map-layers)
export interface RasterDataset {
  identifier: string;
  datasetIdentifier?: string;
  name: string;
  colorRamp?: string;
  opacity?: number;
  hidden?: boolean;
  extent?: RasterExtent;
  metadata?: Record<string, unknown>;
}

// Area assigned to the campaign (plan target area), as Campaign Management draws it
export interface TargetArea {
  identifier: string;
  ancestry?: string[];
  geometry: GeoJSON.Geometry;
  properties: {
    name: string;
    numberOfTeams?: number;
  };
}

export interface PlanSimulation {
  identifier: string;
  datasets: SimulationDataset[];
  rasterDatasets?: RasterDataset[];
  targetAreas?: TargetArea[];
}

export interface LocationDataRequest {
  simulationId: string;
  datasetsIds: string[];
  userDatasetIds: string[];
  includeGeometry: boolean;
  parentLocationId: string;
  campaignManagementFeatures: boolean;
}

export type SiteGeometry = 'polygon' | 'point';

export interface SiteType {
  id: string;
  name: string;
  label: string;
  geometry: SiteGeometry;
}

export interface Site {
  identifier: string;
  name: string;
  typeId: string;
  geometry: SiteGeometry;
  location: GeoJSON.Point;
  boundary?: GeoJSON.Polygon;
}

export type SiteTargets = Record<string, number>;

// Server ActionTypeEnum
export type ActionType = 'CREATE' | 'UPDATE' | 'REMOVE' | 'SINGLE' | 'HIERARCHICAL';

// Server CostContainer.CostVariableSource
export type CostVariableSource = 'MANUAL' | 'COMPUTED' | 'CONSTANT';

// Server ActionTemplateConfig.TaskGenerationRecurrence
export type TaskGenerationRecurrence =
  | 'MINUTELY'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY';

// Server CostContainer.CostVariable; value stays null on a template definition
export interface CostVariable {
  key?: string;
  name?: string;
  label?: string;
  unit?: string;
  source?: CostVariableSource;
  defaultValue?: number;
  value?: number;
}

// Server CostContainer; variables keyed by the formula token (e.g. "a")
export interface CostContainer {
  formula?: string;
  variables?: Record<string, CostVariable>;
}

// Server ActionTemplateConfig (stored in the template's JSONB column)
export interface ActionTemplateConfig {
  costContainer?: CostContainer;
  recurrence?: TaskGenerationRecurrence;
}

// Server ActionTemplateResponse
export interface ActionTemplate {
  identifier: string;
  name?: string;
  actionTemplateConfig?: ActionTemplateConfig;
}

// Body of POST /api/v1/cost-by-location
export interface CostByLocationRequest {
  instanceIdentifier: string;
  locationIdentifier: string;
  actionIdentifier: string;
  costContainer?: CostContainer;
  calculatedValue?: number;
}

// Body of POST /api/v1/action-location-recapture-limit
export interface ActionLocationRecaptureLimitRequest {
  instanceIdentifier: string;
  locationIdentifier: string;
  actionIdentifier: string;
  count: number;
}

// Server CostByLocationResponse
export interface CostByLocationResponse {
  identifier: string;
  instanceIdentifier?: string;
  locationIdentifier?: string;
  actionIdentifier?: string;
  costContainer?: CostContainer;
  calculatedValue?: number;
}

// Server ActionLocationRecaptureLimitResponse
export interface ActionLocationRecaptureLimitResponse {
  identifier: string;
  instanceIdentifier?: string;
  locationIdentifier?: string;
  actionIdentifier?: string;
  count?: number;
}

// Subset of the server's ActionResponse used by the right panel's action list
export interface Action {
  identifier: string;
  title: string;
  description?: string;
  type?: ActionType;
  formIdentifier?: string;
  actionTemplate?: ActionTemplate;
}

// Subset of the server's GoalResponse
export interface Goal {
  identifier: string;
  description?: string;
  priority?: string;
  actions?: Action[];
}

// Subset of the server's PlanResponse; goals carry their actions
export interface Plan {
  identifier: string;
  name?: string;
  title?: string;
  goals?: Goal[];
}
