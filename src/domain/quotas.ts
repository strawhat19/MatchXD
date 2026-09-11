import { ECONOMY } from '../config/economy';
import { PLAN_LIMITS } from '../config/plans';
import { canViewProfile } from './matching';
import { localDay, refreshWallet, walletTotal } from './wallet';
import { AppState, DailyAction, DailyActions, DailyActionUsage } from './types';

export const createDailyActions = (now = new Date()): DailyActions => ({ date: localDay(now), rewind: 0, super: 0, firstMessage: 0 });
export const restoreActivityHistory = (state: AppState): AppState => {
  const missingDaily = !Object.prototype.hasOwnProperty.call(state, `dailyActions`);
  const missingIntros = !Object.prototype.hasOwnProperty.call(state, `introductions`);
  const missingHistory = !Object.prototype.hasOwnProperty.call(state, `contactHistory`);
  if (!missingDaily && !missingIntros && !missingHistory) return state;
  const ledger = Array.isArray(state.wallet?.ledger) ? state.wallet.ledger : [];
  const messages = Array.isArray(state.messages) ? state.messages : [];
  const swipes = Array.isArray(state.swipes) ? state.swipes : [];
  const matches = Array.isArray(state.matches) ? state.matches : [];
  const blocks = Array.isArray(state.blocks) ? state.blocks : [];
  const introductions = Array.isArray(state.introductions) ? state.introductions : [];
  const date = state.wallet?.grantDate;
  const used = (label: string) => new Set(ledger.filter(entry => entry?.label === label && entry.amount < 0 && Number.isFinite(Date.parse(entry.at)) && localDay(new Date(entry.at)) === date).map(entry => entry.id.replace(/_(daily|purchased)$/, ``))).size;
  return {
    ...state,
    ...(missingIntros ? { introductions: [] } : {}),
    ...(missingDaily ? { dailyActions: { date, rewind: used(`Rewind`), super: used(`Super Like`), firstMessage: used(`First Message`) } } : {}),
    ...(missingHistory ? { contactHistory: [...new Set([...matches, ...blocks, ...introductions.map(introduction => introduction?.profileId), ...messages.filter(message => message?.sender === `self`).map(message => message.profileId), ...swipes.filter(swipe => swipe?.id?.startsWith(`Unmatch_`)).map(swipe => swipe.profileId)])] } : {}),
  };
};
export const refreshDailyActions = (actions: DailyActions, now = new Date()) => localDay(now) > actions.date ? createDailyActions(now) : actions;
export const dailyUsage = (state: AppState, now = new Date()): DailyActionUsage => {
  const { rewind, super: superLikes, firstMessage } = refreshDailyActions(restoreActivityHistory(state).dailyActions, now);
  return { rewind, super: superLikes, firstMessage };
};
export const remainingDailyAction = (state: AppState, action: DailyAction, now = new Date()) => Math.max(0, PLAN_LIMITS[refreshWallet(state.wallet, now).plan][action] - dailyUsage(state, now)[action]);
export const introductionAvailability = (state: AppState, profileId: string, now = new Date()): { available: boolean; remaining: number; reason?: string } => {
  state = restoreActivityHistory(state);
  const remaining = remainingDailyAction(state, `firstMessage`, now);
  const target = state.profiles.find(profile => profile.id === profileId);
  const unavailable = (reason: string) => ({ available: false, remaining, reason });
  if (!state.session?.onboarded) return unavailable(`Complete Your 18+ Profile First`);
  if (!target || !canViewProfile(state, target)) return unavailable(`This Conversation Is Unavailable`);
  if (state.matches.includes(profileId)) return unavailable(`Matched Messages Are Free`);
  if (state.introductions.some(introduction => introduction.profileId === profileId)) return unavailable(`First Message Sent — Wait For A Match`);
  if (state.contactHistory.includes(profileId)) return unavailable(`This Conversation Has Ended — A New Match Is Required`);
  if (!remaining) return unavailable(`Daily First Message Limit Reached`);
  if (walletTotal(refreshWallet(state.wallet, now)) < ECONOMY.costs.firstMessage) return unavailable(`Not Enough XOs — Visit Your Wallet`);
  return { available: true, remaining };
};
