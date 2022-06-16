export interface ErrorModel {
    fieldValidationErrors: FieldValidationError[];
    statusCode: number;
    status: number;
    message: string;
    error: string;
}

export interface FieldValidationError {
  field: string;
  messageKey: string;
  rejectedValue: string;
}
