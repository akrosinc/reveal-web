import { useEffect, useState } from 'react';

export const useWindowResize = (element: any) => {
  const scrollHeight = element ? element.scrollHeight : 0;
  const [currentHeight, setCurrentHeight] = useState<number>(scrollHeight);

  useEffect(() => {
    const handleResize = (e: UIEvent) => {
      setCurrentHeight(element.scrollHeight ?? 0);
    };

    if (element) {
      window.addEventListener('resize', handleResize);
      setCurrentHeight(element.scrollHeight);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [element]);

  return currentHeight;
};
