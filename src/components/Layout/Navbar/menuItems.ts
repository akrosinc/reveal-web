import { HOME_PAGE, PLANS, MANAGEMENT, LOCATION_PAGE } from '../../../constants';

export const MAIN_MENU = [
  {
    pageTitle: 'Home',
    route: HOME_PAGE,
    roles: []
  },
  {
    pageTitle: 'Plan Management',
    route: PLANS,
    roles: ['plan_view'],
  },
  {
    pageTitle: 'Assign',
    route: '#',
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
