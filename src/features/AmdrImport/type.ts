import {HslColor} from "../reporting/providers/types";

export enum AmdrColumnType {
  DRUG = "DRUG",
  HAPLOTYPE = "HAPLOTYPE"
}

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
export interface HeaderName {
  color: HslColor;
  name: string;
}
