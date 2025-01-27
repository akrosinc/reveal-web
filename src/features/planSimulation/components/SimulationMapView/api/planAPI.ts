import axios from 'axios';
import api from '../../../../../api/axios';

export const assignLocationsToPlan = async (planId: string, selectedlocations: string[]) => {
  try {
    const response = await api.post(`/plan/${planId}/assignLocations`, {
      locations: selectedlocations
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
