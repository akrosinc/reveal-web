import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./keycloak";
import "mapbox-gl/dist/mapbox-gl.css";

const eventLogger = (event: unknown, error: unknown) => {
  //we can capture all keycloak events here
  //console.log("onKeycloakEvent", event, error);
};

const tokenLogger = (tokens: any) => {
  // we can capture token events here
  //console.log("onToken", tokens);
};

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={eventLogger}
      onTokens={tokenLogger}
    >
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
