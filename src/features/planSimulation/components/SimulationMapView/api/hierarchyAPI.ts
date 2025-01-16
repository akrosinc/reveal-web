import axios from 'axios';
import api from '../../../../../api/axios';

export const getHierarchy = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/locationHierarchy/default/location`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getHierarchyPolygon = async (locationId: string, page: number, size: number) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/v1/location/${locationId}/children-included?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
