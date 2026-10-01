export interface RasterSimulationDatasetRequest {
  simulationId: string;
  tagId: string;
  hexColor: string;
  lineWidth: number;
  borderColor: string;
  parentLocationId: string;
  parentAdminLevel?: string;
  dataSetYearFilter?: Record<string, number>;
  addToSimulation?: boolean;
  userDatasetIds?: string[];
  datasetType?: string; // 'RASTER'
}

export interface RasterLocationMetadataItem {
  value: any;
  type: string;
  fieldType: string;
  datasetId: string;
}

export interface RasterDataSetYearRange {
  datasetId: string;
  maxYear: number;
  minYear: number;
}

export interface RasterSimulationDatasetResponse {
  simulationId: string;
  tagId: string;
  datasetId: string;
  datasetName: string;
  hexColor: string;
  borderColor: string;
  lineWidth: number;
  locationWithMetadata?: Record<string, RasterLocationMetadataItem>;
  dataSetYearRange?: RasterDataSetYearRange;
  datasetType?: string;
  colorRamp?: string;
  dataSetType?: string;
}
