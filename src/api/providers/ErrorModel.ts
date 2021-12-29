export interface ErrorModel {
  data: {
    fieldValidationErrors: fieldValidationError[];
    statusCode: number;
    message: string;
    error: string;
    status: number;
  };
}

interface fieldValidationError {
  field: string;
  messageKey: string;
  rejectedValue: string;
}
