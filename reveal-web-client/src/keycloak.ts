import Keycloak from 'keycloak-js'
 
// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = Keycloak('/keycloak.json');
keycloak.flow = "implicit";
keycloak.responseType = "id_token token";
 
export default keycloak