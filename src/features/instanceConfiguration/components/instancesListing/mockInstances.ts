export type InstanceModel = {
  id: string;
  instanceName: string;
  title: string;
  status: 'Draft' | 'Active';
  interventionType: string;
  createdDate: string;
  startDate: string;
  endDate: string;
};

export const MOCK_INSTANCES: InstanceModel[] = [
  {
    id: '1',
    instanceName: 'Boko Instance',
    title: 'Boko plan',
    status: 'Draft',
    interventionType: 'Survey',
    createdDate: '2025-11-19',
    startDate: '2025-11-19',
    endDate: '2025-11-19'
  },
  {
    id: '2',
    instanceName: 'Laka Instance',
    title: 'Laka plan',
    status: 'Draft',
    interventionType: 'MDA',
    createdDate: '2025-11-17',
    startDate: '2025-11-17',
    endDate: '2025-11-14'
  },
  {
    id: '3',
    instanceName: 'Lagos Instance',
    title: 'Lagos plan',
    status: 'Draft',
    interventionType: 'Survey',
    createdDate: '2025-11-19',
    startDate: '2025-11-19',
    endDate: '2025-11-19'
  }
];
