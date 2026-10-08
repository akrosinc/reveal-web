export const MAP_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v10';

// Basemap options of the layers picker (design state 5)
export const BASEMAPS = [
  { id: 'standard', style: MAP_STYLE_LIGHT },
  { id: 'satellite', style: 'mapbox://styles/mapbox/satellite-streets-v11' },
  { id: 'terrain', style: 'mapbox://styles/mapbox/outdoors-v11' }
];
export const MAP_DEFAULT_CENTER: [number, number] = [28.283333, -15.416667];
export const MAP_DEFAULT_ZOOM = 5;

// Indent per hierarchy level in the left panel tree (px)
export const TREE_INDENT = 11;

// Swatch colours for dataset layers, assigned in list order
export const DATASET_COLORS = ['#DF9D2B', '#D65335', '#0B8194', '#1F7A3D', '#B23326', '#7A5BC4'];
