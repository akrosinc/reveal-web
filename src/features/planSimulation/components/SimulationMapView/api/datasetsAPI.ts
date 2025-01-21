import api from '../../../../../api/axios';

export interface DataSet {
  simulationId: string;
  tagId: string;
  hexColor: string;
  lineWidth: number;
  parentLocationId: string;
}

export interface DataSetList {
  identifier: string;
  name: string;
  hexColor: string;
  lineWidth: number;
  hidden: boolean;
}

export interface DataSetDelete {
  simulationId: string;
  datasetId: string;
}

export interface DataSetUpdate {
  simulationId: string;
  datasetId: string;
  name: string;
  hexColor: string;
  lineWidth: number;
}

export interface LocationData {
  datasetsIds: string[];
  includeGeometry: boolean;
  parentLocationId: string;
  simulationId: string;
}

export interface AddDatasetResponse {
  simulationId: string;
  datasetId: string;
  datasetName: string;
  hexColor: string;
  lineWidth: number;
  tagId: string;
  locationWithMetadata: any;
}

export const getEntityTags = async () => {
  try {
    const response = await api.get(`/entityTag/default-hierarchy`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getSimulationData = async (simulationId: string) => {
  try {
    const response = await api.get(`/simulation/${simulationId}`);
    console.log('response', response);

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

//! POST
export const setDataset = async (data: DataSet) => {
  try {
    const response = await api.post(`/simulation/dataset`, data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

//! PUT
export const updateDataset = async (data: DataSetUpdate) => {
  try {
    const response = await api.put(`/simulation/dataset`, data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

//! DELETE
export const deleteDataset = async (data: DataSetDelete) => {
  try {
    const response = await api.delete(`/simulation/dataset`, { data });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getLocationPolygonsWithDatasets = async (data: LocationData) => {
  try {
    const response = await api.post('/simulation/dataset/location-data', data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
