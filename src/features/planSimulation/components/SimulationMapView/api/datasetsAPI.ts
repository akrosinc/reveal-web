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
  borderColor: string;
  hidden: boolean;
  filter: {
    minValue: number;
    maxValue: number;
  };
  selectedRange: {
    minValue: number;
    maxValue: number;
  };
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
  borderColor: string;
}

export interface LocationData {
  datasetsIds: string[];
  includeGeometry: boolean;
  parentLocationId: string;
  simulationId: string;
  campaignManagementFeatures: boolean;
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
}

export interface SimulationDatasetRequest {
  simulationId: string;
  parentAdminLevel: string;
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
