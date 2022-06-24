import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import App from './App';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '../keycloak';
import { PublicPage } from '../components/pages';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000'
  })
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
  const renderResult = render(
    <Provider store={store}>
      <PublicPage />
    </Provider>
  );
  expect(renderResult).toBeTruthy();
});
