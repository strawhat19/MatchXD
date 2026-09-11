import { ECONOMY } from '../config/economy';
import { profileId, uniqueId } from './identity';
import { hasTier, PLANS } from '../config/plans';
import { initialState } from '../data/demoProfiles';
import { recommendLocally } from '../services/local/mxo';
import { isProfile, preferencesError, profileError } from './validation';
import { ledgerEntry, refreshWallet, spend, upgradeWallet } from './wallet';
import { Action, ActionResult, AppState, Attribute, Profile } from './types';
import { canViewProfile, discoveryProfiles, matchesPreferences } from './matching';
import { introductionAvailability, refreshDailyActions, remainingDailyAction, restoreActivityHistory } from './quotas';

export type Transition = { state: AppState; result: ActionResult };
export const refreshState = (state: AppState, now = new Date()): AppState => {
  state = restoreActivityHistory(state);
  const wallet = refreshWallet(state.wallet, now);
  const dailyActions = refreshDailyActions(state.dailyActions, now);
  const incognito = state.settings.incognito && wallet.plan === `mxd`;
  if (wallet === state.wallet && dailyActions === state.dailyActions && incognito === state.settings.incognito) return state;
  const attributes = { ...state.preferences.attributes };
  if (!hasTier(wallet.plan, `m`)) attributes.ethnicity = [];
  if (!hasTier(wallet.plan, `mx`)) { attributes.height = []; attributes.salary = []; }
  return { ...state, wallet, dailyActions, preferences: { ...state.preferences, attributes }, settings: { ...state.settings, incognito }, user: { ...state.user, incognito } };
};
const cleanProfile = (profile: Profile): Profile => ({ ...profile, name: profile.name.trim(), city: profile.city.trim(), job: profile.job.trim(), bio: profile.bio.trim(), interests: [...new Set(profile.interests.map(value => value.trim()).filter(Boolean))], links: profile.links.map(link => ({ label: link.label.trim(), url: link.url.trim() })) });
const removeConnection = (state: AppState, profileId: string): AppState => ({ ...state, contactHistory: state.matches.includes(profileId) || state.messages.some(message => message.profileId === profileId) ? [...new Set([...state.contactHistory, profileId])] : state.contactHistory, matches: state.matches.filter(id => id !== profileId), messages: state.messages.filter(message => message.profileId !== profileId), user: { ...state.user, likedIds: state.user.likedIds.filter(id => id !== profileId) } });
export const transition = (previous: AppState, action: Action, now = new Date()): Transition => {
  let state = refreshState(previous, now);
  const done = (message?: string, extra: Partial<ActionResult> = {}): Transition => ({ state, result: { ok: true, ...(message ? { message } : {}), ...extra } });
  const fail = (message: string): Transition => ({ state, result: { ok: false, message } });
  const operationId = `operationId` in action ? action.operationId || uniqueId(action.type) : uniqueId(action.type);
  const charge = (amount: number, label: string) => {
    const wallet = spend(state.wallet, amount, label, operationId, now);
    if (!wallet) return false;
    state = { ...state, wallet };
    return true;
  };
  const target = `profileId` in action ? state.profiles.find(profile => profile.id === action.profileId) : undefined;
  if (action.type === `refresh`) return done();
  if (action.type === `reset` || action.type === `delete-account`) {
    state = initialState(now);
    return done(action.type === `reset` ? `App Data Reset` : `Account Data Deleted`);
  }
  if (action.type === `cancel-onboarding`) {
    if (state.session && !state.session.onboarded) state = { ...state, session: null };
    return done();
  }
  if (action.type === `sign-out`) {
    if (!state.session) return done();
    const onboarded = state.session.onboarded;
    state = { ...state, session: null, onboardingComplete: state.onboardingComplete || onboarded };
    return done(onboarded ? `Signed Out` : undefined);
  }
  if (action.type === `start-session`) {
    if (![`member`, `owner`].includes(action.role)) return fail(`Choose An Account Role`);
    const onboarded = state.onboardingComplete || state.session?.onboarded || false;
    state = { ...state, onboardingComplete: onboarded, session: { role: action.role, onboarded } };
    return done();
  }
  if (!state.session && action.type === `save-settings`) {
    if (Object.keys(action.settings).some(key => key !== `theme`)) return fail(`Sign In To Change Privacy Settings`);
    const theme = action.settings.theme;
    if (!theme || ![`light`, `dark`, `system`].includes(theme)) return fail(`Choose A Valid Theme`);
    state = { ...state, settings: { ...state.settings, theme } };
    return done();
  }
  if (!state.session) return fail(`Sign In To Continue`);
  if (`operationId` in action && action.operationId && state.wallet.operations.includes(action.operationId)) return done(`This Action Was Already Applied`);
  if (action.type === `save-user`) {
    const allowed: (keyof Profile)[] = [`name`, `dob`, `city`, `bio`, `job`, `photos`, `interests`, `attributes`, `links`, `directoryOptIn`, `voiceUri`, `videoUri`];
    const changes = Object.fromEntries(Object.entries(action.profile).filter(([key]) => allowed.includes(key as keyof Profile)));
    const candidate = { ...state.user, ...changes };
    if (!isProfile(candidate)) return fail(profileError(candidate, now) || `Check Your Profile Details`);
    const error = profileError(candidate, now);
    if (error) return fail(error);
    const onboarded = state.session.onboarded || !!action.complete;
    state = { ...state, onboardingComplete: state.onboardingComplete || onboarded, user: cleanProfile(candidate), session: { ...state.session, onboarded } };
    return done(`Profile Saved`);
  }
  if (action.type === `save-settings`) {
    const settings = { ...state.settings, ...action.settings, notifications: { ...state.settings.notifications, ...action.settings.notifications } };
    if (![`light`, `dark`, `system`].includes(settings.theme)) return fail(`Choose A Valid Theme`);
    if (settings.incognito && !hasTier(state.wallet.plan, `mxd`)) return fail(`Incognito Is Included With MXD`);
    if (typeof settings.discoverable !== `boolean` || typeof settings.incognito !== `boolean` || Object.values(settings.notifications).some(value => typeof value !== `boolean`)) return fail(`Choose Valid Settings`);
    state = { ...state, settings, user: { ...state.user, discoverable: settings.discoverable, incognito: settings.incognito } };
    return done(Object.keys(action.settings).some(key => key !== `theme`) ? `Settings Saved` : undefined);
  }
  if (!state.session.onboarded) return fail(`Complete Your 18+ Profile First`);
  if (action.type === `save-preferences`) {
    const error = preferencesError(action.preferences);
    if (error) return fail(error);
    const attributes = action.preferences.attributes;
    if (attributes.ethnicity.length && !hasTier(state.wallet.plan, `m`)) return fail(`Ethnicity Preferences Are Included With M`);
    if ((attributes.salary.length || attributes.height.length) && !hasTier(state.wallet.plan, `mx`)) return fail(`Salary And Height Preferences Are Included With MX`);
    state = { ...state, preferences: { ...action.preferences, hiddenNames: [...new Set(action.preferences.hiddenNames.map(name => name.trim()).filter(Boolean))], attributes: Object.fromEntries(Object.entries(attributes).map(([key, values]) => [key, [...new Set(values)]])) as Record<Attribute, string[]> } };
    return done(`Preferences Saved`);
  }
  if (action.type === `swipe`) {
    if (!target || !canViewProfile(state, target) || !matchesPreferences(state, target)) return fail(`This Profile Is Unavailable`);
    if (!discoveryProfiles(state).some(profile => profile.id === target.id)) return fail(`You Already Viewed This Profile — Use Rewind To Go Back`);
    if (![`pass`, `like`, `super`].includes(action.kind)) return fail(`Choose A Valid Action`);
    if (action.kind === `super` && !remainingDailyAction(state, `super`, now)) return fail(`Daily Super Like Limit Reached`);
    if (!charge(ECONOMY.costs[action.kind], action.kind === `super` ? `Super Like` : action.kind === `like` ? `Like` : `Pass`)) return fail(`Not Enough XOs — Visit Your Wallet`);
    const liked = action.kind !== `pass`;
    const matched = liked && target.likedIds.includes(state.user.id);
    state = { ...state, dailyActions: action.kind === `super` ? { ...state.dailyActions, super: state.dailyActions.super + 1 } : state.dailyActions, contactHistory: matched ? [...new Set([...state.contactHistory, target.id])] : state.contactHistory, swipes: [...state.swipes, { id: operationId, profileId: target.id, kind: action.kind, at: now.toISOString() }], user: { ...state.user, likedIds: liked ? [...new Set([...state.user.likedIds, target.id])] : state.user.likedIds }, matches: matched ? [...new Set([...state.matches, target.id])] : state.matches };
    if (matched) state = { ...state, messages: [...state.messages, { id: uniqueId(`Message`), profileId: target.id, sender: `profile`, text: `Hey ${state.user.name}! Happy we crossed paths. What’s something you’re looking forward to this week?`, at: now.toISOString() }] };
    return done(matched ? `It’s A Match With ${target.name}` : liked ? `Like Sent` : `Profile Passed`, matched ? { matchId: target.id } : {});
  }
  if (action.type === `rewind`) {
    const last = state.swipes.at(-1);
    const profile = state.profiles.find(value => value.id === last?.profileId);
    if (!last || !profile || !canViewProfile(state, profile)) return fail(`No Available Swipe To Rewind`);
    if (state.matches.includes(profile.id)) return fail(`This Like Became A Match — Manage It In Matches`);
    if (!remainingDailyAction(state, `rewind`, now)) return fail(`Daily Rewind Limit Reached`);
    if (!charge(ECONOMY.costs.rewind, `Rewind`)) return fail(`Not Enough XOs — Visit Your Wallet`);
    const keepIntroductionLike = state.introductions.some(introduction => introduction.profileId === last.profileId);
    state = { ...state, dailyActions: { ...state.dailyActions, rewind: state.dailyActions.rewind + 1 }, swipes: state.swipes.slice(0, -1), user: { ...state.user, likedIds: keepIntroductionLike ? state.user.likedIds : state.user.likedIds.filter(id => id !== last.profileId) } };
    return done(`Last Swipe Rewound`);
  }
  if (action.type === `send-message`) {
    if (!target || !canViewProfile(state, target)) return fail(`This Conversation Is Unavailable`);
    const text = action.text.trim();
    if (!text || text.length > 2000) return fail(`Write A Message Up To 2,000 Characters`);
    const firstMessage = !state.matches.includes(target.id);
    if (firstMessage) {
      const availability = introductionAvailability(state, target.id, now);
      if (!availability.available) return fail(availability.reason || `This Conversation Is Unavailable`);
    }
    if (!charge(firstMessage ? ECONOMY.costs.firstMessage : 0, firstMessage ? `First Message` : `Matched Message`)) return fail(`Not Enough XOs — Visit Your Wallet`);
    const matched = !firstMessage || target.likedIds.includes(state.user.id);
    const responses = [`That sounds lovely! I’d love to hear more. What got you into it?`, `I like that. A good conversation makes an ordinary day better. What’s your ideal weekend?`, `Thanks for sharing! I’m always looking for a new recommendation. What would you pick?`];
    const count = state.messages.filter(message => message.profileId === target.id && message.sender === `self`).length;
    state = {
      ...state,
      contactHistory: [...new Set([...state.contactHistory, target.id])],
      matches: matched ? [...new Set([...state.matches, target.id])] : state.matches,
      user: firstMessage ? { ...state.user, likedIds: [...new Set([...state.user.likedIds, target.id])] } : state.user,
      dailyActions: firstMessage ? { ...state.dailyActions, firstMessage: state.dailyActions.firstMessage + 1 } : state.dailyActions,
      introductions: firstMessage ? [...state.introductions, { profileId: target.id, operationId, at: now.toISOString() }] : state.introductions,
      messages: [...state.messages, { id: operationId, profileId: target.id, sender: `self`, text, at: now.toISOString() }, ...(matched ? [{ id: `${operationId}_reply`, profileId: target.id, sender: `profile` as const, text: responses[count % responses.length], at: now.toISOString() }] : [])],
    };
    return done(firstMessage ? matched ? `It’s A Match With ${target.name}` : `First Message Sent — Wait For A Match` : undefined, firstMessage && matched ? { matchId: target.id } : {});
  }
  if (action.type === `ask-mxo`) {
    const text = action.text.trim();
    if (!text || text.length > 1000) return fail(`Ask MXO In Up To 1,000 Characters`);
    if (!charge(ECONOMY.costs.mxo, `MXO Request`)) return fail(`Not Enough XOs — Visit Your Wallet`);
    const response = recommendLocally(state, text);
    state = { ...state, mxoMessages: [...state.mxoMessages, { id: operationId, role: `user`, text, at: now.toISOString() }, { id: `${operationId}_reply`, role: `assistant`, ...response, at: now.toISOString() }] };
    return done();
  }
  if (action.type === `block` || action.type === `unblock`) {
    if (!target) return fail(`Profile Not Found`);
    const blocked = action.type === `block`;
    state = blocked ? removeConnection(state, target.id) : state;
    const blocks = blocked ? [...new Set([...state.blocks, target.id])] : state.blocks.filter(id => id !== target.id);
    state = { ...state, blocks, user: { ...state.user, blockedIds: blocks }, mxoMessages: state.mxoMessages.map(message => ({ ...message, recommendations: message.recommendations?.filter(id => id !== target.id) })) };
    return done(blocked ? `Profile Blocked` : `Profile Unblocked`);
  }
  if (action.type === `unmatch`) {
    if (!target || !state.matches.includes(target.id)) return fail(`Match Not Found`);
    state = removeConnection(state, target.id);
    if (!state.swipes.some(swipe => swipe.profileId === target.id)) state = { ...state, swipes: [...state.swipes, { id: uniqueId(`Unmatch`), profileId: target.id, kind: `pass`, at: now.toISOString() }] };
    return done(`Match Removed`);
  }
  if (action.type === `report`) {
    if (!target || !canViewProfile(state, target)) return fail(`Profile Not Found`);
    const reason = action.reason.trim();
    if (!reason || reason.length > 1000) return fail(`Enter A Report Reason Up To 1,000 Characters`);
    state = { ...state, reports: [...state.reports, { id: uniqueId(`Report`), profileId: target.id, reason, status: `open`, at: now.toISOString() }] };
    return done(`Report Saved — Available In Manage MatchXD`);
  }
  if (action.type === `upgrade`) {
    if (!(action.plan in PLANS)) return fail(`Plan Not Found`);
    if (!hasTier(action.plan, state.wallet.plan)) return fail(`Cancel Your Current Plan To Return To Free At The End Of The Billing Period`);
    state = { ...state, wallet: upgradeWallet(state.wallet, action.plan, operationId, now) };
    return done(`${PLANS[action.plan].name} Plan Updated — No Charge`);
  }
  if (action.type === `cancel-plan`) {
    if (state.wallet.plan === `free`) return fail(`You’re On The Free Plan`);
    if (state.wallet.cancelAt) return done(`Cancellation Is Already Scheduled`);
    const activation = state.wallet.ledger.filter(entry => entry.label.endsWith(`Plan Activated`)).at(-1)?.at;
    const period = 30 * 24 * 60 * 60 * 1000;
    const started = activation ? Date.parse(activation) : now.getTime();
    const cancelAt = new Date(started + Math.max(1, Math.floor((now.getTime() - started) / period) + 1) * period).toISOString();
    state = { ...state, wallet: { ...state.wallet, cancelAt } };
    return done(`Plan Cancels At The End Of This Billing Period`);
  }
  if (action.type === `purchase`) {
    const pack = ECONOMY.packs.find(value => value.cents === action.cents);
    if (!pack) return fail(`Choose An Available XO Pack`);
    state = { ...state, wallet: { ...state.wallet, purchased: state.wallet.purchased + pack.xo, operations: [...state.wallet.operations, operationId], ledger: [...state.wallet.ledger, ledgerEntry(`XO Pack — No Charge`, pack.xo, `purchased`, now, operationId)] } };
    return done(`${pack.xo} XOs Added — No Charge`);
  }
  if (action.type === `ad-reward`) {
    if (state.wallet.adCount >= ECONOMY.ads.limit) return fail(`Daily Reward Limit Reached`);
    state = { ...state, wallet: { ...state.wallet, daily: state.wallet.daily + ECONOMY.ads.reward, adCount: state.wallet.adCount + 1, operations: [...state.wallet.operations, operationId], ledger: [...state.wallet.ledger, ledgerEntry(`XO Reward`, ECONOMY.ads.reward, `daily`, now, operationId)] } };
    return done(`${ECONOMY.ads.reward} Reward XOs Added`);
  }
  if (action.type === `admin-save-profile` || action.type === `admin-delete-profile` || action.type === `resolve-report`) {
    if (state.session.role !== `owner`) return fail(`Management Access Required`);
    if (action.type === `resolve-report`) {
      if (!state.reports.some(report => report.id === action.reportId)) return fail(`Report Not Found`);
      state = { ...state, reports: state.reports.map(report => report.id === action.reportId ? { ...report, status: `resolved` } : report) };
      return done(`Report Resolved`);
    }
    if (action.type === `admin-save-profile`) {
      if (!isProfile(action.profile)) return fail(`Check All Profile Details And Use An Adult Date Of Birth`);
      const existing = state.profiles.find(value => value.id === action.profile.id);
      if (action.profile.id === state.user.id || (existing && action.profile.number !== existing.number)) return fail(`Keep Profile IDs And Numbers Unique And Unchanged`);
      const profile = cleanProfile(existing ? action.profile : { ...action.profile, number: state.nextProfileNumber, id: profileId(state.nextProfileNumber, action.profile.name, now) });
      state = { ...state, nextProfileNumber: existing ? state.nextProfileNumber : state.nextProfileNumber + 1, profiles: existing ? state.profiles.map(value => value.id === profile.id ? profile : value) : [...state.profiles, profile] };
      return done(`Profile Saved`);
    }
    if (!target) return fail(`Profile Not Found`);
    state = removeConnection(state, target.id);
    state = { ...state, profiles: state.profiles.filter(profile => profile.id !== target.id).map(profile => ({ ...profile, likedIds: profile.likedIds.filter(id => id !== target.id), blockedIds: profile.blockedIds.filter(id => id !== target.id) })), blocks: state.blocks.filter(id => id !== target.id), swipes: state.swipes.filter(swipe => swipe.profileId !== target.id), reports: state.reports.filter(report => report.profileId !== target.id), user: { ...state.user, blockedIds: state.user.blockedIds.filter(id => id !== target.id) }, mxoMessages: state.mxoMessages.map(message => ({ ...message, recommendations: message.recommendations?.filter(id => id !== target.id) })) };
    return done(`Profile And Related Activity Deleted`);
  }
  return fail(`Unsupported Action`);
};
