import {
  HOME_PAGE,
  PLANS,
  MANAGEMENT,
  LOCATION_PAGE,
  ASSIGNMENT_PAGE,
  REPORTING_PAGE,
  REPORT_VIEW,
  LOCATION_VIEW,
  PLAN_VIEW,
  SIMULATION_PAGE,
  TAG_MANAGEMENT,
  METADATA_IMPORT,
  RESOURCE_PLANNING_PAGE,
  PLAN_MANAGEMENT,
  REVEAL_MANAGE
} from '../../../constants';

export const MAIN_MENU = [
  {
    pageTitle: 'Home',
    route: HOME_PAGE,
    roles: []
  },
  {
    pageTitle: 'Plan Management',
    route: '/plan',
    roles: [PLAN_MANAGEMENT],
    dropdown: [
      {
        pageTitle: 'Plans',
        route: PLANS,
        roles: ['manage-users']
      },
      {
        pageTitle: 'Assign',
        route: ASSIGNMENT_PAGE,
        roles: [PLAN_VIEW]
      },
      {
        pageTitle: 'Simulation',
        route: SIMULATION_PAGE,
        roles: [PLAN_VIEW]
      },
      {
        pageTitle: 'Resource Planning',
        route: RESOURCE_PLANNING_PAGE,
        roles: [PLAN_VIEW]
      }
    ]
  },
  {
    pageTitle: 'Reporting',
    route: '#',
    roles: [REPORT_VIEW],
    dropdown: [
      {
        pageTitle: 'planReporting',
        route: REPORTING_PAGE,
        roles: ['manage-users']
      },
      {
        pageTitle: 'performanceReporting',
        route: REPORTING_PAGE + '/performance-reports',
        roles: ['manage-users']
      }
    ]
  },
  {
    pageTitle: 'Admin',
    route: '/admin',
    roles: [REVEAL_MANAGE],
    dropdown: [
      {
        pageTitle: 'Management',
        route: MANAGEMENT,
        roles: ['manage-users']
      },
      {
        pageTitle: 'Location',
        route: LOCATION_PAGE,
        roles: [LOCATION_VIEW]
      },
      {
        pageTitle: 'TagManagement',
        route: TAG_MANAGEMENT,
        roles: []
      },
      {
        pageTitle: 'MetaDataImport',
        route: METADATA_IMPORT,
        roles: []
      }
    ]
  }
];
