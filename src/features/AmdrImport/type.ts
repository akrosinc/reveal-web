
export interface AmdrImportResponse {
  identifier: string;
  filename: string;
  uploadDatetime: string;
  status: string;
  uploadedBy: string;
}

export interface AmdrImportResultsResponse {
  sampleIds: number;
}
