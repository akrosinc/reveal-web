import { EntityTagResponse } from '../planSimulation/providers/types';

export interface MetadataFileImportResponse {
  identifier: string;
  filename?: string | null;
  datasetName?: string | null;
  uploadDatetime: string;
  status: string;
  uploadedBy: string;
  selected?: boolean;
  entityTagEvents?: EntityTagResponse[];
  owner: boolean;
  owners: Owners[];
}

export interface Owners {
  id: string;
  username: string;
}
