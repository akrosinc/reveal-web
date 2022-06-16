import { useEffect } from 'react';
import api from '../../api/axios';
import { errorHandler } from '../../api/errorHandler';
import { showLoader } from '../../features/reducers/loader';
import keycloak from '../../keycloak';
import { useAppDispatch } from '../../store/hooks';

const ErrorHandler = ({ children }: { children: JSX.Element}) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    // Request interceptor to inject bearer token
    api.interceptors.request.use(function (config) {
      dispatch(showLoader(true));
      // Inject Bearer token in every request
      config.headers = {
        Authorization: `Bearer ${keycloak.token}`
      };
      return config;
    });

    // Add a response interceptor
    api.interceptors.response.use(
      response => {
        dispatch(showLoader(false));
        return response;
      },
      error => {
        dispatch(showLoader(false));
        const { message } = errorHandler(error);
        return Promise.reject(message);
      }
    );
  }, [dispatch]);

  return children;
};

export default ErrorHandler;
