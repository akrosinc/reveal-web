import { IGNORE } from '../constants';
import { setEnv } from './utils';

/** The website name */
export const WEBSITE_NAME: string = setEnv('REACT_APP_WEBSITE_NAME', 'Akros Reveal');
export type WEBSITE_NAME = typeof WEBSITE_NAME;

/** The website language */
export const LANGUAGE = setEnv('REACT_APP_LANGUAGE', 'en');
export type LANGUAGE = typeof LANGUAGE;

/** The domain name */
export const DOMAIN_NAME = setEnv('REACT_APP_DOMAIN_NAME', 'http://localhost:3000');
export type DOMAIN_NAME = typeof DOMAIN_NAME;

/** Sentry */
export const SENTRY_DSN = setEnv('REACT_APP_SENTRY_DSN', '');
export type SENTRY_DSN = typeof SENTRY_DSN;

/** The Tracking Code for google analytics */
export const GA_CODE = setEnv('REACT_APP_GA_CODE', '');
export type GA_CODE = typeof GA_CODE;

/** Google Analytic Dimensions */
export const GA_ENV = setEnv('REACT_APP_GA_ENV', 'dev');
export type GA_ENV = typeof GA_ENV;

/** Do you want to enable team assignment? */
export const ENABLE_ASSIGN = setEnv('REACT_APP_ENABLE_ASSIGN', false) === 'true';
export type ENABLE_ASSIGN = typeof ENABLE_ASSIGN;

/** Do you want to enable Jurisdiction Metadata Upload */
export const ENABLE_JURISDICTION_METADATA_UPLOAD =
  setEnv('REACT_APP_ENABLE_JURISDICTION_METADATA_UPLOAD', false) === 'true';
export type ENABLE_JURISDICTION_METADATA_UPLOAD = typeof ENABLE_JURISDICTION_METADATA_UPLOAD;

/** Do you want to enable Structure Metadata Upload */
export const ENABLE_STRUCTURE_METADATA_UPLOAD =
  setEnv('REACT_APP_ENABLE_STRUCTURE_METADATA_UPLOAD', false) === 'true';
export type ENABLE_STRUCTURE_METADATA_UPLOAD = typeof ENABLE_STRUCTURE_METADATA_UPLOAD;

/** Do you want to enable the IRS features? */
export const ENABLE_IRS = setEnv('REACT_APP_ENABLE_IRS', false) === 'true';
export type ENABLE_IRS = typeof ENABLE_IRS;

/** Do you want to enable the IRS features? */
export const ENABLE_IRS_LITE = setEnv('REACT_APP_ENABLE_IRS_LITE', false) === 'true';
export type ENABLE_IRS_LITE = typeof ENABLE_IRS_LITE;

/** Do you want to enable the Focus Investigation features? */
export const ENABLE_FI = setEnv('REACT_APP_ENABLE_FI', false) === 'true';
export type ENABLE_FI = typeof ENABLE_FI;

/** Do you want to enable the users page? */
export const ENABLE_USERS = setEnv('REACT_APP_ENABLE_USERS', false) === 'true';
export type ENABLE_USERS = typeof ENABLE_USERS;

/** Do you want to enable the about page? */
export const ENABLE_ABOUT = setEnv('REACT_APP_ENABLE_ABOUT', false) === 'true';
export type ENABLE_ABOUT = typeof ENABLE_ABOUT;

/** Do you want to enable views dealing with teams */
export const ENABLE_TEAMS = setEnv('REACT_APP_ENABLE_TEAMS', false) === 'true';
export type ENABLE_TEAMS = typeof ENABLE_TEAMS;

/** Do you want to enable the MDA Point plan features? */
export const ENABLE_MDA_POINT = setEnv('REACT_APP_ENABLE_MDA_POINT', false) === 'true';
export type ENABLE_MDA_POINT = typeof ENABLE_MDA_POINT;

/** Do you want to enable the Dynamic MDA plan features? */
export const ENABLE_DYNAMIC_MDA = setEnv('REACT_APP_ENABLE_DYNAMIC_MDA', false) === 'true';
export type ENABLE_DYNAMIC_MDA = typeof ENABLE_DYNAMIC_MDA;

/** Do you want to enable the SMC Point plan features? */
export const ENABLE_SMC = setEnv('REACT_APP_ENABLE_SMC', false) === 'true';
export type ENABLE_SMC = typeof ENABLE_SMC;

/** Do you want to enable the MDA Lite plan features? */
export const ENABLE_MDA_LITE = setEnv('REACT_APP_ENABLE_MDA_LITE', false) === 'true';
export type ENABLE_MDA_LITE = typeof ENABLE_MDA_LITE;

/** Do you want to enable the MDA Point plan features? */
export const CLIENT_LABEL = setEnv('REACT_APP_CLIENT_LABEL', 'client');
export type CLIENT_LABEL = typeof CLIENT_LABEL;

/** Do you want to disable login protection? */
export const DISABLE_LOGIN_PROTECTION =
  setEnv('REACT_APP_DISABLE_LOGIN_PROTECTION', false) === 'true';
export type DISABLE_LOGIN_PROTECTION = typeof DISABLE_LOGIN_PROTECTION;

/** Do you want to enable the Config Form plan features? */
export const ENABLE_CONFIG_FORM = setEnv('REACT_APP_ENABLE_CONFIG_FORM', false) === 'true';
export type ENABLE_CONFIG_FORM = typeof ENABLE_CONFIG_FORM;

/** Do you want to enable IRS Performance Reporting */
export const ENABLE_IRS_PERFORMANCE_REPORT =
  setEnv('REACT_APP_ENABLE_IRS_PERFORMANCE_REPORT', false) === 'true';
