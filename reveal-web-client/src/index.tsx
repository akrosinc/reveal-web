import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak';
import { setToBrowser } from './utils';

const eventLogger = (event: unknown, error: unknown) => {
  console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens: any) => {
  //save the token to local storage for request interceptor
  setToBrowser("token", tokens.token);
}

const keycloakProviderInitConfig = {
  onLoad: 'login-required',
}

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider authClient={keycloak} onEvent={eventLogger} onTokens={tokenLogger} initOptions={keycloakProviderInitConfig}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
