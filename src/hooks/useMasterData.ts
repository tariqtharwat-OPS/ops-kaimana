import { useState, useEffect } from 'react';
import { masterDataService } from '../services/masterDataService';
import { where } from 'firebase/firestore';

export function useMasterData(collectionName: string, includeInactive = false) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const constraints = includeInactive ? [] : [where('active_status', '==', true)];
    
    try {
      const unsubscribe = masterDataService.subscribe(collectionName, (docs) => {
        setData(docs);
        setLoading(false);
      }, constraints);

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, includeInactive]);

  return { data, loading, error };
}
