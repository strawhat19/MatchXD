import { ECONOMY } from './economy';
import type { PlanId } from '../domain/types';
import { hasTier, PLANS, PLAN_LIMITS } from './plans';

export type PlanComparisonRow = {
  id: string;
  label: string;
  minimum: PlanId;
  description: string;
  cost?: number;
  unit?: string;
  limit?: keyof typeof PLAN_LIMITS.free;
  kind?: `daily` | `metered` | `limited` | `free`;
};
export type PlanComparisonCell = { kind: `included` | `unavailable` | `value`; label: string; detail?: string };

const discoveryCosts = [...new Set([ECONOMY.costs.pass, ECONOMY.costs.like])];
export const PLAN_DAILY_ACTIONS: { id: keyof typeof PLAN_LIMITS.free; label: string; cost: number; description: string }[] = [
  { id: `rewind`, label: `Rewinds`, cost: ECONOMY.costs.rewind, description: `Revisit your last swipe. Separate daily limit.` },
  { id: `super`, label: `Super Likes`, cost: ECONOMY.costs.super, description: `Show extra interest. Separate daily limit.` },
  { id: `firstMessage`, label: `First messages`, cost: ECONOMY.costs.firstMessage, description: `One introduction per person until you match, even after a daily reset.` },
];
export const planActionAllowances = (plan: PlanId) => PLAN_DAILY_ACTIONS.map(action => ({ ...action, limit: PLAN_LIMITS[plan][action.id] }));
export const PLAN_MATCHED_CHAT = `Free, unlimited messages with matches`;
export const PLAN_INTRO_NOTE = `Send one introduction per person before matching. Wait for a match before sending more; matched chats are free and unlimited.`;
export const PLAN_LIMITS_NOTE = `Separate daily limits reset at midnight New York time. Unused actions don’t roll over. Purchased XOs don’t bypass these limits.`;
export const PLAN_COMPARISON_TITLE = `A little more in every plan.`;
export const PLAN_COMPARISON_INTRO = `Every plan includes the essentials. Choose the extras that feel right for you.`;
export const PLAN_COMPARISON_CURRENCY_NOTE = `USD · Daily XOs reset at midnight New York time. Purchased XOs don’t expire.`;
export const PLAN_COMPARISON_NOTE = `Daily XO totals include the grants from earlier tiers. Charged actions use your available balance, with daily XOs spent before purchased XOs.`;
export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  { id: `daily`, label: `Daily XOs`, minimum: `free`, kind: `daily`, description: `A fresh balance, every day.` },
  { id: `profile`, label: `Profiles & introductions`, minimum: `free`, description: `Photos, interests, and voice or video introductions.` },
  { id: `discovery`, label: `Discover & match`, minimum: `free`, kind: `metered`, cost: discoveryCosts.length === 1 ? discoveryCosts[0] : undefined, unit: `per action`, description: `Pass or like. Uses your available XO balance.` },
  ...PLAN_DAILY_ACTIONS.map(action => ({ id: action.id, label: action.label, minimum: `free` as const, kind: `limited` as const, limit: action.id, cost: action.cost, description: action.description })),
  { id: `messages`, label: `Messages with matches`, minimum: `free`, kind: `free`, description: `Keep talking after a mutual match. No XO cost or daily cap.` },
  { id: `mxo`, label: `MXO wingmate`, minimum: `free`, kind: `metered`, cost: ECONOMY.costs.mxo, unit: `per request`, description: `Find common ground through your own words.` },
  { id: `profiler`, label: `Profiler directory`, minimum: `free`, description: `Opt-in profiles and public links people choose to share.` },
  { id: `basic`, label: `Core preferences`, minimum: `free`, description: `Age, distance, gender, lifestyle, and introduction filters.` },
  { id: `ethnicity`, label: `Ethnicity preferences`, minimum: `m`, description: `An extra way to shape your discovery preferences.` },
  { id: `height-salary`, label: `Height & salary preferences`, minimum: `mx`, description: `Filter by the details people choose to provide.` },
  { id: `incognito`, label: `Incognito mode`, minimum: `mxd`, description: `Only people you like can find your profile.` },
  { id: `safety`, label: `Blocking & reporting`, minimum: `free`, description: `Always available. Never costs XOs.` },
];

export const comparisonCellFor = (row: PlanComparisonRow, plan: PlanId): PlanComparisonCell => {
  if (!hasTier(plan, row.minimum)) return { kind: `unavailable`, label: `Not included` };
  if (row.kind === `daily`) return { kind: `value`, label: `${PLANS[plan].daily} XOs`, detail: `each day` };
  if (row.kind === `free`) return { kind: `value`, label: `Free`, detail: `Unlimited` };
  if (row.kind === `limited` && row.limit) return { kind: `value`, label: `${PLAN_LIMITS[plan][row.limit]} / day`, detail: `${row.cost} XO each` };
  if (row.kind === `metered` && row.cost !== 0) return { kind: `value`, label: row.cost === undefined ? `Uses XOs` : `${row.cost} XO${row.cost === 1 ? `` : `s`}`, detail: row.unit };
  return { kind: `included`, label: `Included` };
};
