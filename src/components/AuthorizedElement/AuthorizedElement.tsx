import { useKeycloak } from '@react-keycloak/web';
import { useAppSelector } from '../../store/hooks';
import { STANDARD_USER, SUPER_ADMIN } from '../../constants/userRoles';

interface Props {
  children: JSX.Element;
  roles?: string[];
  /** Pass the nav item's own route so visibility is checked against it, not the current URL */
  path?: string;
}

const AuthorizedElement = ({ roles = [], children }: Props) => {
  const { keycloak } = useKeycloak();
  const ctx = useAppSelector(state => state.instanceContext);
  const isSuperAdmin = ((keycloak?.tokenParsed as any)?.groups || [])?.includes(SUPER_ADMIN);
  const isStandardUser = ((keycloak?.tokenParsed as any)?.groups || [])?.includes(STANDARD_USER);
  const permissions = ctx?.role?.permissions || [];
  // console.log(ctx?.selectedInstance)

  const isAuthorized = (roles: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.some((r) => {
      // Check Keycloak roles
      const hasRealmRole = keycloak?.hasRealmRole(r);
      const hasResourceRole = keycloak?.hasResourceRole(r, 'realm-management');

      // Check backend permissions
      const hasPermission = permissions.includes(r);
      if(isSuperAdmin && ctx?.selectedInstance?.identifier == null){
        // console.log('Super Admin Access Granted');
          return hasRealmRole || hasResourceRole
      }
      if(isStandardUser || (isSuperAdmin && ctx?.selectedInstance)){
        // console.log('Standard User or Super Admin with Global Access Granted');
        return hasPermission
      }
      // return hasRealmRole || hasResourceRole || hasPermission;
    });
  };

  return isAuthorized(roles) ? children : null;
};

export default AuthorizedElement;

