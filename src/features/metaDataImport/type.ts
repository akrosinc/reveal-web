import { EntityTagResponse } from '../planSimulation/providers/types';

export interface MetadataFileImportResponse {
  identifier: string;
  filename: string;
  uploadDatetime: string;
  status: string;
  uploadedBy: string;
  selected?: boolean;
  entityTagEvents?: EntityTagResponse[];
}
