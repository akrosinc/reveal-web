export interface ErrorModel {
    fieldValidationErrors: fieldValidationError[];
    statusCode: number;
    message: string;
    error: string;
}

interface fieldValidationError {
  field: string;
  messageKey: string;
  rejectedValue: string;
}
