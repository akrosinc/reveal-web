export interface TableReportRequest {
  planIdentifier: string;
  reportTypeEnum: string;
  parentLocationIdentifier: string | null;
  getChildren: boolean;
}

export interface MapDataReportRequest {
  planIdentifier: string;
  reportTypeEnum: string;
  parentLocationIdentifier: string | null;
}

export interface ReportResponse {
  parentLocationIdentifier: string;
  reportIdentifier: string;
  planIdentifier: string;
  rowData: RowData[];
}

export interface RowData {
  locationIdentifier: string;
  locationName: string;
  childrenNumber: number;
  columnDataMap: { [x: string]: FoundCoverage };
}

export interface FoundCoverage {
  value: number;
  isPercentage: boolean;
  meta: string;
}

export enum ReportType {
  MDA_FULL_COVERAGE = 'MDA_FULL_COVERAGE',
  MDA_FULL_COVERAGE_OPERATIONAL_AREA_LEVEL = "MDA_FULL_COVERAGE_OPERATIONAL_AREA_LEVEL",
  IRS_FULL_COVERAGE = "IRS_FULL_COVERAGE"
}
