import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { EntityTag } from '../../planSimulation/providers/types';
import { MetaImportTag } from '../providers/types';

export const downloadLocations = async (
  hierarchyIdentifier: string,
  geographicLevelName: string,
  entityTags: string[]
): Promise<BlobPart> => {
  const data = api
    .get<BlobPart>(`location/download/${hierarchyIdentifier}/${geographicLevelName}?entityTags=${entityTags}`, {
      responseType: 'arraybuffer'
    })
    .then(res => res.data);
  return data;
};

export const getEntityTagList = async (): Promise<PageableModel<EntityTag>> => {
  const data = await api.get<PageableModel<EntityTag>>('entityTag').then(res => res.data);
  return data;
};

export const uploadMetaData = async (file: FormData): Promise<string> => {
  const data = await api.post<string>('metaImport', file).then(res => res.data);
  return data;
};

export const getMetadataImportList = async (
  size: number,
  page: number,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<any>> => {
  const data = await api
    .get<PageableModel<any>>(
      `metaImport?size=${size}&page=${page}&_summary=FALSE&root=true&sort=${sortField !== undefined ? sortField : ''},${
        direction ? 'asc' : 'desc'
      }`
    )
    .then(res => res.data);
  return data;
};

export const getMetadataDetailsById = async (metaImportIdentifier: string): Promise<MetaImportTag[]> => {
  const data = await api.get<MetaImportTag[]>(`metaImport/${metaImportIdentifier}`).then(res => res.data);
  return data;
};
