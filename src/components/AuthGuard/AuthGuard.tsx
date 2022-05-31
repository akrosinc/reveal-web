import { useKeycloak } from '@react-keycloak/web';
import { Navigate } from 'react-router-dom';

interface Props {
  children: JSX.Element;
  roles: string[];
}

//We will use auth guard to protect routes based on user role

const AuthGuard = ({ children, roles }: Props) => {

  const { keycloak } = useKeycloak();

  const isAutherized = (realmRoles: string[]) => {
    //If all provided roles match condition user has permissions
    if (keycloak && realmRoles) {
      let expectedRoles = realmRoles.filter(r => {
        const realm = keycloak.hasRealmRole(r);
        const managementResource = keycloak.hasResourceRole(r, 'realm-management');
        return realm || managementResource;
      });
      if (expectedRoles.length === realmRoles.length) {
        return true;
      }
    }
    return false;
  };

  return isAutherized(roles) ? children : <Navigate to="/" />;
};

export default AuthGuard;
