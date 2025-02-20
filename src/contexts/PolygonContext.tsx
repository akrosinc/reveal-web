import { createContext, useContext, useReducer } from 'react';

type PolygonActions =
  | { type: 'LOCATIONS_WITH_TEAMS_ASSIGNED'; payload: any }
  | { type: 'SET REPORT'; payload: any }
  | { type: 'UPDATE_DATASET_OPACITY'; payload: { [id: string]: number } }
  | { type: 'SET_ASSIGNED'; payload: { [identifier: string]: boolean } }
  | { type: 'SET_PLANID'; payload: string }
  | { type: 'SET_SIMULATION_ID'; payload: any }
  | { type: 'SET_TARGET_AREAS'; payload: any[] }
  | { type: 'SET_HIERARCHY'; payload: any[] }
  | { type: 'SET_NEW_DATASETS'; payload: any[] }
  | { type: 'SET_DATASET'; payload: any[] }
  | { type: 'TOGGLE_DATASET_VISIBILITY'; payload: any }
  | { type: 'ADD_DATASET'; payload: any }
  | { type: 'UPDATE_DATASET'; payload: any }
  | { type: 'DELETE_DATASET'; payload: any }
  | { type: 'UPDATE_DATASET_FILTER'; payload: any }
  | { type: 'SELECT_SINGLE'; payload: any }
  | { type: 'TOGGLE_MULTISELECT'; payload: any }
  | { type: 'SET_ADMIN0_LOCATION_ID'; payload: any }
  | { type: 'SET_DEFAULT_HIERARCHY_DATA'; payload: any }
  | { type: 'SET_LOCATIONS_TEAMS_MAP'; payload: any }
  | { type: 'SET_PLAN_TARGET_TYPE'; payload: string }
  | { type: 'CLEAR_SELECTION' };

// interface Team {
//   id: string;
//   name: string;
//   // Add other properties if needed
// }

// interface LocationsWithAssignedTeams {
//   [locationId: string]: Team[]; // Each location ID maps to an array of assigned teams
// }

interface InitialStateInterface {
  locationsWithAssignedTeams: any; // Now properly typed
  opacitySliderValue: { [id: string]: number };
  // using this as a map with assigned flags for all loaded children,
  // as assigned flag changes and updated location data are not re-fetched from backend
  locationReport: any;
  assingedLocations: { [identifier: string]: boolean };
  simulationId: string;
  planid: string;
  polygons: any[];
  datasets: any[];
  selected: any | null;
  multiselect: any[];
  admin0LocationId: string;
  targetAreas: any[];
  defaultHierarchyData: any;
  locationsTeamsMap: any;
  planTargetType: string;
}

const initialState: InitialStateInterface = {
  locationsWithAssignedTeams: {},
  locationReport: {},
  opacitySliderValue: {},
  assingedLocations: {},
  simulationId: '',
  planid: '',
  polygons: [],
  datasets: [],
  selected: null,
  multiselect: [],
  admin0LocationId: '',
  targetAreas: [],
  defaultHierarchyData: null,
  locationsTeamsMap: {},
  planTargetType: ''
};

export interface SelectedPolygon {
  assigned: boolean;
  childrenNumber: number;
  externalId: string;
  id: string;
  geographicLevel: string;
  name: string;
  parentIdentifier: string;
  simulationSearchResult: boolean;
  status: string;
}

export interface PolygonContextInterface {
  state: InitialStateInterface;
  dispatch: React.Dispatch<PolygonActions>;
}

