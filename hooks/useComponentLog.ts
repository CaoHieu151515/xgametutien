import { useEffect } from 'react';
import { log } from '../services/logService';

export const useComponentLog = (componentName: string) => {
  useEffect(() => {
    log(componentName, 'Component Mounted', 'RENDER');
    return () => {
      log(componentName, 'Component Unmounted', 'RENDER');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
