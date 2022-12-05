export interface MapDataReportRequest {
  planIdentifier: string;
  reportTypeEnum: string;
  parentLocationIdentifier: string | null;
}

export interface FoundCoverage {
  value: any;
  isPercentage: boolean;
  meta: string;
  dataType: string;
  isHidden: boolean;
}

export enum ReportType {
  MDA_FULL_COVERAGE = 'MDA_FULL_COVERAGE',
  MDA_LITE_COVERAGE = 'MDA_LITE_COVERAGE',
  MDA_FULL_COVERAGE_OPERATIONAL_AREA_LEVEL = 'MDA_FULL_COVERAGE_OPERATIONAL_AREA_LEVEL',
  IRS_FULL_COVERAGE = 'IRS_FULL_COVERAGE',
  IRS_LITE_COVERAGE = 'IRS_LITE_COVERAGE',
  IRS_LITE_COVERAGE_OPERATIONAL_AREA_LEVEL = 'IRS_LITE_COVERAGE_OPERATIONAL_AREA_LEVEL',
  SURVEY = 'SURVEY',
  LSM_HOUSEHOLD_SURVEY = 'LSM_HOUSEHOLD_SURVEY',
  LSM_HABITAT_SURVEY = 'LSM_HABITAT_SURVEY',
  DEFAULT = 'DEFAULT'
}



export interface ReportLocationProperties {
  id: string;
  name: string;
  assigned: boolean;
  numberOfTeams: number;
  childrenNumber: number;
  geographicLevel: string;
  columnDataMap: { [x: string]: FoundCoverage };
  distCoveragePercent: number;
  numberOfChildrenTreated: number;
  numberOfChildrenEligible: number;
  defaultColumnValue: number | undefined;
  statusColor: string | undefined;
  evaluatedColor: string;
}

export enum IrsStructureStatus {
  NOT_SPRAYED = 'Not Sprayed',
  SPRAYED = 'Sprayed',
  NOT_SPRAYABLE = 'Not Sprayable'
}

export enum MdaStructureStatus {
  NOT_VISITED = 'Not Visited',
  COMPLETE = 'Complete',
  NOT_ELIGIBLE = 'Not Eligible',
  SMC_COMPLETE = 'SMC Complete',
  SPAQ_COMPLETE = 'SPAQ Complete'
}

export interface AdditionalReportInfo {
  reportTypeEnum: string;
  dashboardFilter: {
    ntd: string;
  };
}

export interface PerformanceDashboardModel {
  userId: string;
  userName: string;
  userParent: string;
  userLabel: string;
  columnDataMap: { [x: string]: FoundCoverage };
}
