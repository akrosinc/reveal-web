import { createContext, useContext, useReducer } from 'react';

type PolygonActions =
  | { type: 'SET_POLYGON'; payload: any[] }
  | { type: 'SET_DATASET'; payload: any[] }
  | { type: 'UPDATE_DATASET'; payload: any }
  | { type: 'SELECT_SINGLE'; payload: any }
  | { type: 'TOGGLE_MULTISELECT'; payload: any }
  | { type: 'CLEAR_SELECTION' };

interface InitialStateInterface {
  polygons: any[];
  datasets: any[];
  selected: any | null;
  multiselect: any[];
}

const initialState: InitialStateInterface = {
  polygons: [],
  datasets: [],
  selected: null,
  multiselect: []
};

export interface SelectedPolygon {
  assigned: boolean;
  childrenNumber: number;
  externalId: string;
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
    case 'SET_DATASET':
      console.log('SET_DATASET', action.payload);

      return { ...state, datasets: action.payload };
    case 'UPDATE_DATASET':
      console.log('UPDATE_DATASET', action.payload);

      const selectedDatasets = state.datasets.some((item: any) => item.identifier === action.payload.identifier)
        ? state.datasets.filter((item: any) => item.identifier !== action.payload.identifier)
        : [...state.datasets, action.payload];
      return { ...state, datasets: selectedDatasets };

    case 'SELECT_SINGLE':
      if (JSON.stringify(state.selected) === JSON.stringify(action.payload?.properties)) {
        return { ...state, selected: null };
      } else {
        return { ...state, selected: action.payload?.properties };
      }
    case 'TOGGLE_MULTISELECT':
      const multiselect = state.multiselect.some(
        (item: any) => item.properties.externalId === action.payload.properties.externalId
      )
        ? state.multiselect.filter((item: any) => item.properties.externalId !== action.payload.properties.externalId)
        : [...state.multiselect, action.payload];
      return { ...state, multiselect };
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
