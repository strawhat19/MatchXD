import type { SignupPlanId } from '../domain/types';

// Interest choices are separate from the preview app's active feature plan.
// Founding is a proposed future price, never a subscription or a payment today.
export const SIGNUP_ORDER: readonly SignupPlanId[] = [`beta`, `founding`];
export const SIGNUP_OPTIONS: Record<SignupPlanId, {
  name: string;
  price: string;
  period: string;
  description: string;
  priceNote: string;
  benefits: readonly string[];
  action: string;
}> = {
  beta: {
    name: `Beta user`,
    price: `$0`,
    period: `/ month`,
    description: `Try it free. Help shape what comes next.`,
    priceNote: `Free beta · $0 today`,
    benefits: [`Explore the free app preview`, `Share your ideas for the first release`, `Help show there’s interest`],
    action: `Join beta free`,
  },
  founding: {
    name: `Founding user`,
    price: `$1`,
    period: `/ month, planned`,
    description: `Interested in affordable premium? Count me in.`,
    priceNote: `Future price · $0 today`,
    benefits: [`Explore the same free app preview`, `Help shape affordable premium features`, `No card, charge, or commitment`],
    action: `Join as founding`,
  },
};

export const SIGNUP_COMPARISON_TITLE = `Two ways to be here early.`;
export const SIGNUP_COMPARISON_INTRO = `Both start free. Founding records interest in a future $1 USD/month plan. Nothing is charged now, and any future payment would need your agreement.`;
export const SIGNUP_PREVIEW_NOTE = `Local preview for adults 18+. Signups and feedback stay on this device; they aren’t sent to the developer yet. Other profiles and activity are samples, and community totals aren’t live.`;
export const SIGNUP_COMPARISON_ROWS: readonly {
  id: string;
  label: string;
  description: string;
  beta: string;
  founding: string;
}[] = [
  { id: `today`, label: `What you pay today`, description: `No checkout. No payment details.`, beta: `$0`, founding: `$0` },
  { id: `access`, label: `Start exploring now`, description: `Create a profile and try the free local app.`, beta: `Free preview`, founding: `Free preview` },
  { id: `feedback`, label: `Help shape the first release`, description: `Tell a solo developer what you want from dating.`, beta: `Your voice matters`, founding: `Your voice matters` },
  { id: `future`, label: `Your interest in the future`, description: `A preference, not a purchase or a promise of launch.`, beta: `Free beta access`, founding: `$1 USD/month premium` },
  { id: `mission`, label: `What we’re building toward`, description: `Useful features and honest matching, at an affordable price.`, beta: `Follow the journey`, founding: `Support the idea` },
];
