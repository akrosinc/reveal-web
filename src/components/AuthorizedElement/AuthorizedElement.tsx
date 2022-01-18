import { useKeycloak } from '@react-keycloak/web';

interface Props {
  children: JSX.Element;
  roles: string[];
}

//Wrapper function to show or hide any element depending on user role - PrivateRoutes
const AuthorizedElement = ({ roles, children }: Props) => {
  const { keycloak } = useKeycloak();

  const isAutherized = (roles: string[], clientResource?: string) => {
    if (keycloak && roles) {
      if (roles.length === 0) {
        return true;
      } else {
        return roles.some(r => {
          const realm = keycloak.hasRealmRole(r);
          const managementResource = keycloak.hasResourceRole(r, 'realm-management');
          return realm || managementResource;
        });
      }
    }
    return false;
  };

  return isAutherized(roles) ? children : null;
};

export default AuthorizedElement;
