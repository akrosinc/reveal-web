import { SERVER_ERROR_STRING, UNAUTHORIZED_ERROR_STRING, UNEXPECTED_ERROR_STRING } from '../constants';
import keycloak from '../keycloak';
import { ErrorModel, FieldValidationError } from './providers';

export const errorHandler = (error: any): { message: string | FieldValidationError[]; status?: number } => {
  const { request, response } = error;
  if (response) {
    const { error: errorMessage, fieldValidationErrors, message, statusCode, status } = response.data as ErrorModel;
    if (status === 401 || statusCode === 401 || error.response.status === 401) {
      keycloak.clearToken();
      keycloak.logout();
      return { message: UNAUTHORIZED_ERROR_STRING };
    }
    if (status === 403 || statusCode === 403) {
      return { message: 'You have no permissions for this request.' }
    }
    if (fieldValidationErrors) {
      let message = fieldValidationErrors;
      return { message };
    } else if (message) {
      return { message };
    } else {
      return { message: errorMessage };
    }
  } else if (request) {
    if (request.status === 401 || request.statusCode === 401 || request.code === 401 || error.request.status === 401) {
      keycloak.clearToken();
      keycloak.logout();
      return { message: UNAUTHORIZED_ERROR_STRING };
    }
    //request sent but no response received
    return {
      message: SERVER_ERROR_STRING,
      status: 503
    };
  } else if (error.status === 500) {
    // Handle internal server error
    return { message: error.error };
  } else {
    // This is not handled show unexpected error message
    return { message: UNEXPECTED_ERROR_STRING };
  }
};
