import {ReportLocationProperties} from "../../providers/types";

export interface LocationResponse {
  id: string;                          // likely UUID
  name: string;
  properties: ReportLocationProperties;
  geometry?: any;                      // depends on your backend structure
  [key: string]: any;                  // optional if extra fields exist
}
export interface FeatureSetResponse {
  identifier: string;                  // UUID → string
  type: string;
  defaultDisplayColumn: string;
  features: LocationResponse[];
  parents: LocationResponse[];
  noLocationData: boolean | null;
  noDashboardData: boolean | null;
}
