import Keycloak from 'keycloak-js';
import {config} from "./config/config";

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = Keycloak({
  url: config.KEYCLOAK_URL + "auth",
  realm: 'reveal',
  clientId: 'reveal-web',
});

export default keycloak;
