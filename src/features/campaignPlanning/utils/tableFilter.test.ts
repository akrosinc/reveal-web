import { LocationMetadata } from '../providers/types';
import {
  getDatasetValues,
  getTagValues,
  isFilterableDataset,
  isSameTableFilter,
  matchesTableFilter,
  toTableFilter
} from './tableFilter';

const item = (type: string, value?: number, datasetId = type): LocationMetadata =>
  ({ type, fieldType: 'IMPORT', datasetId, ...(value === undefined ? {} : { value }) } as LocationMetadata);

describe('isFilterableDataset', () => {
  it('allows only min and max datasets', () => {
    expect(isFilterableDataset('asthma-min')).toBe(true);
    expect(isFilterableDataset('Asthma-MAX ')).toBe(true);
    expect(isFilterableDataset('asthma-sum')).toBe(false);
    expect(isFilterableDataset('asthma-average')).toBe(false);
    expect(isFilterableDataset('minimum')).toBe(false);
  });
});

describe('toTableFilter', () => {
  const ids = ['ds-1', 'ds-2', 'ds-3', 'ds-4'];

  it('returns an empty filter for missing or invalid metadata', () => {
    expect(toTableFilter(undefined, ids)).toEqual({});
    expect(toTableFilter(null, ids)).toEqual({});
    expect(toTableFilter('ds-1', ids)).toEqual({});
  });

  it('keeps the given columns with numeric bounds only', () => {
    expect(
      toTableFilter(
        {
          'ds-1': { min: 2, max: '9' },
          'ds-2': { max: 4 },
          removed: { min: 1 },
          'ds-3': {},
          'ds-4': 5
        },
        ids
      )
    ).toEqual({ 'ds-1': { min: 2 }, 'ds-2': { max: 4 } });
  });
});

describe('getDatasetValues', () => {
  it('reads dataset values by dataset id, ignoring the area tags', () => {
    expect(
      getDatasetValues([item('asthma-sum', 870, 'ds-1'), item('asthma-min', undefined, 'ds-2'), item('zones_count', 8)])
    ).toEqual({ 'ds-1': 870 });
  });
});

describe('getTagValues', () => {
  it('reads the area tags that have a value, ignoring datasets', () => {
    expect(getTagValues([item('zones_count', 8), item('schools_count'), item('asthma-sum', 870)])).toEqual({
      zones_count: 8
    });
  });

  it('handles missing metadata', () => {
    expect(getTagValues(undefined)).toEqual({});
  });
});

describe('matchesTableFilter', () => {
  it('matches everything with an empty filter', () => {
    expect(matchesTableFilter({}, {})).toBe(true);
  });

  it('keeps values inside the range, bounds included', () => {
    const filter = { zones_count: { min: 3, max: 5 } };
    expect(matchesTableFilter({ zones_count: 3 }, filter)).toBe(true);
    expect(matchesTableFilter({ zones_count: 5 }, filter)).toBe(true);
    expect(matchesTableFilter({ zones_count: 2 }, filter)).toBe(false);
    expect(matchesTableFilter({ zones_count: 6 }, filter)).toBe(false);
  });

  it('needs every filtered tag to match and drops rows without a value', () => {
    const filter = { zones_count: { min: 1 }, schools_count: { max: 4 } };
    expect(matchesTableFilter({ zones_count: 3, schools_count: 4 }, filter)).toBe(true);
    expect(matchesTableFilter({ zones_count: 3, schools_count: 5 }, filter)).toBe(false);
    expect(matchesTableFilter({ zones_count: 3 }, filter)).toBe(false);
  });
});

describe('isSameTableFilter', () => {
  it('compares bounds regardless of key order', () => {
    expect(
      isSameTableFilter(
        { zones_count: { min: 1 }, schools_count: { max: 2 } },
        { schools_count: { max: 2 }, zones_count: { min: 1 } }
      )
    ).toBe(true);
    expect(isSameTableFilter({ zones_count: { min: 1 } }, { zones_count: { min: 2 } })).toBe(false);
    expect(isSameTableFilter({ zones_count: { min: 1 } }, {})).toBe(false);
  });
});
