export interface RasterSimulationDatasetRequest {
  simulationId: string;
  simulationIdentifier?: string;
  dataSetId: string;
  hexColor: string;
  lineWidth: number;
  borderColor: string;
  parentLocationId: string;
  parentAdminLevel?: string;
  dataSetYearFilter?: Record<string, number>;
  addToSimulation?: boolean;
  datasetType?: string; // 'RASTER'
  tagId?: string;
  userDatasetIds?: string[];
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
