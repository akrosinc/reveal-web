export interface DataExtractQueryResponse {
  id: string;
  planIdentifier: string;
  queryLabel: string;
}

export enum DataExtractSeparator {
  COMMA = "COMMA",
  SEMICOLON = "SEMICOLON",
  PIPE = "PIPE"
}
