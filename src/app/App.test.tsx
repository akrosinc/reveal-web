import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import App from './App';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '../keycloak';

//Mock mapbox gl
jest.mock('mapbox-gl/dist/mapbox-gl', () => ({
  Map: () => ({}),
}));

test('renders start page', () => {
  const renderResult = render(
    <ReactKeycloakProvider authClient={keycloak}>
      <Provider store={store}>
        <App />
      </Provider>
    </ReactKeycloakProvider>
  );

  expect(renderResult).toBeTruthy();
});
