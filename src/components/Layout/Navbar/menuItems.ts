import {
  HOME_PAGE,
  PLANS,
  MANAGEMENT,
  LOCATION_PAGE,
  ASSIGNMENT_PAGE,
  REPORTING_PAGE,
  SIMULATION_PAGE,
  TAG_MANAGEMENT,
  METADATA_IMPORT,
  CampaignManage,
  MENU_HOME_VIEW,
  REPORT_VIEW,
  REVEAL_SIMULATION,
  ROLE_MANAGE_USER,
  LOCATION_VIEW,
  METADATA_IMPORT_VIEW,
  GROUP_MANAGEMENT_VIEW,
  CAMPAIGN_MANAGEMENT,
  ASSIGNMENT_PLAN,
  INSTANE_MANAGEMENT_VIEW,
  REVEAL_SIMULATION_USER
} from '../../../constants';


export const MAIN_MENU = [
  {
    pageTitle: 'Home',
    route: HOME_PAGE,
    roles: [MENU_HOME_VIEW]
  },

  {
    pageTitle: 'Instance',
    route: '/instance',
    roles: [INSTANE_MANAGEMENT_VIEW, REVEAL_SIMULATION],
    dropdown: [
      {
        pageTitle: 'Data Viewer',
        route: SIMULATION_PAGE,
        roles: [REVEAL_SIMULATION]
      },
      {
        pageTitle: 'Management',
        route: '/instance-configuration',
        roles: [INSTANE_MANAGEMENT_VIEW]
      }
    ]
  },

  {
    pageTitle: 'Plan',
    route: '/plan',
    roles: [CAMPAIGN_MANAGEMENT, ASSIGNMENT_PLAN, REVEAL_SIMULATION_USER],
    dropdown: [
      {
        pageTitle: 'Campaign Management',
        route: CampaignManage,
        roles: [CAMPAIGN_MANAGEMENT]
      },
      {
        pageTitle: 'Assignment',
        route: ASSIGNMENT_PAGE,
        roles: [ASSIGNMENT_PLAN]
      },
      {
        pageTitle: 'Simulations',
        route: SIMULATION_PAGE,
        roles: [REVEAL_SIMULATION_USER]
      }
    ]
  },

  {
    pageTitle: 'Group',
    route: '/group',
    roles: [GROUP_MANAGEMENT_VIEW],
    dropdown: [
      {
        pageTitle: 'Group Management',
        route: MANAGEMENT + '/group-configuration',
        roles: [GROUP_MANAGEMENT_VIEW]
      }
    ]
  },

  {
    pageTitle: 'Reporting',
    route: '#',
    roles: [REPORT_VIEW],
    dropdown: [
      {
        pageTitle: 'Plan Reporting',
        route: REPORTING_PAGE,
        roles: [REPORT_VIEW]
      },
      {
        pageTitle: 'Performance Reporting',
        route: REPORTING_PAGE + '/performance-reports',
        roles: [REPORT_VIEW]
      },
      {
        pageTitle: 'Survey Reporting',
        route: REPORTING_PAGE + '/survey-data',
        roles: [REPORT_VIEW]
      }
    ]
  },

  {
    pageTitle: 'Admin',
    route: '/admin',
    roles: [
      ROLE_MANAGE_USER,
      LOCATION_VIEW,
      TAG_MANAGEMENT,
      METADATA_IMPORT_VIEW
    ],
    dropdown: [
      {
        pageTitle: 'User Management',
        route: MANAGEMENT,
        roles: [ROLE_MANAGE_USER]
      },
      {
        pageTitle: 'Location Management',
        route: LOCATION_PAGE,
        roles: [LOCATION_VIEW]
      },
      {
        pageTitle: 'Tag Management',
        route: TAG_MANAGEMENT,
        roles: [TAG_MANAGEMENT]
      },
      {
        pageTitle: 'Metadata Import',
        route: METADATA_IMPORT,
        roles: [METADATA_IMPORT_VIEW]
      }
    ]
  }
];

