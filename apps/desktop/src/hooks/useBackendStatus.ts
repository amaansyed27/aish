import { useEffect, useState } from 'react';
import { backendStatus } from '../lib/api';

export function useBackendStatus() {
  const [status, setStatus] = useState('checking backend');

  useEffect(() => {
    backendStatus()
      .then(setStatus)
      .catch(() => setStatus('frontend preview'));
  }, []);

  return status;
}