// Reducer
function polygonReducer(state: InitialStateInterface, action: PolygonActions): InitialStateInterface {
  switch (action.type) {
    case 'LOCATIONS_WITH_TEAMS_ASSIGNED': {
      console.log(action.payload);

      return {
        ...state,
        locationsWithAssignedTeams: action.payload
      };
    }

    case 'SET REPORT':
      return { ...state, locationReport: action.payload };
    case 'UPDATE_DATASET_OPACITY':
      return { ...state, opacitySliderValue: { ...state?.opacitySliderValue, ...action.payload } };
    case 'SET_ASSIGNED':
      return { ...state, assingedLocations: action.payload };
    case 'SET_PLANID':
      return { ...state, planid: action.payload };
    case 'SET_SIMULATION_ID':
      return { ...state, simulationId: action.payload };
    case 'SET_TARGET_AREAS':
      return { ...state, targetAreas: action.payload };
    case 'SET_ADMIN0_LOCATION_ID':
      return { ...state, admin0LocationId: action.payload };
    case 'SET_HIERARCHY':
      return { ...state, polygons: action.payload };
    case 'SET_DEFAULT_HIERARCHY_DATA':
      return { ...state, defaultHierarchyData: action.payload };
    case 'SET_NEW_DATASETS':
      const datasets =
        action.payload.length === 0
          ? []
          : action.payload.map((dataset: any) => ({
            ...dataset,
            hidden: false,
            selectedRange: {
              minValue: dataset.selectedRange?.minValue || 0,
              maxValue: dataset.selectedRange?.maxValue || 0
            },
            filter: {
              minValue: dataset.filter?.minValue || 0,
              maxValue: dataset.filter?.maxValue || 0
            }
          }));
      return {
        ...state,
        datasets
      };
    case 'SET_DATASET':
      return {
        ...state,
        datasets: state.datasets.map((d: any) => {
          const corresponding = action.payload.find(ud => ud.identifier === d.identifier);
          return {
            ...corresponding,
            filter: d.filter,
            selectedRange: d.selectedRange,
            hidden: d.hidden
          };
        })
      };
    case 'DELETE_DATASET':
      return {
        ...state,
        datasets: state.datasets.filter((dataset: any) => dataset.identifier !== action.payload)
      };
    case 'UPDATE_DATASET':
      return {
        ...state,
        datasets: state.datasets.map(dataset =>
          dataset.identifier === action.payload.datasetId
            ? { ...dataset, filter: action.payload.filter, selectedRange: action.payload.filter }
            : dataset
        )
      };
    case 'UPDATE_DATASET_FILTER':
      return {
        ...state,
        datasets: state.datasets.map(dataset =>
          dataset.identifier === action.payload.datasetId
            ? { ...dataset, selectedRange: action.payload.filter || dataset.filter }
            : dataset
        )
      };
    case 'TOGGLE_DATASET_VISIBILITY':
      return {
        ...state,
        datasets: state.datasets.map((dataset: any) =>
          dataset.identifier === action.payload.identifier ? action.payload : dataset
        )
      };
    case 'ADD_DATASET':
      return {
        ...state,
        datasets: [
          ...state.datasets,
          {
            ...action.payload,
            hidden: false,
            selectedRange: {
              minValue: 0,
              maxValue: 0
            },
            filter: {
              minValue: 0,
              maxValue: 0
            }
          }
        ]
      };
    case 'SELECT_SINGLE':
      if (JSON.stringify(state.selected) === JSON.stringify(action.payload?.properties)) {
        return { ...state, selected: null };
      } else {
        return { ...state, selected: action.payload?.properties, multiselect: [] };
      }
    case 'TOGGLE_MULTISELECT':
      const multiselect = state.multiselect.some((item: any) => item.properties.id === action.payload.properties.id)
        ? state.multiselect.filter((item: any) => item.properties.id !== action.payload.properties.id)
        : [...state.multiselect, action.payload];
      return { ...state, multiselect, selected: null };
    case 'CLEAR_SELECTION':
      return { ...state, selected: null, multiselect: [] };
    case 'SET_LOCATIONS_TEAMS_MAP':
      return { ...state, locationsTeamsMap: action.payload };
    case 'SET_PLAN_TARGET_TYPE':
      return { ...state, planTargetType: action.payload };
    default:
      return state;
  }
}

// Context
const PolygonStateContext = createContext(initialState);
const PolygonDispatchContext = createContext<any>(null);

// Provider
export function PolygonProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(polygonReducer, initialState);


  return (
    <PolygonStateContext.Provider value={state}>
      <PolygonDispatchContext.Provider value={dispatch}>{children}</PolygonDispatchContext.Provider>
    </PolygonStateContext.Provider>
  );
}

// Custom Hook
export function usePolygonContext() {
  const state = useContext(PolygonStateContext);
  const dispatch = useContext(PolygonDispatchContext);

  if (state === undefined || dispatch === undefined) {
    throw new Error('usePolygonContext must be used within a PolygonProvider');
  }

  return { state, dispatch };
}
