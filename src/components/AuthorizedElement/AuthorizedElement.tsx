import { useKeycloak } from '@react-keycloak/web';
import { useAppSelector } from '../../store/hooks';

interface Props {
  children: JSX.Element;
  roles?: string[];
  /** Pass the nav item's own route so visibility is checked against it, not the current URL */
  path?: string;
}

const AuthorizedElement = ({ roles = [], children }: Props) => {
  const { keycloak } = useKeycloak();
  const ctx = useAppSelector(state => state.instanceContext);

  const permissions = ctx?.role?.permissions || [];

  const isAuthorized = (roles: string[]) => {
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

  return isAuthorized(roles) ? children : null;
};

export default AuthorizedElement;

