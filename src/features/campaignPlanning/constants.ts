import { SiteGeometry, SiteType } from './providers/types';

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

export const HIDDEN_DATASET_COLOR = '#c4c8c2';

export const SITE_GEOMETRIES: SiteGeometry[] = ['polygon', 'point'];

export const SITE_SNAP_TOLERANCE_PX = 10;

export const SITE_COLOR = '#087f95';

export const SITE_TYPES: SiteType[] = [
  { id: 'outreach', name: 'outreach', label: 'Outreach sites', geometry: 'polygon' },
  { id: 'static', name: 'static', label: 'Static sites', geometry: 'polygon' },
  { id: 'h2r', name: 'H2R', label: 'H2R sites', geometry: 'polygon' },
  { id: 'mobile', name: 'mobile', label: 'Mobile sites', geometry: 'point' },
  { id: 'school_hpv', name: 'school HPV', label: 'School-based HPV sites', geometry: 'point' }
];
