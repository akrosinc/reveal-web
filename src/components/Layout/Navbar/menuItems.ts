import { HOME_PAGE, PLANS, MANAGEMENT, LOCATION_PAGE, ASSIGNMENT_PAGE, REPORTING_PAGE } from '../../../constants';

export const MAIN_MENU = [
  {
    pageTitle: 'Home',
    route: HOME_PAGE,
    roles: []
  },
  {
    pageTitle: 'Plan Management',
    route: '/plan',
    roles: ['plan_view'],
    dropdown: [
      {
        pageTitle: 'Plans',
        route: PLANS,
        roles: ['manage-users']
      },
      {
        pageTitle: 'Assign',
        route: ASSIGNMENT_PAGE,
        roles: ['plan_view']
      }
    ]
  },
  {
    pageTitle: 'Reporting',
    route: REPORTING_PAGE,
    roles: []
  },
  {
    pageTitle: 'Admin',
    route: '/admin',
    roles: ['manage-users'],
    dropdown: [
      {
        pageTitle: 'Management',
        route: MANAGEMENT,
        roles: ['manage-users']
      },
      {
        pageTitle: 'Location',
        route: LOCATION_PAGE,
        roles: []
      }
    ]
  }
];
