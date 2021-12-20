//MAIN PAGES
export const HOME_PAGE = '/';
export const USER_MANAGEMENT = '/user-management';

//USER PAGES
export const USER_MANAGEMENT_USER_CREATE = USER_MANAGEMENT + "/user/create";
export const USER_MANAGEMENT_USER_CREATE_BULK = USER_MANAGEMENT + "/user/create/bulk";
export const USER_MANAGEMENT_USER_EDIT = USER_MANAGEMENT + "/user/edit/:userId";

//ORGANIZATION PAGES
export const USER_MANAGEMENT_ORGANIZATION_DETAILS = USER_MANAGEMENT + "/organization/:organizationId";
export const USER_MANAGEMENT_ORGANIZATION_CREATE = USER_MANAGEMENT + "/organization/create";

//PLAN PAGES
export const PLANS = "/plans"