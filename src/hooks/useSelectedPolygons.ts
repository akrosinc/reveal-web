import { useContext } from 'react';
import SelectedPolygonsContext from '../contexts/SelectedPolygonsContext';

const useSelectedPolygons = () => {
  const context = useContext(SelectedPolygonsContext);
  if (!context) {
    throw new Error('useSelectedPolygons must be used within a SelectedPolygonsProvider');
  }
  return context;
};

export default useSelectedPolygons;