export type ENABLE_IRS_PERFORMANCE_REPORT = typeof ENABLE_IRS_PERFORMANCE_REPORT;

/** The Superset API base */
export const SUPERSET_API_BASE = setEnv('REACT_APP_SUPERSET_API_BASE', 'http://localhost');
export type SUPERSET_API_BASE = typeof SUPERSET_API_BASE;

/** The Superset API endpoint */
export const SUPERSET_API_ENDPOINT = setEnv('REACT_APP_SUPERSET_API_ENDPOINT', 'slice');
export type SUPERSET_API_ENDPOINT = typeof SUPERSET_API_ENDPOINT;

/** The max number of records to get from Superset API endpoint */
export const SUPERSET_MAX_RECORDS = Number(setEnv('REACT_APP_SUPERSET_MAX_RECORDS', 10000));
export type SUPERSET_MAX_RECORDS = typeof SUPERSET_MAX_RECORDS;

export const SUPERSET_PLANS_SLICE = setEnv('REACT_APP_SUPERSET_PLANS_SLICE', '0');
export type SUPERSET_PLANS_SLICE = typeof SUPERSET_PLANS_SLICE;

export const SUPERSET_GOALS_SLICE = setEnv('REACT_APP_SUPERSET_GOALS_SLICE', '0');
export type SUPERSET_GOALS_SLICE = typeof SUPERSET_GOALS_SLICE;

export const SUPERSET_JURISDICTIONS_SLICE = setEnv('REACT_APP_SUPERSET_JURISDICTIONS_SLICE', '0');
export type SUPERSET_JURISDICTIONS_SLICE = typeof SUPERSET_JURISDICTIONS_SLICE;

export const SUPERSET_JURISDICTIONS_DATA_SLICE = setEnv(
  'REACT_APP_SUPERSET_JURISDICTIONS_DATA_SLICE',
  '0'
);
export type SUPERSET_JURISDICTIONS_DATA_SLICE = typeof SUPERSET_JURISDICTIONS_DATA_SLICE;

export const SUPERSET_IRS_REPORTING_PLANS_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_REPORTING_PLANS_SLICE',
  '0'
);
export type SUPERSET_IRS_REPORTING_PLANS_SLICE = typeof SUPERSET_IRS_REPORTING_PLANS_SLICE;

export const SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES = setEnv(
  'REACT_APP_SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES',
  '0'
);
export type SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES = typeof SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES;

export const SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = setEnv(
  'REACT_APP_SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL',
  '99'
);
export type SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = typeof SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL;

export const SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE',
  '0'
);
export type SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE = typeof SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE;

export const SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE = setEnv(
  'REACT_APP_SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE',
  '0'
);
export type SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE = typeof SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE;

export const SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS',
  ''
);
export type SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS = typeof SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS;

export const SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS',
  ''
);
export type SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS = typeof SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS;

export const SUPERSET_IRS_REPORTING_INDICATOR_STOPS = setEnv(
  'REACT_APP_SUPERSET_IRS_REPORTING_INDICATOR_STOPS',
  'zambia2019'
);
export type SUPERSET_IRS_REPORTING_INDICATOR_STOPS = typeof SUPERSET_IRS_REPORTING_INDICATOR_STOPS;
export const SUPERSET_IRS_REPORTING_INDICATOR_ROWS = setEnv(
  'REACT_APP_SUPERSET_IRS_REPORTING_INDICATOR_ROWS',
  'zambia2019'
);
export type SUPERSET_IRS_REPORTING_INDICATOR_ROWS = typeof SUPERSET_IRS_REPORTING_INDICATOR_ROWS;

export const SUPERSET_SMC_REPORTING_INDICATOR_STOPS = setEnv(
  'REACT_APP_SUPERSET_SMC_REPORTING_INDICATOR_STOPS',
  'nigeria2020'
);
export type SUPERSET_SMC_REPORTING_INDICATOR_STOPS = typeof SUPERSET_SMC_REPORTING_INDICATOR_STOPS;
export const SUPERSET_SMC_REPORTING_INDICATOR_ROWS = setEnv(
  'REACT_APP_SUPERSET_SMC_REPORTING_INDICATOR_ROWS',
  'nigeria2020'
);
export type SUPERSET_SMC_REPORTING_INDICATOR_ROWS = typeof SUPERSET_SMC_REPORTING_INDICATOR_ROWS;

export const SUPERSET_SMC_REPORTING_PLANS_SLICE = setEnv(
  'REACT_APP_SUPERSET_SMC_REPORTING_PLANS_SLICE',
  '0'
);
export type SUPERSET_SMC_REPORTING_PLANS_SLICE = typeof SUPERSET_SMC_REPORTING_PLANS_SLICE;
export const SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE',
  '0'
);
export type SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE = typeof SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE;

export const SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES',
  '0'
);
export type SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES = typeof SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES;

export const SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL',
  '99'
);
export type SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = typeof SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL;

export const SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_SLICE',
  '0'
);
export type SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_SLICE = typeof SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_SLICE;

export const SUPERSET_IRS_LITE_REPORTING_STRUCTURES_DATA_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_STRUCTURES_DATA_SLICE',
  '0'
);
export type SUPERSET_IRS_LITE_REPORTING_STRUCTURES_DATA_SLICE = typeof SUPERSET_IRS_LITE_REPORTING_STRUCTURES_DATA_SLICE;

export const SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_COLUMNS',
  ''
);
export type SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_COLUMNS = typeof SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_COLUMNS;

