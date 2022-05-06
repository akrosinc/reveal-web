import { render } from '@testing-library/react';
import AuthGuard from './AuthGuard';

jest.mock('@react-keycloak/web', () => ({
  useKeycloak: useKeycloak
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => {
    return <div></div>
  }
}));

test('should not return a div', () => {
  const renderResult = render(
    <AuthGuard roles={[]}>
      <div id="test-1"></div>
    </AuthGuard>
  );
  expect(renderResult).toBeTruthy();
});

test('should return a div', () => {
  const renderResult = render(
    <AuthGuard roles={['admin', 'auditor', 'user']}>
      <div id="test-2"></div>
    </AuthGuard>
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
