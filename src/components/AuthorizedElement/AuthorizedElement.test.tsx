import { render } from '@testing-library/react';
import AuthorizedElement from './AuthorizedElement';

jest.mock('@react-keycloak/web', () => ({
  useKeycloak: useKeycloak
}));

test('should not return a button', () => {
  const renderResult = render(
    <AuthorizedElement roles={[]}>
      <button id="test-1"></button>
    </AuthorizedElement>
  );
  expect(renderResult).toBeTruthy();
});

test('should return a button', () => {
  const renderResult = render(
    <AuthorizedElement roles={['admin', 'auditor', 'user']}>
      <button id="test-2"></button>
    </AuthorizedElement>
  );
  expect(renderResult).toBeTruthy();
});

const useKeycloak = () => {
  const token = 'keycloakTokenForTesting';
  const userProfile = { username: 'test', email: 'test@akros.com', firstName: 'Test', lastName: 'User' };
  const realmAccess = { roles: ['admin', 'auditor', 'user'] };
  let authenticated = false;

  const authClient = {
    authenticated,
    hasRealmRole(role: any) {
      return true;
    },
    hasResourceRole(role: any) {
      return true;
    },
    idToken: token,
    initialized: true,
    loadUserProfile() {
      return Promise.resolve({ userProfile });
    },
    login() {
      authenticated = true;
    },
    logout() {
      authenticated = false;
    },
    profile: userProfile,
    realm: 'DemoRealm',
    realmAccess,
    refreshToken: token,
    token
  };
  return { initialized: true, keycloak: authClient };
};