export const SUPERSET_IRS_LITE_REPORTING_FOCUS_AREAS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_FOCUS_AREAS_COLUMNS',
  ''
);
export type SUPERSET_IRS_LITE_REPORTING_FOCUS_AREAS_COLUMNS = typeof SUPERSET_IRS_LITE_REPORTING_FOCUS_AREAS_COLUMNS;

export const SUPERSET_IRS_LITE_REPORTING_INDICATOR_STOPS = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_INDICATOR_STOPS',
  'zambia2020'
);
export type SUPERSET_IRS_LITE_REPORTING_INDICATOR_STOPS = typeof SUPERSET_IRS_LITE_REPORTING_INDICATOR_STOPS;

export const SUPERSET_IRS_LITE_REPORTING_INDICATOR_ROWS = setEnv(
  'REACT_APP_SUPERSET_IRS_LITE_REPORTING_INDICATOR_ROWS',
  'zambia2020'
);
export type SUPERSET_IRS_LITE_REPORTING_INDICATOR_ROWS = typeof SUPERSET_IRS_LITE_REPORTING_INDICATOR_ROWS;

export const SUPERSET_MDA_LITE_REPORTING_INDICATOR_ROWS = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_INDICATOR_ROWS',
  'kenya2021'
);
export type SUPERSET_MDA_LITE_REPORTING_INDICATOR_ROWS = typeof SUPERSET_MDA_LITE_REPORTING_INDICATOR_ROWS;

export const SUPERSET_MDA_LITE_REPORTING_INDICATOR_STOPS = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_INDICATOR_STOPS',
  'kenya2021'
);
export type SUPERSET_MDA_LITE_REPORTING_INDICATOR_STOPS = typeof SUPERSET_MDA_LITE_REPORTING_INDICATOR_STOPS;

export const SUPERSET_STRUCTURES_SLICE = setEnv('REACT_APP_SUPERSET_STRUCTURES_SLICE', '0');
export type SUPERSET_STRUCTURES_SLICE = typeof SUPERSET_STRUCTURES_SLICE;

export const SUPERSET_TASKS_SLICE = setEnv('REACT_APP_SUPERSET_TASKS_SLICE', '0');
export type SUPERSET_TASKS_SLICE = typeof SUPERSET_TASKS_SLICE;

export const SUPERSET_PLANS_TABLE_SLICE = setEnv('REACT_APP_SUPERSET_PLANS_TABLE_SLICE', '0');
export type SUPERSET_PLANS_TABLE_SLICE = typeof SUPERSET_PLANS_TABLE_SLICE;

export const SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE = setEnv(
  'REACT_APP_SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE',
  '0'
);
export type SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE = typeof SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE;

export const SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE = setEnv(
  'REACT_APP_SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE',
  '0'
);
export type SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE = typeof SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE;

export const SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES = setEnv(
  'REACT_APP_SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES',
  '0'
);
export type SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES = typeof SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES;

export const SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_COLUMNS',
  'mdaJurisdictionsColumns'
);
export type SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_COLUMNS = typeof SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_COLUMNS;

export const SUPERSET_MDA_POINT_REPORTING_FOCUS_AREAS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_MDA_POINT_REPORTING_FOCUS_AREAS_COLUMNS',
  'mdaJurisdictionsColumns'
);
export type SUPERSET_MDA_POINT_REPORTING_FOCUS_AREAS_COLUMNS = typeof SUPERSET_MDA_POINT_REPORTING_FOCUS_AREAS_COLUMNS;

export const SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = setEnv(
  'REACT_APP_SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL',
  '99'
);
export type SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = typeof SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL;

export const SUPERSET_MDA_POINT_LOCATION_REPORT_DATA_SLICE = setEnv(
  'REACT_APP_SUPERSET_MDA_POINT_LOCATION_REPORT_DATA_SLICE',
  ''
);
export type SUPERSET_MDA_POINT_LOCATION_REPORT_DATA_SLICE = typeof SUPERSET_MDA_POINT_LOCATION_REPORT_DATA_SLICE;

export const SUPERSET_MDA_POINT_CHILD_REPORT_DATA_SLICE = setEnv(
  'REACT_APP_SUPERSET_MDA_POINT_CHILD_REPORT_DATA_SLICE',
  ''
);
export type SUPERSET_MDA_POINT_CHILD_REPORT_DATA_SLICE = typeof SUPERSET_MDA_POINT_CHILD_REPORT_DATA_SLICE;

export const SUPERSET_DYNAMIC_MDA_REPORTING_PLANS_SLICE = setEnv(
  'REACT_APP_SUPERSET_DYNAMIC_MDA_REPORTING_PLANS_SLICE',
  '0'
);
export type SUPERSET_DYNAMIC_MDA_REPORTING_PLANS_SLICE = typeof SUPERSET_DYNAMIC_MDA_REPORTING_PLANS_SLICE;

export const SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_COLUMNS',
  'zambiaMDAUpper2020'
);
export type SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_COLUMNS = typeof SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_COLUMNS;

export const SUPERSET_DYNAMIC_MDA_REPORTING_FOCUS_AREAS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_DYNAMIC_MDA_REPORTING_FOCUS_AREAS_COLUMNS',
  'zambiaMDALower2020'
);
export type SUPERSET_DYNAMIC_MDA_REPORTING_FOCUS_AREAS_COLUMNS = typeof SUPERSET_DYNAMIC_MDA_REPORTING_FOCUS_AREAS_COLUMNS;

export const SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = setEnv(
  'REACT_APP_SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL',
  '0'
);
export type SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = typeof SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL;

