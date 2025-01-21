import { createContext, useContext, useReducer } from 'react';

type PolygonActions =
  { type: 'SET_SIMULATION_ID'; payload: any }
  | { type: 'SET_HIERARCHY'; payload: any[] }
  | { type: 'SET_DATASET'; payload: any[] }
  | { type: 'TOGGLE_DATASET_VISIBILITY'; payload: any }
  | { type: 'ADD_DATASET'; payload: any }
  | { type: 'SELECT_SINGLE'; payload: any }
  | { type: 'TOGGLE_MULTISELECT'; payload: any }
  | { type: 'SET_ADMIN0_LOCATION_ID'; payload: any }
  | { type: 'CLEAR_SELECTION' };

interface InitialStateInterface {
  simulationId: string;
  polygons: any[];
  datasets: any[];
  selected: any | null;
  multiselect: any[];
  admin0LocationId: string;
}

const initialState: InitialStateInterface = {
  simulationId: '',
  polygons: [],
  datasets: [],
  selected: null,
  multiselect: [],
  admin0LocationId: ''
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
    case 'SET_SIMULATION_ID':
      return { ...state, simulationId: action.payload };
    case 'SET_ADMIN0_LOCATION_ID':
      return { ...state, admin0LocationId: action.payload };
    case 'SET_HIERARCHY':
      return { ...state, polygons: action.payload };
    case 'SET_DATASET':
      return {
        ...state, datasets: action.payload.map((dataset: any) => ({
          ...dataset,
          hidden: false
        }))
      };

    case 'TOGGLE_DATASET_VISIBILITY':
      return { ...state, datasets: state.datasets.map((dataset: any) => dataset.identifier === action.payload.identifier ? action.payload : dataset) }
    case 'ADD_DATASET':
      return { ...state, datasets: [...state.datasets, action.payload] };
    case 'SELECT_SINGLE':
      if (JSON.stringify(state.selected) === JSON.stringify(action.payload?.properties)) {
        return { ...state, selected: null };
      } else {
        return { ...state, selected: action.payload?.properties, multiselect: [] };
      }
    case 'TOGGLE_MULTISELECT':
      const multiselect = state.multiselect.some(
        (item: any) => item.properties.id === action.payload.properties.id
      )
        ? state.multiselect.filter((item: any) => item.properties.id !== action.payload.properties.id)
        : [...state.multiselect, action.payload];
      return { ...state, multiselect, selected: null };
    case 'CLEAR_SELECTION':
      return { ...state, selected: null, multiselect: [] };
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
