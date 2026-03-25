import { useKeycloak } from '@react-keycloak/web';
import { useAppSelector } from '../store/hooks';

/**
 * Custom hook for authorization checks.
 * Returns true if the user has at least one of the required roles or permissions.
 * 
 * @param roles Array of roles or permissions to check against.
 * @returns boolean indicating if the user is authorized.
 */
export const useAuthorization = (roles: string[] = []): boolean => {
  const { keycloak } = useKeycloak();
  const ctx = useAppSelector(state => state.instanceContext);

  const permissions = ctx?.role?.permissions || [];

  if (!roles || roles.length === 0) return true;

  return roles.some((r) => {
    // Check Keycloak roles
    const hasRealmRole = keycloak?.hasRealmRole(r);
    const hasResourceRole = keycloak?.hasResourceRole(r, 'realm-management');

    // Check backend permissions
    const hasPermission = permissions.includes(r);

    return hasRealmRole || hasResourceRole || hasPermission;
  });
};