export const SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_DATA_SLICES = setEnv(
  'REACT_APP_SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_DATA_SLICES',
  '0'
);
export type SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_DATA_SLICES = typeof SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_DATA_SLICES;

export const SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES = setEnv(
  'REACT_APP_SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES',
  '0'
);
export type SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES = typeof SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES;

export const SUPERSET_SMC_REPORTING_JURISDICTIONS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_SMC_REPORTING_JURISDICTIONS_COLUMNS',
  'smcJurisdictionsColumns'
);
export type SUPERSET_SMC_REPORTING_JURISDICTIONS_COLUMNS = typeof SUPERSET_SMC_REPORTING_JURISDICTIONS_COLUMNS;

export const SUPERSET_SMC_REPORTING_FOCUS_AREAS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_SMC_REPORTING_FOCUS_AREAS_COLUMNS',
  'smcJurisdictionsColumns'
);
export type SUPERSET_SMC_REPORTING_FOCUS_AREAS_COLUMNS = typeof SUPERSET_SMC_REPORTING_FOCUS_AREAS_COLUMNS;

export const SUPERSET_SMC_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = setEnv(
  'REACT_APP_SUPERSET_SMC_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL',
  '0'
);
export type SUPERSET_SMC_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = typeof SUPERSET_SMC_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL;

/** OpenSRP oAuth2 settings */
export const ENABLE_OPENSRP_OAUTH = setEnv('REACT_APP_ENABLE_OPENSRP_OAUTH', false) === 'true';
export type ENABLE_OPENSRP_OAUTH = typeof ENABLE_OPENSRP_OAUTH;
export const OPENSRP_CLIENT_ID = setEnv('REACT_APP_OPENSRP_CLIENT_ID', '');
export type OPENSRP_CLIENT_ID = typeof OPENSRP_CLIENT_ID;

// notice the ending is NOT / here
export const OPENSRP_ACCESS_TOKEN_URL = setEnv(
  'REACT_APP_OPENSRP_ACCESS_TOKEN_URL',
  'hhttps://opensrp-ops.akros.online/opensrp/oauth/token'
);
export type OPENSRP_ACCESS_TOKEN_URL = typeof OPENSRP_ACCESS_TOKEN_URL;

// notice the ending is NOT / here
export const OPENSRP_AUTHORIZATION_URL = setEnv(
  'REACT_APP_OPENSRP_AUTHORIZATION_URL',
  'hhttps://opensrp-ops.akros.online/opensrp/oauth/authorize'
);
export type OPENSRP_AUTHORIZATION_URL = typeof OPENSRP_AUTHORIZATION_URL;

export const OPENSRP_USER_URL = setEnv(
  'REACT_APP_OPENSRP_USER_URL',
  'hhttps://opensrp-ops.akros.online/opensrp/user-details'
);
export type OPENSRP_USER_URL = typeof OPENSRP_USER_URL;

export const OPENSRP_OAUTH_STATE = setEnv('REACT_APP_OPENSRP_OAUTH_STATE', 'opensrp');
export type OPENSRP_OAUTH_STATE = typeof OPENSRP_OAUTH_STATE;

export const OPENSRP_LOGOUT_URL = setEnv(
  'REACT_APP_OPENSRP_LOGOUT_URL',
  'hhttps://opensrp-ops.akros.online/opensrp/logout.do'
);
export type OPENSRP_LOGOUT_URL = typeof OPENSRP_LOGOUT_URL;

// notice the trailing /
export const OPENSRP_API_BASE_URL = setEnv(
  'REACT_APP_OPENSRP_API_BASE_URL',
  'hhttps://opensrp-ops.akros.online/opensrp/rest/'
);
export type OPENSRP_API_BASE_URL = typeof OPENSRP_API_BASE_URL;

export const OPENSRP_API_V2_BASE_URL = setEnv(
  'REACT_APP_OPENSRP_API_V2_BASE_URL',
  'hhttps://opensrp-ops.akros.online/opensrp/rest/v2/'
);
export type OPENSRP_API_V2_BASE_URL = typeof OPENSRP_API_V2_BASE_URL;

/** Onadata oAuth2 settings */
export const ENABLE_ONADATA_OAUTH = setEnv('REACT_APP_ENABLE_ONADATA_OAUTH', false) === 'true';
export type ENABLE_ONADATA_OAUTH = typeof ENABLE_ONADATA_OAUTH;
export const ONADATA_CLIENT_ID = setEnv('REACT_APP_ONADATA_CLIENT_ID', '');
export type ONADATA_CLIENT_ID = typeof ONADATA_CLIENT_ID;

// notice the ending / here
export const ONADATA_ACCESS_TOKEN_URL = setEnv(
  'REACT_APP_ONADATA_ACCESS_TOKEN_URL',
  'https://stage-api.ona.io/o/token/'
);
export type ONADATA_ACCESS_TOKEN_URL = typeof ONADATA_ACCESS_TOKEN_URL;

// notice the ending / here
export const ONADATA_AUTHORIZATION_URL = setEnv(
  'REACT_APP_ONADATA_AUTHORIZATION_URL',
  'https://stage-api.ona.io/o/authorize/'
);
export type ONADATA_AUTHORIZATION_URL = typeof ONADATA_AUTHORIZATION_URL;

export const ONADATA_USER_URL = setEnv(
  'REACT_APP_ONADATA_USER_URL',
  'https://stage-api.ona.io/api/v1/user.json'
);
export type ONADATA_USER_URL = typeof ONADATA_USER_URL;

export const ONADATA_OAUTH_STATE = setEnv('REACT_APP_ONADATA_OAUTH_STATE', 'onadata');
export type ONADATA_OAUTH_STATE = typeof ONADATA_OAUTH_STATE;

