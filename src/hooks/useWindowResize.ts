import { useEffect, useState } from 'react';

/**
 * Custom Hook which monitors current window size and updated given element height
 */
export const useWindowResize = (element: any) => {
  const scrollHeight = element ? element.scrollHeight : 0;
  const [currentHeight, setCurrentHeight] = useState<number>(scrollHeight);

  useEffect(() => {
    const handleResize = (e: UIEvent) => {
      setCurrentHeight(element.scrollHeight ?? 0);
    };

    if (element) {
      window.addEventListener('resize', handleResize);
      if (element.scrollHeight > 0) setCurrentHeight(element.scrollHeight);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [element]);

  return currentHeight;
};
