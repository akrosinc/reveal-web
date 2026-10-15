import api from '../../../api/axios';
import {
  RasterSimulationDatasetRequest,
  RasterSimulationDatasetResponse
} from '../providers/rasterDatasetTypes';

/**
 * Submits a raster dataset to the simulation backend via POST /api/v1/simulation/dataset
 *
 * @param payload RasterSimulationDatasetRequest
 * @returns Promise<RasterSimulationDatasetResponse>
 */
export const addRasterSimulationDataset = async (
  payload: RasterSimulationDatasetRequest
): Promise<RasterSimulationDatasetResponse> => {
  const response = await api.post<RasterSimulationDatasetResponse>('/simulation/dataset', payload);
  return response.data;
};