/** The max number of records to get from Superset API endpoint */
export const GISIDA_TIMEOUT = Number(setEnv('REACT_APP_GISIDA_TIMEOUT', 3000));
export type GISIDA_TIMEOUT = typeof GISIDA_TIMEOUT;

export const GISIDA_MAPBOX_TOKEN = setEnv('REACT_APP_GISIDA_MAPBOX_TOKEN', '');
export type GISIDA_MAPBOX_TOKEN = typeof GISIDA_MAPBOX_TOKEN;

export const GISIDA_ONADATA_API_TOKEN = setEnv('REACT_APP_GISIDA_ONADATA_API_TOKEN', '');
export type GISIDA_ONADATA_API_TOKEN = typeof GISIDA_ONADATA_API_TOKEN;

export const DIGITAL_GLOBE_CONNECT_ID = setEnv('REACT_APP_DIGITAL_GLOBE_CONNECT_ID', '');
export type DIGITAL_GLOBE_CONNECT_ID = typeof DIGITAL_GLOBE_CONNECT_ID;

export const DATE_FORMAT = setEnv('REACT_APP_DATE_FORMAT', 'yyyy-MM-dd');
export type DATE_FORMAT = typeof DATE_FORMAT;

export const DEFAULT_TIME = setEnv('REACT_APP_DEFAULT_TIME', 'T00:00:00+00:00');
export type DEFAULT_TIME = typeof DEFAULT_TIME;

export const DEFAULT_PLAN_DURATION_DAYS = setEnv('REACT_APP_DEFAULT_PLAN_DURATION_DAYS', 20);
export type DEFAULT_PLAN_DURATION_DAYS = typeof DEFAULT_PLAN_DURATION_DAYS;

export const DEFAULT_ACTIVITY_DURATION_DAYS = setEnv('REACT_APP_DEFAULT_ACTIVITY_DURATION_DAYS', 7);
export type DEFAULT_ACTIVITY_DURATION_DAYS = typeof DEFAULT_ACTIVITY_DURATION_DAYS;

export const PLAN_UUID_NAMESPACE = setEnv(
  'REACT_APP_PLAN_UUID_NAMESPACE',
  '85f7dbbf-07d0-4c92-aa2d-d50d141dde00'
);
export type PLAN_UUID_NAMESPACE = typeof PLAN_UUID_NAMESPACE;

export const ACTION_UUID_NAMESPACE = setEnv(
  'REACT_APP_ACTION_UUID_NAMESPACE',
  '35968df5-f335-44ae-8ae5-25804caa2d86'
);
export type ACTION_UUID_NAMESPACE = typeof ACTION_UUID_NAMESPACE;

export const PRACTITIONER_ROLE_NAMESPACE = setEnv(
  'REACT_APP_PRACTITIONER_ROLE_NAMESPACE',
  '228272e0-e9ce-11e9-a0d1-15f275801d76'
);
export type PRACTITIONER_ROLE_NAMESPACE = typeof PRACTITIONER_ROLE_NAMESPACE;

export const DEFAULT_PLAN_VERSION = setEnv('REACT_APP_DEFAULT_PLAN_VERSION', '1');
export type DEFAULT_PLAN_VERSION = typeof DEFAULT_PLAN_VERSION;

export const ENABLE_PRACTITIONERS = setEnv('REACT_APP_ENABLE_PRACTITIONERS', false) === 'true';
export type ENABLE_PRACTITIONERS = typeof ENABLE_PRACTITIONERS;

export const PRACTITIONER_FORM_NAMESPACE = setEnv(
  'REACT_APP_PRACTITIONER_FORM_NAMESPACE',
  '78295ac0-df73-11e9-a54b-dbf5e5b2d668'
);
export type PRACTITIONER_FORM_NAMESPACE = typeof PRACTITIONER_FORM_NAMESPACE;

const usersRequestPageSize = setEnv('REACT_APP_USERS_REQUEST_PAGE_SIZE', '1000');
export const USERS_REQUEST_PAGE_SIZE = parseInt(usersRequestPageSize, 10);
export type USERS_REQUEST_PAGE_SIZE = typeof USERS_REQUEST_PAGE_SIZE;

const practitionerRequestPageSize = setEnv('REACT_APP_PRACTITIONER_REQUEST_PAGE_SIZE', '200');
export const PRACTITIONER_REQUEST_PAGE_SIZE = parseInt(practitionerRequestPageSize, 10);
export type PRACTITIONER_REQUEST_PAGE_SIZE = typeof PRACTITIONER_REQUEST_PAGE_SIZE;

const toastAutoCloseDelay = setEnv('REACT_APP_TOAST_AUTO_CLOSE_DELAY', '2000');

export const TOAST_AUTO_CLOSE_DELAY = parseInt(toastAutoCloseDelay, 10);
export type TOAST_AUTO_CLOSE_DELAY = typeof TOAST_AUTO_CLOSE_DELAY;

export const EXPRESS_OAUTH_GET_STATE_URL = setEnv(
  'REACT_APP_EXPRESS_OAUTH_GET_STATE_URL',
  'http://localhost:3000/oauth/state'
);
export type EXPRESS_OAUTH_GET_STATE_URL = typeof EXPRESS_OAUTH_GET_STATE_URL;

export const EXPRESS_OAUTH_LOGOUT_URL = setEnv(
  'REACT_APP_EXPRESS_OAUTH_LOGOUT_URL',
  'http://localhost:3000/logout'
);
export type EXPRESS_OAUTH_LOGOUT_URL = typeof EXPRESS_OAUTH_LOGOUT_URL;

