export type InstanceModel = {
  identifier: string;
  instanceName: string;
  interventionType: string;
  planIdentifier: string;
  createdDatetime: string;
  planTitle: string;
  planStatus: string;
  startDate: string;
  endDate: string;
};

export const MOCK_INSTANCES: InstanceModel[] = [
  {
    identifier: '1',
    instanceName: 'Boko Instance',
    planIdentifier: 'plan-1',
    planTitle: 'Boko plan',
    planStatus: 'DRAFT',
    interventionType: 'Survey',
    createdDatetime: '2025-11-19T08:00:00',
    startDate: '2025-11-19',
    endDate: '2025-11-19'
  },
  {
    identifier: '2',
    instanceName: 'Laka Instance',
    planIdentifier: 'plan-2',
    planTitle: 'Laka plan',
    planStatus: 'DRAFT',
    interventionType: 'MDA',
    createdDatetime: '2025-11-17T08:00:00',
    startDate: '2025-11-17',
    endDate: '2025-11-14'
  },
  {
    identifier: '3',
    instanceName: 'Lagos Instance',
    planIdentifier: 'plan-3',
    planTitle: 'Lagos plan',
    planStatus: 'DRAFT',
    interventionType: 'Survey',
    createdDatetime: '2025-11-19T08:00:00',
    startDate: '2025-11-19',
    endDate: '2025-11-19'
  }
];
