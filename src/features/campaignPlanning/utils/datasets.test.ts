import { DATASET_COLORS } from '../constants';
import { LocationFeature, SimulationDataset } from '../providers/types';
import { getDatasetColor, getValueBounds } from './datasets';

const dataset = (hexColor?: string): SimulationDataset => ({ identifier: 'd', name: 'D', hexColor });

const location = (metadata: { datasetId: string; value: any }[]) =>
  ({ properties: { metadata } } as unknown as LocationFeature);

describe('getDatasetColor', () => {
  it('uses the dataset colour when it has one', () => {
    expect(getDatasetColor(dataset('#123456'), 3)).toBe('#123456');
  });

  it('falls back to the list colour by position, wrapping around', () => {
    expect(getDatasetColor(dataset(), 1)).toBe(DATASET_COLORS[1]);
    expect(getDatasetColor(dataset(), DATASET_COLORS.length)).toBe(DATASET_COLORS[0]);
  });
});

describe('getValueBounds', () => {
  it('returns the lowest and highest value per dataset', () => {
    const bounds = getValueBounds([
      location([
        { datasetId: 'a', value: 5 },
        { datasetId: 'b', value: 1 }
      ]),
      location([{ datasetId: 'a', value: 2 }]),
      location([{ datasetId: 'a', value: 9 }])
    ]);
    expect(bounds).toEqual({ a: { min: 2, max: 9 }, b: { min: 1, max: 1 } });
  });

  it('skips values that are not numbers and locations without metadata', () => {
    const bounds = getValueBounds([
      location([{ datasetId: 'a', value: '7' }]),
      { properties: {} } as unknown as LocationFeature
    ]);
    expect(bounds).toEqual({});
  });
});
