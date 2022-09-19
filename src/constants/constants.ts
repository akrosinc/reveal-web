// APP TEXT
export const APP_TITLE = 'Reveal';
export const FOOTER_TEXT = `${new Date().getFullYear()} Reveal`;
export const UNEXPECTED_ERROR_STRING = 'Unexpected error has occured.';
export const SERVER_ERROR_STRING = 'Server is not responding.';
export const UNAUTHORIZED_ERROR_STRING = 'Unauthorized request, logging out...';

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
export const REGEX_NAME_VALIDATION = new RegExp('^[-\\a-zA-Z0-9][ a-zA-Z0-9_.-]*[^- _]$');
export const REGEX_TITLE_VALIDATION = new RegExp('^[^-\\s][a-zA-Z0-9.__\\s-]*$');
export const REGEX_USERNAME_VALIDATION = new RegExp('^[a-z0-9]+([._]?[a-z0-9]+)*$');
export const REGEX_EMAIL_VALIDATION = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');

export const PAGINATION_DEFAULT_SIZE = 10;

export const MAPBOX_STYLE_SATELLITE = 'mapbox://styles/mapbox/satellite-v9';
export const MAPBOX_STYLE_STREETS = 'mapbox://styles/mapbox/streets-v11';
export const MAPBOX_STYLE_SATELLITE_STREETS = 'mapbox://styles/mapbox/satellite-streets-v11';

export const ORGANIZATION_TABLE_COLUMNS = [
  { Header: 'Name', accessor: 'name' },
  { Header: 'Type', accessor: 'type' },
  { Header: 'Active', accessor: 'active' }
];
export const USER_TABLE_COLUMNS = [
  { name: 'Username', sortValue: 'username', accessor: 'username' },
  { name: 'First Name', sortValue: 'firstName', accessor: 'firstName' },
  { name: 'Last Name', sortValue: 'lastName', accessor: 'lastName' },
  { name: 'Organization', sortValue: undefined, accessor: 'organizations', key: 'name' }
];
export const BULK_TABLE_COLUMNS = [
  { name: 'File name', sortValue: 'filename', accessor: 'filename' },
  { name: 'Upload Date', sortValue: 'uploadedDatetime', accessor: 'uploadDatetime' },
  { name: 'Status', sortValue: 'status', accessor: 'status' },
  { name: 'Uploaded By', sortValue: 'username', accessor: 'uploadedBy' }
];
export const GEOGRAPHY_LEVEL_TABLE_COLUMNS = [
  { name: 'Name', sortValue: 'name', accessor: 'name' },
  { name: 'Title', sortValue: 'title', accessor: 'title' }
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
  { name: 'Title', sortValue: 'title', accessor: 'title' },
  { name: 'Status', sortValue: 'status', accessor: 'status' },
  { name: 'Intervention Type', sortValue: 'interventionType', accessor: 'interventionType', key: 'name' },
  { name: 'Location Hierarchy', sortValue: 'locationHierarchy', accessor: 'locationHierarchy', key: 'name' },
  { name: 'Start Date', sortValue: 'effectivePeriodStart', accessor: 'effectivePeriod', key: 'start' },
  { name: 'End Date', sortValue: 'effectivePeriodEnd', accessor: 'effectivePeriod', key: 'end' }
];

export const META_IMPORT_TABLE_COLUMNS = [
  { name: 'File name', sortValue: 'filename', accessor: 'filename' },
  { name: 'Upload Date', sortValue: 'uploadedDatetime', accessor: 'uploadDatetime' },
  { name: 'Status', sortValue: 'status', accessor: 'status' },
  { name: 'Uploaded By', sortValue: 'uploadedBy', accessor: 'uploadedBy' }
];

export const RESOURCE_PLANNING_HISTORY_TABLE_COLUMNS = [
  { name: 'Identifier', sortValue: 'identifier', accessor: 'identifier' },
  { name: 'Name', sortValue: 'name', accessor: 'name' },
  { name: 'Create Date', sortValue: 'created', accessor: 'created' },
  { name: 'Uploaded By', sortValue: 'createdBy', accessor: 'createdBy' }
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

export const MDA_STRUCTURE_COLOR_COMPLETE = '#A7171A';
export const MDA_STRUCTURE_COLOR_NOT_VISITED = '#5DBB63';
export const MDA_STRUCTURE_COLOR_NOT_ELIGIBLE = '#656565';
export const MDA_STRUCTURE_COLOR_SMC_COMPLETE = '#6e599f';
export const MDA_STRUCTURE_COLOR_SPAQ_COMPLETE = '#ffc107';

export const IRS_STRUCTURE_COLOR_NOT_SPRAYED = '#A7171A';
export const IRS_STRUCTURE_COLOR_SPRAYED = '#5DBB63';
export const IRS_STRUCTURE_COLOR_NOT_SPRAYABLE = '#656565';

export const MAP_MDA_STRUCTURE_LEGEND_COLORS = [
  MDA_STRUCTURE_COLOR_COMPLETE,
  MDA_STRUCTURE_COLOR_NOT_VISITED,
  MDA_STRUCTURE_COLOR_NOT_ELIGIBLE,
  MDA_STRUCTURE_COLOR_SMC_COMPLETE,
  MDA_STRUCTURE_COLOR_SPAQ_COMPLETE
];

export const MAP_IRS_STRUCTURE_LEGEND_COLORS = [
  IRS_STRUCTURE_COLOR_NOT_SPRAYED,
  IRS_STRUCTURE_COLOR_SPRAYED,
  IRS_STRUCTURE_COLOR_NOT_SPRAYABLE
];

export const REPORT_TABLE_PERCENTAGE_HIGH = 75;
export const REPORT_TABLE_PERCENTAGE_MEDIUM = 50;
export const REPORT_TABLE_PERCENTAGE_LOW = 25;

export const MAP_DEFAULT_FILL_OPACITY = 0.85;
export const MAP_DEFAULT_DISABLED_FILL_OPACITY = 0.85;

export const COLOR_YELLOW = '#ffff68';
export const COLOR_BOOTSTRAP_SUCCESS = '#198754';
export const COLOR_BOOTSTRAP_DANGER = '#dc3545';
export const COLOR_BOOTSTRAP_WARNING = '#ffc107';

export const NUMBER_AGGREGATION = ['sum', 'average', 'min', 'max'];
export const BOOLEAN_STRING_AGGREGATION = ['count'];
export const DATA_AGGREGATION = ['min', 'max', 'count'];
