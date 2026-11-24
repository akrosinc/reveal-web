import { LocationFeature } from '../providers/types';

const parsePopulation = (population: string): { sum?: number } | undefined => {
  try {
    return JSON.parse(population);
  } catch {
    return undefined;
  }
};

export const getPopulationTotal = (population: LocationFeature['properties']['population']): number | undefined => {
  if (!population) return undefined;
  const sum = typeof population === 'string' ? parsePopulation(population)?.sum : population.sum;
  return typeof sum === 'number' ? Math.round(sum) : undefined;
};
