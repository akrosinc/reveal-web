//import { useAppSelector } from '../store/hooks';
import { useKeycloak } from '@react-keycloak/web';
import { Navigate, useLocation } from 'react-router-dom';


interface Props {
  children: JSX.Element;
  roles: string[];
}

//We will use auth guard to protect routes based on user role

const AuthGuard = ({ children, roles }: Props) => {
  let location = useLocation();

  const { keycloak } = useKeycloak();

  const isAutherized = (roles: string[], clientResource?: string) => {
      if (keycloak && roles) {
          return roles.some(r => {
              const realm =  keycloak.hasRealmRole(r);
              const managementResource = keycloak.hasResourceRole(r, "realm-management");
              return realm || managementResource;
          });
      }
      return false;
  }

  return isAutherized(roles) ? children : <Navigate to="/" state={{ from: location }} />;
}

export default AuthGuard;