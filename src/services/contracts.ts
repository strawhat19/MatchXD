import { Action, ActionResult, AppState } from '../domain/types';

export type SnapshotStorage = { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void>; removeItem: (key: string) => Promise<void> };
export type LocalAppService = { getState: () => AppState; dispatch: (action: Action) => ActionResult };
export const SERVICE_STATUS = { auth: `Demo Roles`, billing: `Simulated Checkout`, messaging: `Local Scripted Replies`, notifications: `Preferences Only`, mxo: `Local Preference Rules`, directory: `Opt-In Public Links`, moderation: `Demo Owner Review` } as const;
