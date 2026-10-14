import { DATASET_COLORS } from '../constants';
import { LocationFeature, SimulationDataset, ValueRange } from '../providers/types';

/** The dataset's own colour, or a fallback picked by its position in the list. */
export const getDatasetColor = (dataset: SimulationDataset, index: number): string =>
  dataset.hexColor || DATASET_COLORS[index % DATASET_COLORS.length];

/** Lowest and highest numeric value of each dataset (dataset id → range) among the given locations. */
export const getValueBounds = (locations: LocationFeature[]): Record<string, ValueRange> => {
  const bounds: Record<string, ValueRange> = {};
  locations.forEach(location =>
    location.properties.metadata?.forEach(({ datasetId, value }) => {
      if (typeof value !== 'number') return;
      const current = bounds[datasetId];
      bounds[datasetId] = current
        ? { min: Math.min(current.min, value), max: Math.max(current.max, value) }
        : { min: value, max: value };
    })
  );
  return bounds;
};
