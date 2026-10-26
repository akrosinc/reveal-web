import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { SUPER_ADMIN } from '../constants/userRoles';
import { getInstanceContext } from '../features/instance/api';
import { clearCurrentInstance, setCurrentInstance } from '../features/reducers/instanceContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';

/**
 * Loads the user's instance context after login (or clears it after logout) and applies the dark mode class,
 * for every page whichever header it shows
 */
export const useInstanceContextLoader = () => {
  const { keycloak, initialized } = useKeycloak();
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  useEffect(() => {
    if (initialized) {
      if (keycloak.authenticated) {
        const rawCurrentInstance = localStorage.getItem('currentInstanceContext');
        const isSuperAdmin = ((keycloak?.tokenParsed as any)?.groups || [])?.includes(SUPER_ADMIN);

        // Only fetch default context if we don't have a persisted one
        if (!rawCurrentInstance) {
          getInstanceContext()
            .then(res => {
              let result: any = res;
              if (isSuperAdmin) {
                const globalTemplate = { ...res, selectedInstance: null };
                localStorage.setItem('SUPERADMIN_DATA', JSON.stringify(globalTemplate));
                result = globalTemplate;
              }
              dispatch(setCurrentInstance(result));
            })
            .catch(err => {
              if (err?.response?.status === 404) {
                dispatch(clearCurrentInstance());
              }
            });
        } else if (isSuperAdmin && !localStorage.getItem('SUPERADMIN_DATA')) {
          // If super admin and we have an instance context but missing SUPERADMIN_DATA, fetch it once
          getInstanceContext().then(res => {
            const globalTemplate = { ...res, selectedInstance: null };
            localStorage.setItem('SUPERADMIN_DATA', JSON.stringify(globalTemplate));
          });
        }
      } else {
        localStorage.removeItem('SUPERADMIN_DATA');
        dispatch(clearCurrentInstance());
      }
    }
  }, [keycloak.authenticated, initialized, dispatch]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);
};
