import { DailyAction, PlanId } from '../domain/types';

export const PLAN_ORDER: PlanId[] = [`free`, `m`, `mx`, `mxd`];
export const DAILY_GRANTS = { free: 33, m: 55, mx: 66, mxd: 99 };
export const PLAN_LIMITS: Record<PlanId, Record<DailyAction, number>> = {
  free: { rewind: 1, super: 1, firstMessage: 1 },
  m: { rewind: 3, super: 3, firstMessage: 3 },
  mx: { rewind: 5, super: 5, firstMessage: 5 },
  mxd: { rewind: 10, super: 10, firstMessage: 10 },
};
const dailyFor = (plan: PlanId) => PLAN_ORDER.slice(0, PLAN_ORDER.indexOf(plan) + 1).reduce((total, tier) => total + DAILY_GRANTS[tier], 0);
export const PLANS: Record<PlanId, { name: string; price: number; daily: number; description: string; features: string[] }> = {
  free: { name: `Free`, price: 0, daily: dailyFor(`free`), description: `A real chance to connect`, features: [`Core Discovery`, `Matches & Messages`, `Basic Preferences`] },
  m: { name: `M`, price: 333, daily: dailyFor(`m`), description: `More room for a connection`, features: [`Everything In Free`, `Ethnicity Preferences`, `88 Daily XOs`] },
  mx: { name: `MX`, price: 555, daily: dailyFor(`mx`), description: `Find your kind of person`, features: [`Everything In M`, `Salary & Height Preferences`, `154 Daily XOs`] },
  mxd: { name: `MXD`, price: 1111, daily: dailyFor(`mxd`), description: `Your experience, your terms`, features: [`Everything In MX`, `Incognito Mode`, `253 Daily XOs`] },
};
export const hasTier = (plan: PlanId, required: PlanId) => PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(required);