export const BACKEND_ACTIVE = setEnv('REACT_APP_BACKEND_ACTIVE', false) === 'true';
export type BACKEND_ACTIVE = typeof BACKEND_ACTIVE;

export const REACT_APP_VERSION = setEnv('REACT_APP_VERSION', '');
export type REACT_APP_VERSION = typeof REACT_APP_VERSION;

export const REACT_APP_NAME = setEnv('REACT_APP_NAME', '');
export type REACT_APP_NAME = typeof REACT_APP_NAME;

/** list of plan types displayed */
export const DISPLAYED_PLAN_TYPES = String(
  setEnv(
    'REACT_APP_DISPLAYED_PLAN_TYPES',
    'FI,IRS,MDA,MDA-Point,Dynamic-FI,Dynamic-IRS,Dynamic-MDA,MDA-Lite'
  )
).split(',');
export type DISPLAYED_PLAN_TYPES = typeof DISPLAYED_PLAN_TYPES;

/** list of plan types that can be created */
export const PLAN_TYPES_ALLOWED_TO_CREATE = String(
  setEnv(
    'REACT_APP_PLAN_TYPES_ALLOWED_TO_CREATE',
    'FI,IRS,MDA,MDA-Point,Dynamic-FI,Dynamic-IRS,Dynamic-MDA,MDA-Lite'
  )
).split(',');
export type PLAN_TYPES_ALLOWED_TO_CREATE = typeof PLAN_TYPES_ALLOWED_TO_CREATE;

/** list of FI reasons enabled */
export const ENABLED_FI_REASONS = String(setEnv('REACT_APP_ENABLED_FI_REASONS', 'Routine')).split(
  ','
);
export type ENABLED_FI_REASONS = typeof ENABLED_FI_REASONS;

export const NAVBAR_BRAND_IMG_SRC = setEnv(
  'REACT_APP_NAVBAR_BRAND_IMG_SRC',
  'https://github.com/onaio/reveal-frontend/raw/master/src/assets/images/logo.png'
);
export type NAVBAR_BRAND_IMG_SRC = typeof NAVBAR_BRAND_IMG_SRC;

export const REVEAL_BRAND_IMG_SRC = setEnv('REACT_APP_REVEAL_BRAND_IMG_SRC', '');
export type REVEAL_BRAND_IMG_SRC = typeof REVEAL_BRAND_IMG_SRC;

export const SHOW_MDA_SCHOOL_REPORT_LABEL =
  setEnv('REACT_APP_SHOW_MDA_SCHOOL_REPORT_LABEL', false) === 'true';
export type SHOW_MDA_SCHOOL_REPORT_LABEL = typeof SHOW_MDA_SCHOOL_REPORT_LABEL;

/** list of plan types to be added to intervention type field when adding plans */
export const ENABLE_POPULATION_SERVER_SETTINGS =
  setEnv('REACT_APP_ENABLE_POPULATION_SERVER_SETTINGS', false) === 'true';
export type ENABLE_POPULATION_SERVER_SETTINGS = typeof ENABLE_POPULATION_SERVER_SETTINGS;
export const ENABLE_PLANNING = setEnv('REACT_APP_ENABLE_PLANNING', false) === 'true';
export type ENABLE_PLANNING = typeof ENABLE_PLANNING;

export const HIDDEN_MAP_LEGEND_ITEMS = String(
  setEnv('REACT_APP_HIDDEN_MAP_LEGEND_ITEMS', '')
).split(',');
export type HIDDEN_MAP_LEGEND_ITEMS = typeof HIDDEN_MAP_LEGEND_ITEMS;
export const JURISDICTION_METADATA_RISK = setEnv(
  'REACT_APP_JURISDICTION_METADATA_RISK',
  'jurisdiction_metadata-risk'
);
export type JURISDICTION_METADATA_RISK = typeof JURISDICTION_METADATA_RISK;

export const JURISDICTION_METADATA_RISK_PERCENTAGE = setEnv(
  'REACT_APP_JURISDICTION_METADATA_RISK_PERCENTAGE',
  '90'
);
export type JURISDICTION_METADATA_RISK_PERCENTAGE = typeof JURISDICTION_METADATA_RISK_PERCENTAGE;

/** plan types with map disabled during plan assignment */
export const MAP_DISABLED_PLAN_TYPES = String(
  setEnv('REACT_APP_MAP_DISABLED_PLAN_TYPES', '')
).split(',');
export type MAP_DISABLED_PLAN_TYPES = typeof MAP_DISABLED_PLAN_TYPES;

/** list of plan statuses enabled on Manage plans and reporting pages */
export const HIDDEN_PLAN_STATUSES = String(
  setEnv('REACT_APP_HIDDEN_PLAN_STATUSES', 'retired')
).split(',');
export type HIDDEN_PLAN_STATUSES = typeof HIDDEN_PLAN_STATUSES;

export const ENABLE_JURISDICTIONS_AUTO_SELECTION =
  setEnv('REACT_APP_ENABLE_JURISDICTIONS_AUTO_SELECTION', false) === 'true';
export type ENABLE_JURISDICTIONS_AUTO_SELECTION = typeof ENABLE_JURISDICTIONS_AUTO_SELECTION;

export const ENABLE_JURISDICTION_AUTO_SELECTION_FOR_PLAN_TYPES = setEnv(
  'REACT_APP_ENABLE_jURISDICTION_AUTO_SELECTION_FOR_PLAN_TYPES',
  'IRS,Dynamic-IRS'
).split(',');
export type ENABLE_JURISDICTION_AUTO_SELECTION_FOR_PLAN_TYPES = typeof ENABLE_JURISDICTION_AUTO_SELECTION_FOR_PLAN_TYPES;

