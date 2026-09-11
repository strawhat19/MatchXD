import { uniqueId } from './identity';
import { PLANS } from '../config/plans';
import { PlanId, Wallet } from './types';
import { ECONOMY } from '../config/economy';

export const localDay = (now = new Date()) => {
  const values = Object.fromEntries(new Intl.DateTimeFormat(`en-US`, { timeZone: ECONOMY.timezone, year: `numeric`, month: `2-digit`, day: `2-digit` }).formatToParts(now).map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};
export const nextResetAt = (now = new Date()) => {
  const today = localDay(now);
  let low = now.getTime();
  let high = low + 27 * 60 * 60 * 1000;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (localDay(new Date(middle)) === today) low = middle;
    else high = middle;
  }
  return new Date(high);
};
export const walletTotal = (wallet: Wallet) => wallet.daily + wallet.purchased;
export const ledgerEntry = (label: string, amount: number, bucket: `daily` | `purchased`, now: Date, id = uniqueId(`XO`)) => ({ id, label, amount, bucket, at: now.toISOString() });
export const createWallet = (now = new Date()): Wallet => ({
  plan: `free`,
  daily: PLANS.free.daily,
  purchased: 0,
  grantTier: PLANS.free.daily,
  adCount: 0,
  cancelAt: null,
  operations: [],
  grantDate: localDay(now),
  ledger: [ledgerEntry(`Daily Free Grant`, PLANS.free.daily, `daily`, now)],
});
export const refreshWallet = (wallet: Wallet, now = new Date()): Wallet => {
  let next = wallet;
  if (next.cancelAt && new Date(next.cancelAt).getTime() <= now.getTime()) {
    next = { ...next, plan: `free`, cancelAt: null };
  }
  const day = localDay(now);
  if (day <= next.grantDate) return next;
  const expired = next.daily ? [ledgerEntry(`Unused Daily XOs Expired`, -next.daily, `daily`, now)] : [];
  return { ...next, daily: PLANS[next.plan].daily, adCount: 0, grantDate: day, grantTier: PLANS[next.plan].daily, ledger: [...next.ledger, ...expired, ledgerEntry(`Daily ${PLANS[next.plan].name} Grant`, PLANS[next.plan].daily, `daily`, now)] };
};
export const spend = (wallet: Wallet, amount: number, label: string, operationId: string, now = new Date()): Wallet | null => {
  if (wallet.operations.includes(operationId)) return wallet;
  if (!Number.isSafeInteger(amount) || amount < 0 || walletTotal(wallet) < amount) return null;
  const daily = Math.min(wallet.daily, amount);
  const purchased = amount - daily;
  const entries = [];
  if (daily) entries.push(ledgerEntry(label, -daily, `daily`, now, `${operationId}_daily`));
  if (purchased) entries.push(ledgerEntry(label, -purchased, `purchased`, now, `${operationId}_purchased`));
  return { ...wallet, daily: wallet.daily - daily, purchased: wallet.purchased - purchased, operations: [...wallet.operations, operationId], ledger: [...wallet.ledger, ...entries] };
};
export const upgradeWallet = (wallet: Wallet, plan: PlanId, operationId: string, now = new Date()): Wallet => {
  if (wallet.operations.includes(operationId)) return wallet;
  const difference = Math.max(0, PLANS[plan].daily - wallet.grantTier);
  const activated = plan !== wallet.plan;
  const entries = difference || activated ? [ledgerEntry(`${PLANS[plan].name} ${activated ? `Plan Activated` : `Upgrade Allowance`}`, difference, `daily`, now, operationId)] : [];
  return { ...wallet, plan, cancelAt: null, daily: wallet.daily + difference, grantTier: Math.max(wallet.grantTier, PLANS[plan].daily), operations: [...wallet.operations, operationId], ledger: [...wallet.ledger, ...entries] };
};
