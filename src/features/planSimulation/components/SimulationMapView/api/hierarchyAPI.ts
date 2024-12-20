import { Geometry } from '@turf/turf';
import axios from 'axios';

// export const getHierarchy = async (
//   hierarchyId: string,
//   pageNumber: number,
//   pageSize: number,
//   sortType: string,
//   includeSummary: boolean
// ) => {
//   try {
//     const response = await axios.get(
//       `http://localhost:8080/api/v1/locationHierarchy/${hierarchyId}/location?search=&size=${pageSize}&page=${pageNumber}&sort=,${sortType}&_summary=${includeSummary}`
//     );
//     return response.data;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getHierarchyPolygon = async (locationId: string) => {
//   try {
//     const response = await axios.get<Geometry>(`http://localhost:8080/api/v1/location/${locationId}`);
//     return response.data;
//   } catch (error) {
//     console.error(error);
//   }
// };

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
    const response = await axios.get(`http://localhost:8080/api/v1/location/${locationId}/children-included?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
