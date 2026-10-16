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
}

// Area assigned to the campaign (plan target area), as Campaign Management draws it
export interface TargetArea {
  identifier: string;
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
