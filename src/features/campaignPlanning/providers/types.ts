import { RasterExtent } from '../../../utils/rasterHelper';

export interface HierarchyNodeProperties {
  name: string;
  geographicLevel: string;
  parentIdentifier: string;
  childrenNumber: number;
  locationSubtype?: LocationSubtype;
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
  userTagNames: string[];
}

export type SiteGeometry = 'polygon' | 'point';

export type LocationSubtype = 'OUTREACH' | 'STATIC' | 'H2R' | 'MOBILE' | 'SCHOOL' | 'HPV';

export interface SiteType {
  id: string;
  name: string;
  label: string;
  geometry: SiteGeometry;
  subtype: LocationSubtype;
}

export interface Site {
  identifier: string;
  name: string;
  typeId: string;
  geometry: SiteGeometry;
  locations: GeoJSON.Point[];
  boundary?: GeoJSON.Polygon;
  radius?: number;
}

export interface CustomLocationRequest {
  parentLocationIdentifier: string;
  locationSubtype: LocationSubtype;
  name: string;
  boundaryGeographicLevelName: string;
  pointGeographicLevelName: string;
  locationBoundary?: GeoJSON.Polygon;
  points: GeoJSON.Point[];
  tagName?: string;
}

export interface CustomLocation {
  identifier: string;
  geometry: GeoJSON.Geometry;
  properties: {
    name: string;
    locationSubtype: LocationSubtype;
    parentIdentifier: string;
  };
}

export type SiteCounts = Record<string, number>;

export interface TagCount {
  tag: string;
  count?: number | null;
  total?: number | null;
}

export interface LocationTagCounts {
  locationId: string;
  tags?: TagCount[];
}

export type TagValues = Record<string, number>;