export const PLAN_TYPES_WITH_MULTI_JURISDICTIONS = setEnv(
  'REACT_APP_PLAN_TYPES_WITH_MULTI_JURISDICTIONS',
  'IRS,Dynamic-IRS,MDA-Point,Dynamic-MDA,MDA-Lite'
);
export type PLAN_TYPES_WITH_MULTI_JURISDICTIONS = typeof PLAN_TYPES_WITH_MULTI_JURISDICTIONS;

export const ASSIGNMENT_PAGE_SHOW_MAP =
  setEnv('REACT_APP_ASSIGNMENT_PAGE_SHOW_MAP', false) === 'true';
export type ASSIGNMENT_PAGE_SHOW_MAP = typeof ASSIGNMENT_PAGE_SHOW_MAP;

export const ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS = setEnv(
  'REACT_APP_ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS',
  'COVERAGE,POPULATION,RISK,STRUCTURE,TARGET,OTHER_POPULATION'
).split(',');
export type ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS = typeof ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS;

export const MDA_POINT_FORM_INTERVENTION_TITLE = setEnv(
  'REACT_APP_MDA_POINT_FORM_INTERVENTION_TITLE',
  'MDA_POINT_TITLE'
);
export type MDA_POINT_FORM_INTERVENTION_TITLE = typeof MDA_POINT_FORM_INTERVENTION_TITLE;
export const KEYCLOAK_LOGOUT_URL = setEnv(
  'REACT_APP_KEYCLOAK_LOGOUT_URL',
  'https://sso-ops.akros.online/auth/realms/reveal-stage/protocol/openid-connect/logout'
);
export type KEYCLOAK_LOGOUT_URL = typeof KEYCLOAK_LOGOUT_URL;

export const SHOW_TEAM_ASSIGN_ON_OPERATIONAL_AREAS_ONLY =
  setEnv('REACT_APP_SHOW_TEAM_ASSIGN_ON_OPERATIONAL_AREAS_ONLY', false) === 'true';
export type SHOW_TEAM_ASSIGN_ON_OPERATIONAL_AREAS_ONLY = typeof SHOW_TEAM_ASSIGN_ON_OPERATIONAL_AREAS_ONLY;

export const ENABLE_HOME_MANAGE_PLANS_LINK =
  setEnv('REACT_APP_ENABLE_HOME_MANAGE_PLANS_LINK', false) === 'true';
export type ENABLE_HOME_MANAGE_PLANS_LINK = typeof ENABLE_HOME_MANAGE_PLANS_LINK;

export const ENABLE_HOME_PLANNING_VIEW_LINK =
  setEnv('REACT_APP_ENABLE_HOME_PLANNING_VIEW_LINK', false) === 'true';
export type ENABLE_HOME_PLANNING_VIEW_LINK = typeof ENABLE_HOME_PLANNING_VIEW_LINK;

export const SUPERSET_IRS_DISTRICT_PERFORMANCE_REPORT_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_DISTRICT_PERFORMANCE_REPORT_SLICE',
  '0'
);
export type SUPERSET_IRS_DISTRICT_PERFORMANCE_REPORT_SLICE = typeof SUPERSET_IRS_DISTRICT_PERFORMANCE_REPORT_SLICE;

export const SUPERSET_IRS_DATA_COLLECTORS_PERFORMANCE_REPORT_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_DATA_COLLECTORS_PERFORMANCE_REPORT_SLICE',
  '0'
);
export type SUPERSET_IRS_DATA_COLLECTORS_PERFORMANCE_REPORT_SLICE = typeof SUPERSET_IRS_DATA_COLLECTORS_PERFORMANCE_REPORT_SLICE;

export const SUPERSET_IRS_SOP_PERFORMANCE_REPORT_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_SOP_PERFORMANCE_REPORT_SLICE',
  '0'
);
export type SUPERSET_IRS_SOP_PERFORMANCE_REPORT_SLICE = typeof SUPERSET_IRS_SOP_PERFORMANCE_REPORT_SLICE;

export const SUPERSET_IRS_SOP_BY_DATE_PERFORMANCE_REPORT_SLICE = setEnv(
  'REACT_APP_SUPERSET_IRS_SOP_BY_DATE_PERFORMANCE_REPORT_SLICE',
  '0'
);
export type SUPERSET_IRS_SOP_BY_DATE_PERFORMANCE_REPORT_SLICE = typeof SUPERSET_IRS_SOP_BY_DATE_PERFORMANCE_REPORT_SLICE;

export const ENABLE_DEFAULT_PLAN_USER_FILTER =
  setEnv('REACT_APP_ENABLE_DEFAULT_PLAN_USER_FILTER', false) === 'true';
export type ENABLE_DEFAULT_PLAN_USER_FILTER = typeof ENABLE_DEFAULT_PLAN_USER_FILTER;

export const OPENSRP_MAX_PLANS_PER_REQUEST = Number(
  setEnv('REACT_APP_OPENSRP_MAX_PLANS_PER_REQUEST', '2000')
);
export type OPENSRP_MAX_PLANS_PER_REQUEST = typeof OPENSRP_MAX_PLANS_PER_REQUEST;

export const TASK_GENERATION_STATUS = setEnv('REACT_APP_TASK_GENERATION_STATUS', IGNORE);
export type TASK_GENERATION_STATUS = typeof TASK_GENERATION_STATUS;

export const ENABLE_IRS_MOPUP_REPORTING = setEnv('REACT_APP_ENABLE_IRS_MOPUP_REPORTING', false);
export type ENABLE_IRS_MOPUP_REPORTING = typeof ENABLE_IRS_MOPUP_REPORTING;

