import { transition } from '../domain/transition';
import { initialState } from '../data/demoProfiles';
import { AppState as NativeAppState } from 'react-native';
import { clearProfilePhotos } from '../storage/profilePhotos';
import { loadSnapshot, saveSnapshot } from '../storage/adapter';
import { Action, ActionResult, AppState } from '../domain/types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

type AppContextValue = { state: AppState; ready: boolean; act: (action: Action) => ActionResult; notice: string | null; dismissNotice: () => void; storageError: string | null };
const AppContext = createContext<AppContextValue | null>(null);
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState(initialState);
  const [notice, setNotice] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const current = useRef(state);
  const mounted = useRef(true);
  const hydrated = useRef(false);
  const persist = useCallback((next: AppState) => {
    void saveSnapshot(next).then(() => {
      if (mounted.current) setStorageError(null);
    }).catch(() => {
      if (mounted.current) setStorageError(`Changes Are In Memory Only — Local Storage Is Unavailable Or Full`);
    });
  }, []);
  const act = useCallback((action: Action): ActionResult => {
    if (!hydrated.current) return { ok: false, message: `Still Loading` };
    const next = transition(current.current, action);
    if (next.result.ok && (action.type === `reset` || action.type === `delete-account`)) {
      try { clearProfilePhotos(); }
      catch { next.result.message = `App Data Cleared — Saved Photos Could Not Be Removed`; }
    }
    if (next.state !== current.current) {
      current.current = next.state;
      setState(next.state);
      persist(next.state);
    }
    if (next.result.message) setNotice(next.result.message);
    return next.result;
  }, [persist]);
  useEffect(() => {
    let cancelled = false;
    mounted.current = true;
    void loadSnapshot().then(result => {
      if (cancelled || !mounted.current) return;
      current.current = result.state;
      hydrated.current = true;
      setState(result.state);
      setStorageError(result.error);
      setReady(true);
      if (!result.error) persist(result.state);
    });
    return () => { cancelled = true; mounted.current = false; };
  }, [persist]);
  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => act({ type: `refresh` }), 30000);
    const listener = NativeAppState.addEventListener(`change`, value => { if (value === `active`) act({ type: `refresh` }); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [act, ready]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  return <AppContext.Provider value={{ state, ready, act, notice, storageError, dismissNotice: () => setNotice(null) }}>{children}</AppContext.Provider>;
};
export const useApp = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error(`useApp Must Be Used Inside AppProvider`);
  return value;
};
