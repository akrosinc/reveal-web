export interface BesdFailedIntegrationRetry {
  id: number;
  vendorIntegrationId: number;
  startDate: string;
  endDate: string;
  httpCode: string;
  errorMessage: string;
}
