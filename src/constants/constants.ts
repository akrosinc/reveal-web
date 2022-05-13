// APP TEXT
export const APP_TITLE = 'Reveal';
export const FOOTER_TEXT = `${new Date().getFullYear()} Reveal`;

// PAGES TITLE
export const PAGE_TITLE_HOME = 'Home';
export const PAGE_TITLE_PLANS = 'Plans';
export const PAGE_TITLE_ASSIGN = 'Assign';
export const PAGE_TITLE_MONITOR = 'Monitor';
export const PAGE_TITLE_ADMIN = 'Admin';

// KEYCLOAK
export const KEYCLOAK_URL = 'https://sso-ops.akros.online/auth/';
export const KEYCLOAK_REALM = 'reveal';
export const KEYCLOAK_CLIENT_ID = 'reveal-web';

//Table depth colors
export const ROW_DEPTH_COLOR_1 = '#F5F5F5';
export const ROW_DEPTH_COLOR_2 = '#E8E8E8';
export const ROW_DEPTH_COLOR_3 = '#DCDCDC';

//REGEX
export const REGEX_NAME_VALIDATION = new RegExp('^[^-\\s][a-z0-9_.-]*$');
export const REGEX_TITLE_VALIDATION = new RegExp('^[^-\\s][a-zA-Z0-9.__\\s-]*$');

export const PAGINATION_DEFAULT_SIZE = 10;

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/satellite-v9';

export const ORGANIZATION_TABLE_COLUMNS = [
  { Header: 'Name', accessor: 'name' },
  { Header: 'Type', accessor: 'type' },
  { Header: 'Active', accessor: 'active' }
];
export const USER_TABLE_COLUMNS = [
  { name: 'Username', sortValue: 'username' },
  { name: 'First Name', sortValue: 'firstName' },
  { name: 'Last Name', sortValue: 'lastName' },
  { name: 'Organization', sortValue: 'organization' }
];
export const BULK_TABLE_COLUMNS = [
  { name: 'File name', sortValue: 'filename' },
  { name: 'Upload Date', sortValue: 'uploadedDatetime' },
  { name: 'Status', sortValue: 'status' },
  { name: 'Uploaded By', sortValue: 'username' }
];
export const GEOGRAPHY_LEVEL_TABLE_COLUMNS = [
  { name: 'Name', sortValue: 'name' },
  { name: 'Title', sortValue: 'title' }
];

export const LOCATION_HIERARCHY_TABLE_COLUMNS = [
  { name: 'Name', sortValue: 'name' },
  { name: 'Node Order', sortValue: 'nodeOrder' }
];

export const LOCATION_TABLE_COLUMNS = [
  { Header: 'Location', accessor: 'properties.name' },
  { Header: 'Geography Level', accessor: 'properties.geographicLevel' }
];

export const LOCATION_ASSIGN_TABLE_COLUMNS = [
  { Header: 'Location', accessor: 'properties.name', id: 'location' },
  { Header: 'Geography Level', accessor: 'properties.geographicLevel' },
  { Header: 'Select', id: 'checkbox' },
  { Header: 'Assign teams', id: 'teams' }
];

export const PLAN_TABLE_COLUMNS = [
  { name: 'Title', sortValue: 'title' },
  { name: 'Status', sortValue: 'status' },
  { name: 'Intervention Type', sortValue: 'interventionType' },
  { name: 'Location Hierarchy', sortValue: 'locationHierarchy' },
  { name: 'Start Date', sortValue: 'effectivePeriodStart' },
  { name: 'End Date', sortValue: 'effectivePeriodEnd' }
];

export const LOCATION_ASSIGNMENT_TAB = 'location-assignment';
export const LOCATION_TEAM_ASSIGNMENT_TAB = 'team-assignment';

export const MAP_COLOR_NO_TEAMS = '#A7171A';
export const MAP_COLOR_TEAM_ASSIGNED = '#5DBB63';
export const MAP_COLOR_UNASSIGNED = '#656565';
export const MAP_COLOR_SELECTED = '#6e599f';

export const MAP_LEGEND_TEXT = [
  'Teams Assigned',
  'Location is assigned but no teams',
  'Unassigned Location',
  'Selected Location'
];
export const MAP_LEGEND_COLORS = [
  MAP_COLOR_TEAM_ASSIGNED,
  MAP_COLOR_NO_TEAMS,
  MAP_COLOR_UNASSIGNED,
  MAP_COLOR_SELECTED
];

export const MAP_DEFAULT_FILL_OPACITY = 0.85;
export const MAP_DEFAULT_DISABLED_FILL_OPACITY = 0.85;
