import { LocationSubtype, SiteGeometry, SiteType } from './providers/types';

export const MAP_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v10';
export const MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v10';

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

export const POINT_SITE_RADIUS_M = 1000;

export const SITE_GEOGRAPHIC_LEVEL = 'catchment';

export const SITE_BOUNDARY_LEVEL = 'site';

export const SITE_POINT_LEVEL = 'sitepoint';

export const TAG_MOH_POPULATION = 'moh_population';

export const TAG_USER_POPULATION = 'user_population';

export const TAG_ZONES = 'zones_count';

export const TAG_SCHOOLS = 'schools_count';

export const SITE_COLOR = '#087f95';

export const FILTERABLE_DATASET_SUFFIXES = ['-min', '-max'];

export const SITE_TYPES: SiteType[] = [
  { id: 'outreach', name: 'outreach', label: 'Outreach sites', geometry: 'polygon', subtype: 'OUTREACH' },
  { id: 'static', name: 'static', label: 'Static sites', geometry: 'polygon', subtype: 'STATIC' },
  { id: 'h2r', name: 'H2R', label: 'H2R sites', geometry: 'polygon', subtype: 'H2R' },
  { id: 'mobile', name: 'mobile', label: 'Mobile sites', geometry: 'point', subtype: 'MOBILE' },
  { id: 'school_hpv', name: 'school HPV', label: 'School-based HPV sites', geometry: 'point', subtype: 'SCHOOL' }
];

export const getSiteTargetTag = (subtype: LocationSubtype) => `sites_${subtype.toLowerCase()}_to_add`;

export const getSiteAddedTag = (subtype: LocationSubtype) => `sites_${subtype.toLowerCase()}_added`;

export const AREA_TAGS = [
  TAG_MOH_POPULATION,
  TAG_USER_POPULATION,
  TAG_ZONES,
  TAG_SCHOOLS,
  ...SITE_TYPES.map(type => getSiteTargetTag(type.subtype)),
  ...SITE_TYPES.map(type => getSiteAddedTag(type.subtype))
];
