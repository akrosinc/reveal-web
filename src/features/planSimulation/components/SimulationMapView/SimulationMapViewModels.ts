import { LngLatBounds, Map as MapBoxMap } from 'mapbox-gl';
import { MutableRefObject } from 'react';
import { Color } from 'react-color-palette';
import { EntityTag, PlanningParentLocationResponse, PlanningLocationResponse } from '../../providers/types';
import { StatsLayer, Children, AnalysisLayer } from '../Simulation';

export interface SimulationMapViewProps {
  teamsList?: any[];
  currentLocationChildren: any[]; //
  polygons?: any[]; //
  loading: string;
  leftOpenHandler: () => void;
  rightOpenHandler: () => void;
  leftOpenState: boolean;
  rightOpenState: boolean;
  fullScreenHandler: () => void;
  fullScreen: boolean;
  toLocation: LngLatBounds | undefined;
  entityTags: EntityTag[];
  parentMapData: PlanningParentLocationResponse | undefined;
  setMapDataLoad: (data: PlanningLocationResponse) => void;
  chunkedData: PlanningLocationResponse;
  resetMap: boolean;
  setResetMap: (resetMap: boolean) => void;
  resultsLoadingState: 'notstarted' | 'error' | 'started' | 'complete';
  parentsLoadingState: 'notstarted' | 'error' | 'started' | 'complete';
  stats: StatsLayer;
  map: MutableRefObject<MapBoxMap | undefined>;
  updateMarkedLocations: (identifier: string, ancestry: string[], marked: boolean) => void;
  parentChild: { [parent: string]: Children };
  analysisLayerDetails: AnalysisLayer[];
  selectedLoaction?: any;
  showDatasetsAgainstParentLevel?: boolean;
  updateChildrenPolygons: (data: any) => void;
}

export interface LineWidth {
  layer: string;
  key: string;
  geo: string;
  layerName: string;
  active: boolean;
  col: Color;
  tagList?: Set<any>;
  selectedTag?: string;
  transparency?: number;
  lineWidth?: number;
}

export interface SelectedUserDefinedLayer {
  key: string;
  col: Color;
  transparency?: number;
}

export interface UserDefinedLayer {
  layer: string;
  key: string;
  layerName: string;
  active: boolean;
  col: Color;
  tagList?: Set<any>;
  selectedTag?: string;
  size?: number;
  geo: string;
  lineColor?: string;
  lineWidth?: number;
  transparency?: number;
}

export interface UserDefinedNames {
  layer: string;
  key: string;
  layerName: string;
  active: boolean;
  col: Color;
  tagList?: Set<any>;
  selectedTag?: string;
}

export interface ProcessedLayer {
  list: UserDefinedLayer[] | undefined;
  key: string;
  color: Color;
}

export interface SingleLayer {
  layer: string;
  active: boolean;
  layerName: string;
  geo: string;
  key: string;
  col: Color;
}

export interface ProcessedLayer {
  key: string;
  list: UserDefinedLayer[] | undefined;
  color: Color;
}

export interface Bounds {
  topLeftLon: number;
  topLeftLat: number;
  bottomRightLon: number;
  bottomRightLat: number;
}