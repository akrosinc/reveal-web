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
  PLAN_MANAGEMENT,
  REVEAL_MANAGE,
  RESOURCE_PLANNING_PAGE,
  DATA_PROCESSING_PROGRESS,
  REVEAL_SIMULATION,
  CampaignManage
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
    // roles: [PLAN_MANAGEMENT],
    roles: [],
    dropdown: [
      {
        pageTitle: 'Plans',
        route: PLANS,
        roles: ['manage-users']
      },
      {
        pageTitle: 'Assign',
        route: ASSIGNMENT_PAGE,
        // roles: [PLAN_VIEW]
        roles: []
      },
      {
        pageTitle: 'Simulation',
        route: SIMULATION_PAGE,
        // roles: [REVEAL_SIMULATION]
        roles: []
      },
      // {
      //   pageTitle: 'Resource Planning',
      //   route: RESOURCE_PLANNING_PAGE,
      //   // roles: [PLAN_VIEW]
      //   roles: []
      // },
      {
        pageTitle: 'CampaignManage',
        route: CampaignManage,
        // roles: [REVEAL_SIMULATION]
        roles: []
      },
      {
        // Instance Configuration moved here for superadmin (shown under 'Instance' dropdown)
        pageTitle: 'Instance Configuration',
        route: '/instance-configuration',
        roles: []
      }
    ]
  },
  {
    pageTitle: 'Reporting',
    route: '#',
    roles: [REPORT_VIEW, 'view_survey_data'],
    dropdown: [
      {
        pageTitle: 'planReporting',
        route: REPORTING_PAGE,
        // roles: ['plan_reporting']
        roles: []
      },
      {
        pageTitle: 'performanceReporting',
        route: REPORTING_PAGE + '/performance-reports',
        // roles: ['performance_reporting']
        roles: []
      },
      {
        pageTitle: 'surveyReporting',
        route: REPORTING_PAGE + '/survey-data',
        // roles: ['view_survey_data']
        roles: []
      }
    ]
  },
  {
    pageTitle: 'Admin',
    route: '/admin',
    // roles: [REVEAL_MANAGE],
    roles: [],
    dropdown: [
      {
        pageTitle: 'Management',
        route: MANAGEMENT,
        // roles: ['manage-users']
        roles: []
      },
      {
        pageTitle: 'Group Configuration',
        route: MANAGEMENT + '/group-configuration',
        // roles: ['manage-users']
        roles: []
      },
      // {
      //   pageTitle: 'Instance Configuration',
      //   route: MANAGEMENT + '/instance-configuration',
      //   // roles: ['manage-users']
      //   roles: []
      // },
      {
        pageTitle: 'Location',
        route: LOCATION_PAGE,
        // roles: [LOCATION_VIEW]
        roles: []
      },
      {
        pageTitle: 'TagManagement',
        route: TAG_MANAGEMENT,
        // roles: ['tag_management']
        roles: []
      },
      {
        pageTitle: 'MetaDataImport',
        route: METADATA_IMPORT,
        // roles: ['metadata_import']
        roles: []
      },
      {
        pageTitle: 'dataProcessingProgress',
        route: DATA_PROCESSING_PROGRESS,
        // roles: ['data_processing_progress']
        roles: []
      }
    ]
  }
];
