export type PlanId = `free` | `m` | `mx` | `mxd`;
export type ThemeMode = `light` | `dark` | `system`;
export type Attribute = `gender` | `ethnicity` | `diet` | `salary` | `politics` | `religion` | `height` | `voice` | `video`;
export type ProfileLink = { label: string; url: string };
export type Profile = {
  id: string;
  number: number;
  name: string;
  dob: string;
  city: string;
  bio: string;
  job: string;
  photos: string[];
  distance: number;
  interests: string[];
  attributes: Partial<Record<Attribute, string>>;
  links: ProfileLink[];
  directoryOptIn: boolean;
  discoverable: boolean;
  incognito: boolean;
  likedIds: string[];
  blockedIds: string[];
  voiceUri?: string;
  videoUri?: string;
};
export type Preferences = {
  ageMin: number;
  ageMax: number;
  distance: number;
  hiddenNames: string[];
  attributes: Record<Attribute, string[]>;
};
export type Settings = {
  theme: ThemeMode;
  incognito: boolean;
  discoverable: boolean;
  notifications: { push: boolean; email: boolean; sms: boolean };
};
export type LedgerEntry = { id: string; label: string; amount: number; bucket: `daily` | `purchased`; at: string };
export type Wallet = {
  plan: PlanId;
  daily: number;
  purchased: number;
  grantDate: string;
  grantTier: number;
  adCount: number;
  cancelAt: string | null;
  ledger: LedgerEntry[];
  operations: string[];
};
export type Swipe = { id: string; profileId: string; kind: `pass` | `like` | `super`; at: string };
export type DailyAction = `rewind` | `super` | `firstMessage`;
export type DailyActionUsage = Record<DailyAction, number>;
export type DailyActions = DailyActionUsage & { date: string };
export type Introduction = { profileId: string; operationId: string; at: string };
export type Message = { id: string; profileId: string; sender: `self` | `profile`; text: string; at: string };
export type Report = { id: string; profileId: string; reason: string; status: `open` | `resolved`; at: string };
export type MxoMessage = { id: string; role: `user` | `assistant`; text: string; recommendations?: string[]; at: string };
export type AppState = {
  version: 1;
  nextProfileNumber: number;
  user: Profile;
  profiles: Profile[];
  session: { role: `member` | `owner`; onboarded: boolean } | null;
  settings: Settings;
  preferences: Preferences;
  wallet: Wallet;
  dailyActions: DailyActions;
  introductions: Introduction[];
  contactHistory: string[];
  swipes: Swipe[];
  matches: string[];
  messages: Message[];
  blocks: string[];
  reports: Report[];
  mxoMessages: MxoMessage[];
};
export type Action =
  | { type: `start-session`; role: `member` | `owner` }
  | { type: `save-user`; profile: Partial<Profile>; complete?: boolean }
  | { type: `save-preferences`; preferences: Preferences }
  | { type: `save-settings`; settings: Partial<Settings> }
  | { type: `swipe`; profileId: string; kind: Swipe[`kind`]; operationId?: string }
  | { type: `rewind`; operationId?: string }
  | { type: `send-message`; profileId: string; text: string; operationId?: string }
  | { type: `ask-mxo`; text: string; operationId?: string }
  | { type: `block` | `unblock` | `unmatch` | `admin-delete-profile`; profileId: string }
  | { type: `report`; profileId: string; reason: string }
  | { type: `resolve-report`; reportId: string }
  | { type: `upgrade`; plan: PlanId; operationId?: string }
  | { type: `purchase`; cents: number; operationId?: string }
  | { type: `admin-save-profile`; profile: Profile }
  | { type: `ad-reward`; operationId?: string }
  | { type: `cancel-plan` | `reset` | `delete-account` | `sign-out` | `refresh` };
export type ActionResult = { ok: boolean; message?: string; matchId?: string };
