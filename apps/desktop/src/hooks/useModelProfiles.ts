import { useEffect, useState } from 'react';
import { listModelProfiles, type ModelProfile } from '../lib/api';

export function useModelProfiles() {
  const [profiles, setProfiles] = useState<ModelProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');

  useEffect(() => {
    listModelProfiles()
      .then((items) => {
        setProfiles(items);
        setSelectedProfileId(String(items[0]?.id ?? ''));
      })
      .catch(() => setProfiles([]));
  }, []);

  return { profiles, selectedProfileId, setSelectedProfileId };
}