export const SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_DATA_SLICES: string = setEnv(
  'REACT_APP_SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_DATA_SLICES',
  '0'
);
export type SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_DATA_SLICES = typeof SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_DATA_SLICES;

export const SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = setEnv(
  'REACT_APP_SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL',
  '0'
);
export type SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = typeof SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL;

export const SUPERSET_JURISDICTION_EVENTS_SLICE = setEnv(
  'REACT_APP_SUPERSET_JURISDICTION_EVENTS_SLICE',
  '0'
);
export type SUPERSET_JURISDICTION_EVENTS_SLICE = typeof SUPERSET_JURISDICTION_EVENTS_SLICE;

export const ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED = setEnv(
  'REACT_APP_ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED',
  setEnv(
    'REACT_APP_DISPLAYED_PLAN_TYPES',
    'FI,IRS,MDA,MDA-Point,Dynamic-FI,Dynamic-IRS,Dynamic-MDA,IRS-Lite'
  )
).split(',');
export type ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED = typeof ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED;

export const CHECK_SESSION_EXPIRY_STATUS =
  setEnv('REACT_APP_CHECK_SESSION_EXPIRY_STATUS', false) === 'true';
export type CHECK_SESSION_EXPIRY_STATUS = typeof CHECK_SESSION_EXPIRY_STATUS;

/** The number of teams assignments to get from OpenSrp per call */
export const ASSIGNED_TEAMS_REQUEST_PAGE_SIZE = Number(
  setEnv('REACT_APP_ASSIGNED_TEAMS_REQUEST_PAGE_SIZE', 1000)
);
export type ASSIGNED_TEAMS_REQUEST_PAGE_SIZE = typeof ASSIGNED_TEAMS_REQUEST_PAGE_SIZE;

export const OPENSRP_GENERATED_TASKS_INTERVENTIONS = setEnv(
  'REACT_APP_OPENSRP_GENERATED_TASKS_INTERVENTIONS',
  ''
).split(',');
export type OPENSRP_GENERATED_TASKS_INTERVENTIONS = typeof OPENSRP_GENERATED_TASKS_INTERVENTIONS;

export const SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE',
  '0'
);
export type SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE = typeof SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE;

export const SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES',
  '0'
);
export type SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES = typeof SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES;

export const SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS',
  'mdaLiteJurisdictionsColumns'
);
export type SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS = typeof SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS;

export const SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL',
  '99'
);
export type SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = typeof SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL;

export const SHOW_MAP_AT_JURISDICTION_LEVEL = Number(
  setEnv('REACT_APP_SHOW_MAP_AT_JURISDICTION_LEVEL', 99)
);
export type SHOW_MAP_AT_JURISDICTION_LEVEL = typeof SHOW_MAP_AT_JURISDICTION_LEVEL;

export const SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE',
  '0'
);
export type SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE = typeof SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE;

export const SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE',
  '0'
);
export type SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE = typeof SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE;

export const SUPERSET_MDA_LITE_REPORTING_WARD_SLICE = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_WARD_SLICE',
  '0'
);
export type SUPERSET_MDA_LITE_REPORTING_WARD_SLICE = typeof SUPERSET_MDA_LITE_REPORTING_WARD_SLICE;

export const SUPERSET_MDA_LITE_REPORTING_WARD_GEOJSON_SLICE = setEnv(
  'REACT_APP_SUPERSET_MDA_LITE_REPORTING_WARD_GEOJSON_SLICE',
  '0'
);
export type SUPERSET_MDA_LITE_REPORTING_WARD_GEOJSON_SLICE = typeof SUPERSET_MDA_LITE_REPORTING_WARD_GEOJSON_SLICE;
export const HIDE_PLAN_FORM_FIELDS_ON_EDIT = setEnv(
  'REACT_APP_HIDE_PLAN_FORM_FIELDS_ON_EDIT',
  ''
).split(',');
export type HIDE_PLAN_FORM_FIELDS_ON_EDIT = typeof HIDE_PLAN_FORM_FIELDS_ON_EDIT;

export const HIDE_PLAN_FORM_FIELDS_ON_CREATE = setEnv(
  'REACT_APP_HIDE_PLAN_FORM_FIELDS_ON_CREATE',
  ''
).split(',');
export type HIDE_PLAN_FORM_FIELDS_ON_CREATE = typeof HIDE_PLAN_FORM_FIELDS_ON_CREATE;

export const CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES =
  setEnv('REACT_APP_CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES', false) === 'true';
export type CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES = typeof CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES;

export const AUTO_SELECT_FI_CLASSIFICATION =
  setEnv('REACT_APP_AUTO_SELECT_FI_CLASSIFICATION', false) === 'true';
export type AUTO_SELECT_FI_CLASSIFICATION = typeof AUTO_SELECT_FI_CLASSIFICATION;

export const PLAN_LIST_SHOW_FI_REASON_COLUMN =
  setEnv('REACT_APP_PLAN_LIST_SHOW_FI_REASON_COLUMN', false) === 'true';
export type PLAN_LIST_SHOW_FI_REASON_COLUMN = typeof PLAN_LIST_SHOW_FI_REASON_COLUMN;

/** The max number of client records to get from OpenSRP API endpoint */
export const CLIENTS_LIST_BATCH_SIZE = Number(setEnv('REACT_APP_CLIENTS_LIST_BATCH_SIZE', 200));
export type CLIENTS_LIST_BATCH_SIZE = typeof CLIENTS_LIST_BATCH_SIZE;