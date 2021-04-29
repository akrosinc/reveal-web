import { join } from 'path';

export const EXPRESS_OPENSRP_ACCESS_TOKEN_URL = 'http://reveal-stage.smartregister.org/opensrp/oauth/token';
export type EXPRESS_OPENSRP_ACCESS_TOKEN_URL = typeof EXPRESS_OPENSRP_ACCESS_TOKEN_URL;

export const EXPRESS_OPENSRP_AUTHORIZATION_URL = 'http://reveal-stage.smartregister.org/opensrp/oauth/authorize';
export type EXPRESS_OPENSRP_AUTHORIZATION_URL = typeof EXPRESS_OPENSRP_AUTHORIZATION_URL;

export const EXPRESS_OPENSRP_CALLBACK_URL = 'http://localhost:3000/oauth/callback/OpenSRP/';
export type EXPRESS_OPENSRP_CALLBACK_URL = typeof EXPRESS_OPENSRP_CALLBACK_URL;

export const EXPRESS_OPENSRP_USER_URL = 'http://reveal-stage.smartregister.org/opensrp/user-details';
export type EXPRESS_OPENSRP_USER_URL = typeof EXPRESS_OPENSRP_USER_URL;

export const EXPRESS_SESSION_FILESTORE_PATH = '/tmp/express-sessions';
export type EXPRESS_SESSION_FILESTORE_PATH = typeof EXPRESS_SESSION_FILESTORE_PATH;

export const EXPRESS_PRELOADED_STATE_FILE = '/tmp/revealState.json';
export type EXPRESS_PRELOADED_STATE_FILE = typeof EXPRESS_PRELOADED_STATE_FILE;

export const EXPRESS_SESSION_LOGIN_URL = '/login';
export type EXPRESS_SESSION_LOGIN_URL = typeof EXPRESS_SESSION_LOGIN_URL;

export const FRONTEND_OPENSRP_CALLBACK_URL = '/fe/oauth/callback/opensrp';
export type FRONTEND_OPENSRP_CALLBACK_URL = typeof FRONTEND_OPENSRP_CALLBACK_URL;

export const EXPRESS_OPENSRP_OAUTH_STATE = 'opensrp';
export type EXPRESS_OPENSRP_OAUTH_STATE = typeof EXPRESS_OPENSRP_OAUTH_STATE;

export const EXPRESS_OPENSRP_CLIENT_ID = process.env.EXPRESS_OPENSRP_CLIENT_ID;
export type EXPRESS_OPENSRP_CLIENT_ID = typeof EXPRESS_OPENSRP_CLIENT_ID;

export const EXPRESS_OPENSRP_CLIENT_SECRET = process.env.EXPRESS_OPENSRP_CLIENT_SECRET;
export type EXPRESS_OPENSRP_CLIENT_SECRET = typeof EXPRESS_OPENSRP_CLIENT_SECRET;

export const EXPRESS_PORT = 3000;
export type EXPRESS_PORT = typeof EXPRESS_PORT;

export const EXPRESS_SESSION_NAME = 'reveal-session';
export type EXPRESS_SESSION_NAME = typeof EXPRESS_SESSION_NAME;

export const EXPRESS_SESSION_SECRET = 'hunter2';
export type EXPRESS_SESSION_SECRET = typeof EXPRESS_SESSION_SECRET;

export const EXPRESS_SESSION_PATH = '/';
export type EXPRESS_SESSION_PATH = typeof EXPRESS_SESSION_PATH;

export const EXPRESS_REACT_BUILD_PATH = join(__dirname, 'build');

export const EXPRESS_FRONTEND_OPENSRP_CALLBACK_URL = 'http://localhost:3000/oauth/callback/opensrp';

export const EXPRESS_FRONTEND_LOGIN_URL = '/fe/login';

export const EXPRESS_ALLOW_TOKEN_RENEWAL = true;

export const EXPRESS_MAXIMUM_SESSION_LIFE_TIME = 3600;

export const EXPRESS_SERVER_LOGOUT_URL= 'http://localhost:3000/logout';
export const EXPRESS_OPENSRP_LOGOUT_URL= 'https://reveal-stage.smartregister.org/opensrp/logout.do';
export const EXPRESS_KEYCLOAK_LOGOUT_URL= 'https://keycloak-stage.smartregister.org/auth/realms/reveal-stage/protocol/openid-connect/logout';

export const EXPRESS_MAXIMUM_LOGS_FILE_SIZE = 5242880;
export const EXPRESS_MAXIMUM_LOG_FILES_NUMBER = 5;
export const EXPRESS_LOGS_FILE_PATH = '/tmp/logs/reveal-express-server.log';
