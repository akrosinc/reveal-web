const KEYCLOAK_URL = "https://sso-ops.akros.online/";
const REALM_NAME = "reveal";
const CLIENT_ID = "reveal-web";
//redirect uri should be the backend?
const REDIRECT_URI = "http://localhost:3000&response_type=token";
export const KEYCLOAK_LOGIN_URL = KEYCLOAK_URL + "auth/realms/" + REALM_NAME + "/protocol/openid-connect/auth?client_id=" + CLIENT_ID + "&redirect_uri=" + REDIRECT_URI;