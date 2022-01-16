// APP TEXT
export const APP_TITLE = 'Reveal';
export const FOOTER_TEXT = `${new Date().getFullYear()} Reveal`;
// PAGES TITLE
export const PAGE_TITLE_HOME = 'Home';
export const PAGE_TITLE_PLANS = 'Plans';
export const PAGE_TITLE_ASSIGN = 'Assign';
export const PAGE_TITLE_MONITOR = 'Monitor';
export const PAGE_TITLE_ADMIN = 'Admin';

export const PAGINATION_DEFAULT_SIZE = 10;

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
export const USER_BULK_TABLE_COLUMNS = [
  { name: 'File name', sortValue: 'filename' },
  { name: 'Upload Date', sortValue: 'uploadedDatetime' },
  { name: 'Status', sortValue: 'status' }
];
export const GEOGRAPHY_LEVEL_TABLE_COLUMNS = [
  { name: 'Name', sortValue: 'name' },
  { name: 'Title', sortValue: 'title' }
];

export const LOCATION_HIERARCHY_TABLE_COLUMNS = [
  { name: 'Node Order', sortValue: 'nodeOrder'}
]

export const LOCATION_TABLE_COLUMNS = [
  { name: 'Location', sortValue: 'name'},
  { name: 'Geography Level', sortValue: 'geographicLevel.name'}
]
