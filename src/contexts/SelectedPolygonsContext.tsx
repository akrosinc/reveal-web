// src/context/SelectedPolygonsContext.tsx
import React, { createContext, useState } from 'react';

const SelectedPolygonsContext = createContext<any | undefined>(undefined);

export const SelectedPolygonsProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedPolygons, setSelectedPolygons] = useState<any[]>([]);

  return (
    <SelectedPolygonsContext.Provider value={{ selectedPolygons, setSelectedPolygons }}>
      {children}
    </SelectedPolygonsContext.Provider>
  );
};

export default SelectedPolygonsContext;
