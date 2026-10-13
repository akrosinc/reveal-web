export const MAP_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v10';

// Basemap options of the layers picker (design state 5)
export const BASEMAPS = [
  { id: 'standard', style: MAP_STYLE_LIGHT },
  { id: 'satellite', style: 'mapbox://styles/mapbox/satellite-streets-v11' },
  { id: 'terrain', style: 'mapbox://styles/mapbox/outdoors-v11' }
];
export const MAP_DEFAULT_CENTER: [number, number] = [28.283333, -15.416667];
export const MAP_DEFAULT_ZOOM = 5;

// Swatch colours for dataset layers, assigned in list order
export const DATASET_COLORS = ['#DF9D2B', '#D65335', '#0B8194', '#1F7A3D', '#B23326', '#7A5BC4'];

// Campaign Management legend colours: areas assigned to the campaign, and those that already have teams
export const ASSIGNED_AREA_COLOR = 'rgba(255, 0, 74, 0.7)';
export const TEAMS_ASSIGNED_AREA_COLOR = 'rgba(128, 128, 128, 0.7)';
