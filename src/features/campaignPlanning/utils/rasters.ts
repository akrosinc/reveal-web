import { parseColorOrGradient } from '../../../utils/rasterHelper';
import { PlanSimulation, RasterDataset } from '../providers/types';

const DEFAULT_RASTER_COLOR = '#fd8d3c';

const isRaster = (dataset: any): boolean =>
  [dataset.datasetType, dataset.dataSetType, dataset.dataset_type, dataset.type].includes('RASTER');

export const toRasterDataset = (raw: any): RasterDataset => {
  const identifier = raw.identifier || raw.id || raw.tagId || raw.datasetId;
  return {
    identifier,
    datasetIdentifier: raw.datasetIdentifier || raw.mapLayer?.layerIdentifier || raw.datasetId || identifier,
    name: raw.name || raw.mapLayer?.name || raw.datasetName || raw.label || identifier,
    colorRamp: raw.colorRamp || raw.hexColor || DEFAULT_RASTER_COLOR,
    opacity: raw.opacity ?? 1,
    hidden: raw.hidden ?? false
  };
};

export const splitRasterDatasets = (simulation: PlanSimulation): PlanSimulation => {
  const datasets = simulation.datasets ?? [];
  const rasters = new Map<string, RasterDataset>();
  [...(simulation.rasterDatasets ?? []), ...datasets.filter(isRaster)].forEach(raw => {
    const raster = toRasterDataset(raw);
    if (raster.identifier && !rasters.has(raster.identifier)) rasters.set(raster.identifier, raster);
  });
  return {
    ...simulation,
    datasets: datasets.filter(dataset => !isRaster(dataset)),
    rasterDatasets: Array.from(rasters.values())
  };
};

export const getRasterBackground = (colorRamp?: string): string =>
  `linear-gradient(to right, ${parseColorOrGradient(colorRamp).colors.join(', ')})`;
