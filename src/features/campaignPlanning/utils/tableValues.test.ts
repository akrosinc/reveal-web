import { LocationMetadata } from '../providers/types';
import { getDatasetValues, getTagValues } from './tableValues';

const item = (type: string, value?: number, datasetId = type): LocationMetadata =>
  ({ type, fieldType: 'IMPORT', datasetId, ...(value === undefined ? {} : { value }) } as LocationMetadata);

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
