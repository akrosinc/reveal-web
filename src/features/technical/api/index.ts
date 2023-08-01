import api from '../../../api/axios';

export interface Topics {
  [topicName: string]: number;
}

export const getTopicData = (): Promise<Topics> => {
  const data = api.get<Topics>('/kafkagroups/stats').then(res => res.data);
  return data;
};
