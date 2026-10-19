import { useEffect, useState } from 'react';
import { RasterValueRange, getRasterValueRange } from '../../../../utils/rasterValues';

const useRasterValueRange = (rasterId?: string, extent?: unknown) => {
  const [range, setRange] = useState<RasterValueRange>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setRange(undefined);
    if (!rasterId) return;
    let isCurrent = true;
    setIsLoading(true);
    getRasterValueRange(rasterId, extent)
      .then(result => isCurrent && setRange(result))
      .finally(() => isCurrent && setIsLoading(false));
    return () => {
      isCurrent = false;
    };
  }, [rasterId, extent]);

  return { range, isLoading };
};

export default useRasterValueRange;
