import { AREA_TAGS, FILTERABLE_DATASET_SUFFIXES } from '../constants';
import { LocationMetadata, TableFilter, TableFilterRange, TagValues } from '../providers/types';

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const isFilterableDataset = (name: string) =>
  FILTERABLE_DATASET_SUFFIXES.some(suffix => name.trim().toLowerCase().endsWith(suffix));

const toRange = (value: unknown): TableFilterRange => {
  if (!value || typeof value !== 'object') return {};
  const { min, max } = value as Record<string, unknown>;
  const range: TableFilterRange = {};
  if (isNumber(min)) range.min = min;
  if (isNumber(max)) range.max = max;
  return range;
};

export const toTableFilter = (value: unknown, columnIds: string[]): TableFilter => {
  if (!value || typeof value !== 'object') return {};
  return Object.entries(value as Record<string, unknown>).reduce((filter: TableFilter, [id, saved]) => {
    const range = toRange(saved);
    return columnIds.includes(id) && Object.keys(range).length ? { ...filter, [id]: range } : filter;
  }, {});
};

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

export const matchesTableFilter = (values: TagValues, filter: TableFilter) =>
  Object.entries(filter).every(([id, { min, max }]) => {
    const value = values[id];
    return value !== undefined && (min === undefined || value >= min) && (max === undefined || value <= max);
  });

export const isSameTableFilter = (first: TableFilter, second: TableFilter) => {
  const ids = new Set([...Object.keys(first), ...Object.keys(second)]);
  return Array.from(ids).every(id => first[id]?.min === second[id]?.min && first[id]?.max === second[id]?.max);
};
