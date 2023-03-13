import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App';
import { store } from './store/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import 'mapbox-gl/dist/mapbox-gl.css';
import { KeycloakInitOptions } from 'keycloak-js';

const initOptions: KeycloakInitOptions = {
  pkceMethod: 'S256',
  checkLoginIframe: false
};

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
