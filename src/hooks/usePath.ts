import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom Hook which monitors current path and updates the document title
 */
export const usePath = () => {
  const { initialized, keycloak } = useKeycloak();
  const { pathname } = useLocation();

  //Document title function responsible to change page name depending on routing
  useEffect(() => {
    const pageName = pathname.split('/').filter(el => el !== '');

    let title = '';

    if (pageName.length) {
      if (pageName.length > 1) {
        title =
          pageName[0].charAt(0).toUpperCase() +
          pageName[0].slice(1) +
          ' | ' +
          pageName[1]
            .split('-')
            .map(el => {
              return (el = el.charAt(0).toUpperCase() + el.slice(1));
            })
            .join(' ');
      } else {
        title = pageName[0].charAt(0).toUpperCase() + pageName[0].slice(1);
      }
    } else {
      title = initialized && keycloak.authenticated ? 'Home' : 'Public Page';
    }

    title += ' | Reveal Testing Environment';

    document.title = title;
  }, [pathname, keycloak, initialized]);
};
