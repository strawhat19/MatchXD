import { storage } from './storage';
import { AppState } from '../domain/types';
import { initialState } from '../data/demoProfiles';
import { refreshState } from '../domain/transition';
import { migrateSnapshot, serializeSnapshot } from './migrations';

export const STORAGE_KEY = `matchxd.demo.v1`;
let writes: Promise<void> = Promise.resolve();
export const loadSnapshot = async (): Promise<{ state: AppState; error: string | null }> => {
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    return { state: raw ? refreshState(migrateSnapshot(raw)) : initialState(), error: null };
  } catch (error) {
    return { state: initialState(), error: `${error instanceof Error ? error.message : `Local Storage Is Unavailable`}. Fresh App Data Is Open; Your Next Saved Action Will Replace The Invalid Copy` };
  }
};
export const saveSnapshot = (state: AppState) => {
  const serialized = serializeSnapshot(state);
  writes = writes.catch(() => undefined).then(() => storage.setItem(STORAGE_KEY, serialized));
  return writes;
};
