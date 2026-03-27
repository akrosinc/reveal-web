import { useKeycloak } from '@react-keycloak/web';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface Props {
  children: JSX.Element;
  roles?: string[];
}

const AuthGuard = ({ children, roles = [] }: Props) => {
  const { keycloak } = useKeycloak();
  const location = useLocation();
  const ctx = useAppSelector(state => state.instanceContext);
  const isSuperAdmin = ((keycloak?.tokenParsed as any)?.groups || [])?.includes('/super_admin');
  const isStandardUser = ((keycloak?.tokenParsed as any)?.groups || [])?.includes('/standard_user');
  const permissions = ctx?.role?.permissions || [];

  // const isAuthorized = (roles: string[]) => {
  //   const pathname = location.pathname;

  //   // Special case for Instance Configuration: only allowed for non-standard users
  //   const isStandardUser = ((keycloak?.tokenParsed as any)?.groups || [])?.includes('/standard_user');
  //   if (isStandardUser && pathname === '/instance-configuration') return false;

  //   // Home is public for authenticated users
  //   if (pathname === '/') return true;

  //   if (!roles || roles.length === 0) return true;

  //   return roles.some((r) => {
  //     // Check Keycloak roles
  //     const hasRealmRole = keycloak?.hasRealmRole(r);
  //     const hasResourceRole = keycloak?.hasResourceRole(r, 'realm-management');

  //     // Check backend permissions from Redux
  //     const hasPermission = permissions.includes(r);

  //     return hasRealmRole || hasResourceRole || hasPermission;
  //   });
  // };
  const isAuthorized = (roles: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.some((r) => {
      // Check Keycloak roles
      const hasRealmRole = keycloak?.hasRealmRole(r);
      const hasResourceRole = keycloak?.hasResourceRole(r, 'realm-management');

      // Check backend permissions
      const hasPermission = permissions.includes(r);
      if (isSuperAdmin && ctx?.selectedInstance?.identifier == null) {
        console.log('Super Admin Access Granted');
        return hasRealmRole || hasResourceRole
      }
      if (isStandardUser || (isSuperAdmin && ctx?.selectedInstance)) {
        console.log('Standard User or Super Admin with Global Access Granted');
        return hasPermission
      }
      // return hasRealmRole || hasResourceRole || hasPermission;
    });
  };

  return isAuthorized(roles) ? children : <Navigate to="/" />;
};

export default AuthGuard;

