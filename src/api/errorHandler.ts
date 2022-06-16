import { SERVER_ERROR_STRING, UNEXPECTED_ERROR_STRING } from '../constants';
import keycloak from '../keycloak';
import { ErrorModel, FieldValidationError } from './providers';

export const errorHandler = (error: any): { message: string | FieldValidationError[]; status?: number } => {
  const { request, response } = error;
  if (response) {
    const { error, fieldValidationErrors, message, statusCode, status } = response.data as ErrorModel;
    if (status === 401 || statusCode === 401) {
      keycloak.logout();
      return { message: 'Unauthorized request, logging out...' };
    }
    if (fieldValidationErrors) {
      let message = fieldValidationErrors;
      return { message };
    } else if (message) {
      return { message };
    } else {
      return { message: error };
    }
  } else if (request) {
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
