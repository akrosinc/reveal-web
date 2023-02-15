import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { Tag, TagCreateRequest, TagUpdateRequest } from '../providers/types';

export const getAllTags = (
  size: number,
  page: number,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<Tag>> => {
  const data = api
    .get<PageableModel<Tag>>(
      `entityTag?size=${size}&page=${page}&_summary=FALSE&root=true&sort=${sortField !== undefined ? sortField : ''},${
        direction ? 'asc' : 'desc'
      }`
    )
    .then(res => res.data);
  return data;
};

export const getAllGlobalTags = (
  size: number,
  page: number,
  search?: string,
  sortField?: string,
  direction?: boolean
): Promise<PageableModel<Tag>> => {
  const data = api
    .get<PageableModel<Tag>>(
      `entityTag?filter=global&search=${search !== undefined ? search : ''}&size=${size}&page=${page}&_summary=FALSE&root=true&sort=${sortField !== undefined ? sortField : ''},${
        direction ? 'asc' : 'desc'
      }`
    )
    .then(res => res.data);
  return data;
};

export const updateTag = (
  tag: TagUpdateRequest,
): void => {
  api
    .put<TagUpdateRequest>(
      `entityTag`, tag
    )
    .then(res => res.data);
};

export const createTag = async (form: TagCreateRequest): Promise<Tag> => {
  const data = await api.post<Tag>('entityTag', form).then(res => res.data);
  return data;
}
