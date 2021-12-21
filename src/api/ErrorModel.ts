export interface ErrorModel {
  data: {
    fieldValidationErrors: fieldValidationError[];
    statusCode: number;
    message: string;
  };
}

interface fieldValidationError {
  field: string;
  messageKey: string;
  rejectedValue: string;
}
