import { useEffect, useState } from 'react';
import { storage } from '../../storage/storage';

const key = `matchxd.preview.account-navigation.v1`;
export const useNavigationPreference = () => {
  const [expanded, setExpanded] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(``);
  useEffect(() => {
    let active = true;
    storage.getItem(key).then(value => {
      if (active && (value === `true` || value === `false`)) setExpanded(value === `true`);
    }).catch(() => { if (active) setError(`Navigation preference unavailable`); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const toggle = () => {
    if (!ready) return;
    const next = !expanded;
    setExpanded(next);
    storage.setItem(key, String(next)).then(() => setError(``)).catch(() => setError(`Navigation preference is in memory only`));
  };
  return { expanded, ready, error, toggle };
};
