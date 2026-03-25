import {ReportLocationProperties} from "../../providers/types";

export interface LocationResponse {
  id: string;                          // likely UUID
  name: string;
  properties: ReportLocationProperties;
  geometry?: any;                      // depends on your backend structure
  [key: string]: any;                  // optional if extra fields exist
}

export interface GeneStats {
  wild: number;
  mono: number;
  mixed: number;
  totalRecs: number;
}

export interface HaploGeneMap {
  [geneKey: string]: GeneStats;
}

export interface HaploData {
  [haploKey: string]: HaploGeneMap;
}


export interface FeatureSetResponse {
  identifier: string;                  // UUID → string
  type: string;
  defaultDisplayColumn: string;
  features: LocationResponse[];
  parents: LocationResponse[];
  noLocationData: boolean | null;
  noDashboardData: boolean | null;
  coords: CoordsByYearOrLocationWithTicks;
  markers: HaploData;

}



export interface Coord {
  x: number[];
  y: number[];
  z: number[];
  name: string;
}

export interface CoordsByYearOrLocation {
  [key: string]: { [location: string]: { [location: string]: Coord } };
}

export interface CoordsByYearOrLocationWithTicks {
  coordsByYearOrLocation: CoordsByYearOrLocation;
  xtickValues: number[];
  xtickNames: string[];
  ytickValues: number[];
  ytickNames: string[];
}

export interface Marker {
  color?: string;
  size?: number;
}

export interface BaseTrace {
  type: 'bar' | 'scatter';
  x: string[];
  y: number[];
  name: string;
  hovertemplate?: string;
}


export interface BarTrace extends BaseTrace {
  type: 'bar';
  base?: number[];
  width?: number;
  customdata?: number[];
  additionalData?: number[];
  marker?: Marker;
}


export interface Line {
  color?: string;
  width?: number;
}

export interface LineTrace extends BaseTrace {
  type: 'scatter';
  mode: 'lines' | 'lines+markers';
  line?: Line;
  marker?: Marker;
}

export type Trace = BarTrace | LineTrace;




export interface Xaxis {
  type?: 'date' | 'category';
  tickvals?: string[];
  ticktext?: string[];
  tickfont:{
      size:number;
  }
  fixedrange?: boolean;
}

export interface Yaxis {
  title: {
    text:string;
    font:{
      size:number;
    }
  };
  tickfont:{
    size:number;
  }
}

export interface Layout {
  xaxis: Xaxis;
  yaxis: Yaxis;
  barmode?: 'overlay' | 'stack' | 'group';
  bargap?: number;
  title: {
    text: string;
    font:{
      size:number;
    }
  },
  legend:{
    font:{
      size:number;
    }
  }
}


export interface AmdrChartData {
  layout: Layout;
  data: Trace[];
}

export interface AmdrTotalsLandingPageData {
  passiveCases: number;
  rcdCases: number;
  cases: number;
  parasitologyReports: number;
  importedSequences: number;
}

export interface AmdrTotalsPercentageLandingPageData {
  parasitologyToCasesPercentage: number;
  importToCasesPercentage: number;
  importToParasitologyPercentage: number;
}
export interface AmdrLandPageResponse {
  parasitologyData: AmdrChartData;
  importData: AmdrChartData;
  parasitologyImportData: AmdrChartData;
  amdrTotalsLandingPageData: AmdrTotalsLandingPageData;
  amdrTotalsPercentageLandingPageData :AmdrTotalsPercentageLandingPageData;
}


