import {HslColor} from "../reporting/components/AmdrReport/types";


export interface LocationNode {
  id: string; // UUID as string
  parentId?: string | null;
  name: string;
  children?: LocationNode[];
  geoLevel:string;

}

export interface LocationNodeDetails{
  geoLevels:string[];
  nodes:LocationNode[];
}

export interface AmdrImportResponse {
  identifier: string;
  filename: string;
  uploadDatetime: string;
  status: string;
  uploadedBy: string;
}

export interface AmdrImportStatus {
  status :string;
  count: number;
}

export interface AmdrImportResultsResponse {
  statuses: AmdrImportStatus[];
}
export interface HeaderName {
  color: HslColor;
  name: string;
}
