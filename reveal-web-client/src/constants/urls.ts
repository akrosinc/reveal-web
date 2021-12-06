const KEYCLOAK_URL = "https://sso-ops.akros.online/";
const REALM_NAME = "reveal";
const CLIENT_ID = "reveal-server";
//redirect uri should be the backend?
const REDIRECT_URI = "https://localhost:3000/oauth/callback/OpenSRP/&response_type=code&state=opensrp&scope=read%20write";
export const KEYCLOAK_LOGIN_URL = KEYCLOAK_URL + "/auth/realms/" + REALM_NAME + "/protocol/openid-connect/auth?client_id=" + CLIENT_ID + "&redirect_uri=" + REDIRECT_URI;