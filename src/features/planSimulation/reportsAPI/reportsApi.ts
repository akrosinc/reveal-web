import api from '../../../api/axios';

export const getReportForLocation = async (planid: string, locationId: string): Promise<any> => {
  const data = await api.get(`/task-details?planId=${planid}&locationId=${locationId}`).then(response => response.data);
  return data;
};
