import { AREA_TAGS } from '../constants';
import { LocationMetadata, TagValues } from '../providers/types';

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const getTagValues = (metadata?: LocationMetadata[] | null): TagValues =>
  (metadata ?? []).reduce(
    (values: TagValues, item) =>
      AREA_TAGS.includes(item.type) && isNumber(item.value) ? { ...values, [item.type]: item.value } : values,
    {}
  );

export const getDatasetValues = (metadata?: LocationMetadata[] | null): TagValues =>
  (metadata ?? []).reduce(
    (values: TagValues, item) =>
      !AREA_TAGS.includes(item.type) && isNumber(item.value) ? { ...values, [item.datasetId]: item.value } : values,
    {}
  );
