import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import App from './App';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '../keycloak';
import { PublicPage } from '../components/pages';

//Mock mapbox gl
jest.mock('mapbox-gl/dist/mapbox-gl', () => ({
  Map: () => ({})
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

test('is public page rendered', () => {
  const renderResult = render(<PublicPage />);
  expect(renderResult).toBeTruthy();
});

test('expect login button to be present', () => {
  const renderResult = render(
    <ReactKeycloakProvider authClient={keycloak}>
      <Provider store={store}>
        <App />
      </Provider>
    </ReactKeycloakProvider>
  );
  expect(renderResult.container.querySelector('#login-button')).toBeTruthy();
});
