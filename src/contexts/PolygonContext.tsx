import { createContext, useContext, useReducer } from 'react';

type PolygonActions =
  | { type: 'SET_POLYGON'; payload: any[] }
  | { type: 'SELECT_SINGLE'; payload: SelectedPolygon }
  | { type: 'TOGGLE_MULTISELECT'; payload: any[] }
  | { type: 'CLEAR_SELECTION' };

interface InitialStateInterface {
  polygons: any[];
  selected: SelectedPolygon | null;
  multiselect: any[];
}

const initialState: InitialStateInterface = {
  polygons: [],
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

// Reducer
function polygonReducer(state: any, action: PolygonActions): any {
  switch (action.type) {
    case 'SET_POLYGON':
      return { ...state, polygons: action.payload };
    case 'SELECT_SINGLE':
      if (state.selected?.externalId === action.payload.externalId) {
        return { ...state, selected: null };
      } else {
        return { ...state, selected: action.payload };
      }

    case 'TOGGLE_MULTISELECT':
      const multiselect = state.multiselect.includes(action.payload)
        ? state.multiselect.filter((id: any) => id !== action.payload)
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
