import { PlanSimulation } from '../providers/types';
import { getRasterBackground, splitRasterDatasets, toRasterDataset } from './rasters';

describe('toRasterDataset', () => {
  it('falls back to the other id, name and colour fields', () => {
    expect(toRasterDataset({ tagId: 't1', datasetName: 'Landcover', hexColor: '#123456' })).toEqual({
      identifier: 't1',
      datasetIdentifier: 't1',
      name: 'Landcover',
      colorRamp: '#123456',
      opacity: 1,
      hidden: false
    });
  });

  it('uses orange when the raster has no colour', () => {
    expect(toRasterDataset({ identifier: 'r1', name: 'R' }).colorRamp).toBe('#fd8d3c');
  });
});

describe('splitRasterDatasets', () => {
  it('moves raster entries out of the datasets list without duplicates', () => {
    const simulation = {
      identifier: 's',
      datasets: [
        { identifier: 'd1', name: 'Asthma' },
        { identifier: 'r1', name: 'Landcover', datasetType: 'RASTER' }
      ],
      rasterDatasets: [{ identifier: 'r1', name: 'Landcover', colorRamp: '#00ff00' }]
    } as unknown as PlanSimulation;

    const result = splitRasterDatasets(simulation);

    expect(result.datasets.map(dataset => dataset.identifier)).toEqual(['d1']);
    expect(result.rasterDatasets).toHaveLength(1);
    expect(result.rasterDatasets?.[0].colorRamp).toBe('#00ff00');
  });
});

describe('getRasterBackground', () => {
  it('uses comma-separated colours as the gradient stops', () => {
    expect(getRasterBackground('#ffffff,#000000')).toBe('linear-gradient(to right, #ffffff, #000000)');
  });

  it('ends a single colour gradient with that colour', () => {
    expect(getRasterBackground('#123456')).toMatch(/#123456\)$/);
  });
});
