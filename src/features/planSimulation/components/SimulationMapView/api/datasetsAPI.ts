import api from '../../../../../api/axios';

export interface DataSet {
  simulationId: string;
  tagId: string;
  hexColor: string;
  lineWidth: number;
  parentLocationId: string;
  saveToSimulation: boolean;
}

export interface DataSetList {
  identifier: string;
  name: string;
  hexColor: string;
  lineWidth: number;
  borderColor: string;
  hidden: boolean;
  minYear?: number;
  maxYear?: number;
  filter: {
    minValue: number;
    maxValue: number;
  };
  selectedRange: {
    minValue: number;
    maxValue: number;
  };
  isUserDataset:boolean;
}

export interface DataSetYearRange {
  datasetId: string;
  minYear: number;
  maxYear: number;
}

export interface SimulationDataResponse {
  identifier: string;
  datasets: DataSetList[];
  targetAreas: any[];
  datSetYearRange?: DataSetYearRange[];
}

export interface DataSetDelete {
  simulationId: string;
  datasetId: string[];
}

export interface DataSetUpdate {
  simulationId: string;
  datasetId: string;
  name: string;
  hexColor: string;
  lineWidth: number;
  borderColor: string;
}

export interface LocationData {
  datasetsIds: string[];
  includeGeometry: boolean;
  parentLocationId: string;
  simulationId: string;
  campaignManagementFeatures: boolean;
  dataSetYearFilter?: Record<string, number>;
  userDatasetIds: string[];
}

export interface AddDatasetResponse {
  simulationId: string;
  datasetId: string;
  datasetName: string;
  borderColor: string;
  hexColor: string;
  lineWidth: number;
  tagId: string;
  locationWithMetadata: any;
  isUserDataset: boolean;
}

export interface SimulationDatasetRequest {
  simulationId: string;
  parentAdminLevel?: string;
  dataSetYearFilter?: Record<string, number>;
  userDatasetIds: string[],
}

export const getEntityTags = async () => {
  try {
    const response = await api.get(`/entityTag/instance-hierarchy`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getSimulationData = async (simulationId: string) => {
  try {
    const response = await api.get(`/simulation/${simulationId}`);

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
  return api.delete('/simulation/dataset', { data })
  // try {
  //   const response = await api.delete(`/simulation/dataset`, { data });
  //   return response.data;
  // } catch (error) {
  //   console.error(error);
  // }
};

export const getLocationPolygonsWithDatasets = async (data: LocationData) => {
  try {
    const response = await api.post('/simulation/dataset/location-data', data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const addSearchRequest = async (data: SimulationDatasetRequest) => {
  try {
    const response = await api.post('/simulation/add-search-request', data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const filterDatasets = async (
  searchId: string,
  messageHandler: (e: MessageEvent<any>) => void,
  closeHandler: () => any,
  openHandler: () => any,
  resultsErrorHandler: (e: any) => any
) => {
  try {
    const events = new EventSource(
      `${process.env.REACT_APP_API_URL}/simulation/datasets/filter-sse?searchId=${searchId}`
    );
    events.addEventListener('message', messageHandler);
    events.addEventListener('open', _ => {
      openHandler();
    });
    events.addEventListener('error', e => {
      resultsErrorHandler(e);
      return events.close();
    });
    events.addEventListener('close', _ => {
      closeHandler();
      return events.close();
    });
  } catch (error) {
    console.error(error);
  }
};

export const getStructuresWithinBoundingBox = async (topLeftLon: number, topLeftLat: number, bottomRightLon: number, bottomRightLat: number) => {
  try {
    const response = await api.get(`/simulation/within?topLeftLon=${topLeftLon}&topLeftLat=${topLeftLat}&bottomRightLon=${bottomRightLon}&bottomRightLat=${bottomRightLat}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
