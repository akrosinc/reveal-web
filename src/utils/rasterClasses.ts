export interface RasterColorClass {
  from: number;
  to: number;
  color: string;
}

export const MIN_RASTER_CLASSES = 2;
export const MAX_RASTER_CLASSES = 12;

const DEFAULT_CLASS_BREAKS = [0, 1, 3, 7, 15, 35, 75, 150, 300, 600, 1200];
const DEFAULT_CLASS_COUNT = 5;

export const RASTER_CLASSES_METADATA_KEY = 'rasterClasses';

export type RasterMetadata = Record<string, unknown>;

const rasterClassesStore = new Map<string, RasterColorClass[]>();

export const getRasterClasses = (rasterId?: string): RasterColorClass[] | undefined =>
  rasterId ? rasterClassesStore.get(rasterId) : undefined;

export const setRasterClasses = (rasterId: string, classes?: RasterColorClass[]) => {
  if (classes && classes.length) {
    rasterClassesStore.set(rasterId, classes);
  } else {
    rasterClassesStore.delete(rasterId);
  }
};

const isColorClass = (item: any): item is RasterColorClass =>
  Boolean(item) && Number.isFinite(item.from) && Number.isFinite(item.to) && typeof item.color === 'string';

export const getRasterClassesFromMetadata = (metadata?: RasterMetadata | null): RasterColorClass[] | undefined => {
  const value = metadata?.[RASTER_CLASSES_METADATA_KEY];
  return Array.isArray(value) && value.length && value.every(isColorClass) ? value : undefined;
};

export const withRasterClasses = (metadata: RasterMetadata | undefined | null, classes?: RasterColorClass[]) => ({
  ...(metadata ?? {}),
  [RASTER_CLASSES_METADATA_KEY]: classes ?? []
});

export const syncRasterClasses = (rasterId: string | undefined, metadata?: RasterMetadata | null) => {
  if (rasterId) setRasterClasses(rasterId, getRasterClassesFromMetadata(metadata));
};

export const pickClassColors = (colors: string[], count: number): string[] => {
  if (!colors.length) return [];
  return Array.from({ length: count }, (_, i) =>
    count === 1 ? colors[colors.length - 1] : colors[Math.round((i / (count - 1)) * (colors.length - 1))]
  );
};

export const splitRasterClasses = (from: number, to: number, count: number, colors: string[]): RasterColorClass[] => {
  const step = (to - from) / count;
  const precision = to - from >= count * 10 ? 1 : 1000;
  const roundValue = (value: number) => Math.round(value * precision) / precision;
  return pickClassColors(colors, count).map((color, i) => ({
    from: i === 0 ? from : roundValue(from + step * i),
    to: i === count - 1 ? to : roundValue(from + step * (i + 1)),
    color
  }));
};

export const getDefaultRasterClasses = (colors: string[], range?: { min: number; max: number }): RasterColorClass[] => {
  if (range && range.max > range.min) {
    return splitRasterClasses(range.min, range.max, DEFAULT_CLASS_COUNT, colors);
  }
  const last = DEFAULT_CLASS_BREAKS.length - 1;
  const breaks = Array.from(
    { length: DEFAULT_CLASS_COUNT + 1 },
    (_, i) => DEFAULT_CLASS_BREAKS[Math.round((i / DEFAULT_CLASS_COUNT) * last)]
  );
  return pickClassColors(colors, DEFAULT_CLASS_COUNT).map((color, i) => ({
    from: breaks[i],
    to: breaks[i + 1],
    color
  }));
};

export const recolorRasterClasses = (classes: RasterColorClass[], colors: string[]): RasterColorClass[] => {
  const picked = pickClassColors(colors, classes.length);
  return classes.map((item, i) => ({ ...item, color: picked[i] ?? item.color }));
};

const sortClasses = (classes: RasterColorClass[]) => [...classes].sort((a, b) => a.from - b.from);

const usesPaletteColors = (classes: RasterColorClass[], colors: string[]) =>
  pickClassColors(colors, classes.length).every((color, i) => color === classes[i].color);

export const addRasterClass = (classes: RasterColorClass[], colors: string[]): RasterColorClass[] => {
  const sorted = sortClasses(classes);
  const last = sorted[sorted.length - 1];
  if (!last) return [{ from: 0, to: 100, color: colors[colors.length - 1] }];
  const width = last.to > last.from ? last.to - last.from : 10;
  const next = [...sorted, { from: last.to, to: last.to + width, color: last.color }];
  return usesPaletteColors(sorted, colors) ? recolorRasterClasses(next, colors) : next;
};

export const removeRasterClass = (classes: RasterColorClass[], index: number, colors: string[]): RasterColorClass[] => {
  const removed = classes[index];
  const rest = sortClasses(classes.filter((_, i) => i !== index));
  const before = rest.findIndex(item => item.to === removed.from);
  const after = rest.findIndex(item => item.from === removed.to);
  if (before >= 0) {
    rest[before] = { ...rest[before], to: removed.to };
  } else if (after >= 0) {
    rest[after] = { ...rest[after], from: removed.from };
  }
  return usesPaletteColors(sortClasses(classes), colors) ? recolorRasterClasses(rest, colors) : rest;
};

export const formatRasterClassRange = (item: RasterColorClass) => `${item.from} – ${item.to}`;

export type RasterClassesError = 'invalidValue' | 'fromAboveTo' | 'overlap';

export const getRasterClassesError = (classes: RasterColorClass[]): RasterClassesError | undefined => {
  if (classes.some(item => !Number.isFinite(item.from) || !Number.isFinite(item.to))) return 'invalidValue';
  if (classes.some(item => item.from >= item.to)) return 'fromAboveTo';
  const sorted = [...classes].sort((a, b) => a.from - b.from);
  if (sorted.some((item, i) => i > 0 && item.from < sorted[i - 1].to)) return 'overlap';
  return undefined;
};

export const buildClassColorExpression = (valueExpression: any, classes: RasterColorClass[]): any => {
  const sorted = [...classes].sort((a, b) => a.from - b.from);
  return [
    'case',
    ...sorted.flatMap((item, i) => [
      ['all', ['>=', valueExpression, item.from], [i === sorted.length - 1 ? '<=' : '<', valueExpression, item.to]],
      item.color
    ]),
    'rgba(0, 0, 0, 0)'
  ];
};
