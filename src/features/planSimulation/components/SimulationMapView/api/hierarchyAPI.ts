import axios from 'axios';
import api from '../../../../../api/axios';

// export const getSimulationInstance = async (simulationId: string) => {

export const getHierarchy = async () => {
  try {
    const response = await api.get(`/locationHierarchy/default/location`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// export const getLocation = async () => {
//   try {
//     const response = await  api.get('/location/627e0983-a64b-4db4-877f-d3b3ed0c3c21');
//     return response.data;
//   } catch (error) {
//     console.error(error);
//   }
// };

export const getDefaultHierarchyData = async () => {
  try {
    const response = await api.get(`/locationHierarchy/default`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getHierarchyPolygon = async (locationId: string, page: number, size: number) => {
  try {
    const response = await api.get(`/location/${locationId}/children-included?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getPlanInfo = async () => {
  try {
    const response = await api.get(`/plan?_summary=false&search=&size=1&page=0&sort=,desc`);
    return response.data.content[0];
  } catch (error) {
    console.error(error);
  }
};
