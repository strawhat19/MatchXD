/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import { transition } from './transition';
import { isAppState } from './validation';
import { AppState, Action } from './types';
import { PLANS, PLAN_LIMITS } from '../config/plans';
import { recommendLocally } from '../services/local/mxo';
import { createProfile, initialState } from '../data/demoProfiles';
import { localDay, nextResetAt, refreshWallet, spend, walletTotal } from './wallet';
import { dailyUsage, introductionAvailability, remainingDailyAction } from './quotas';
import { migrateSnapshot, serializeSnapshot, serializableSnapshot } from '../storage/migrations';
import { ageOf, canViewProfile, discoveryProfiles, matchesPreferences, visibleProfiles } from './matching';

const now = new Date(`2026-09-10T16:00:00.000Z`);
const member = (): AppState => ({ ...initialState(now), onboardingComplete: true, session: { role: `member`, onboarded: true } });
const run = (state: AppState, action: Action, at = now) => transition(state, action, at);

test(`Landing theme changes work before sign-in without allowing privacy or member actions`, () => {
  const before = initialState(now);
  const changed = run(before, { type: `save-settings`, settings: { theme: `light` } });
  assert.equal(changed.result.ok, true);
  assert.equal(changed.state.settings.theme, `light`);
  assert.equal(changed.state.session, null);
  assert.deepEqual(changed.state.user, before.user);
  assert.deepEqual(changed.state.wallet, before.wallet);
  assert.equal(run(before, { type: `save-settings`, settings: { discoverable: false } }).result.ok, false);
  assert.equal(run(before, { type: `save-settings`, settings: { theme: `light`, incognito: true } }).result.ok, false);
  assert.equal(run(before, { type: `save-settings`, settings: {} }).result.ok, false);
  assert.equal(run(before, { type: `upgrade`, plan: `mxd` }).result.ok, false);
});
test(`DOB validation rejects impossible dates and underage onboarding`, () => {
  assert.ok(Number.isNaN(ageOf(`2000-02-30`, now)));
  assert.ok(Number.isNaN(ageOf(`not-a-date`, now)));
  assert.equal(ageOf(`2008-09-10`, now), 18);
  assert.equal(ageOf(`2008-09-11`, now), 17);
  assert.equal(ageOf(`2008-09-10`, new Date(`2026-09-10T03:59:59Z`)), 17);
  assert.equal(ageOf(`2008-09-10`, new Date(`2026-09-10T04:00:00Z`)), 18);
  assert.equal(run(member(), { type: `save-user`, profile: { dob: `2008-09-11` }, complete: true }).result.ok, false);
  assert.equal(run(initialState(now), { type: `swipe`, kind: `like`, profileId: initialState(now).profiles[0].id }).result.ok, false);
  const owner = run(initialState(now), { type: `start-session`, role: `owner` }).state;
  assert.equal(owner.session?.onboarded, false);
  assert.equal(run(owner, { type: `admin-delete-profile`, profileId: owner.profiles[0].id }).result.ok, false);
  assert.equal(run(owner, { type: `save-user`, profile: { dob: `2008-09-10` }, complete: true }).state.session?.onboarded, true);
});
test(`A right swipe costs one XO, matches reciprocally, and operation replay is inert`, () => {
  const before = member();
  const target = discoveryProfiles(before)[0];
  const action: Action = { type: `swipe`, kind: `like`, profileId: target.id, operationId: `one-like` };
  const first = run(before, action);
  assert.equal(first.result.matchId, target.id);
  assert.equal(first.state.wallet.daily, 32);
  assert.ok(first.state.matches.includes(target.id));
  assert.equal(first.state.swipes.length, 1);
  const replay = run(first.state, action);
  assert.deepEqual(replay.state, first.state);
  assert.equal(run(first.state, { ...action, operationId: `second-like` }).result.ok, false);
  assert.ok(isAppState(first.state));
});
test(`Wallet spends daily before purchased and fails without partial debits`, () => {
  let state = run(member(), { type: `purchase`, cents: 100, operationId: `pack` }).state;
  const wallet = spend(state.wallet, 36, `Test Spending`, `spend`, now)!;
  assert.equal(wallet.daily, 0);
  assert.equal(wallet.purchased, 7);
  assert.equal(spend(wallet, 8, `Too Much`, `fail`, now), null);
  assert.equal(wallet.operations.includes(`fail`), false);
  assert.equal(spend(wallet, 36, `Replay`, `spend`, now), wallet);
  state = { ...state, wallet };
  assert.ok(isAppState(state));
});
test(`Cancellation uses the existing billing period and repeated upgrades do not extend it`, () => {
  let state = run(member(), { type: `upgrade`, plan: `m` }).state;
  const later = new Date(`2026-09-20T16:00:00.000Z`);
  state = run(state, { type: `upgrade`, plan: `m` }, later).state;
  state = run(state, { type: `cancel-plan` }, later).state;
  assert.equal(state.wallet.cancelAt, `2026-10-10T16:00:00.000Z`);
});
test(`Midday plan upgrades grant only the higher entitlement and cancellation expires`, () => {
  let state = member();
  for (const [plan, balance] of [[`m`, 88], [`mx`, 154], [`mxd`, 253]] as const) {
    state = run(state, { type: `upgrade`, plan }).state;
    assert.equal(state.wallet.daily, balance);
  }
  assert.equal(run(state, { type: `upgrade`, plan: `m` }).result.ok, false);
  const repeated = run(state, { type: `upgrade`, plan: `mxd` }).state;
  assert.equal(repeated.wallet.daily, 253);
  state = run(repeated, { type: `save-settings`, settings: { incognito: true } }).state;
  state = run(state, { type: `cancel-plan` }).state;
  assert.equal(state.wallet.plan, `mxd`);
  const expiry = new Date(state.wallet.cancelAt!);
  state = run(state, { type: `refresh` }, expiry).state;
  assert.equal(state.wallet.plan, `free`);
  assert.equal(state.wallet.daily, PLANS.free.daily);
  assert.equal(state.settings.incognito, false);
  assert.equal(state.user.incognito, false);
  assert.ok(isAppState(state));
});
test(`Eastern midnight reset expires daily XOs, preserves packs, and skips missed grants`, () => {
  const state = run(member(), { type: `purchase`, cents: 500 }).state;
  const before = new Date(`2026-09-11T03:59:59.999Z`);
  const after = new Date(`2026-09-11T04:00:00.000Z`);
  assert.equal(localDay(before), `2026-09-10`);
  assert.equal(localDay(after), `2026-09-11`);
  assert.equal(nextResetAt(before).toISOString(), after.toISOString());
  assert.equal(nextResetAt(new Date(`2026-03-08T05:00:00Z`)).toISOString(), `2026-03-09T04:00:00.000Z`);
  assert.equal(nextResetAt(new Date(`2026-11-01T04:00:00Z`)).toISOString(), `2026-11-02T05:00:00.000Z`);
  const reset = refreshWallet(state.wallet, new Date(`2026-09-20T18:00:00Z`));
  assert.equal(reset.daily, 33);
  assert.equal(reset.purchased, 50);
  assert.equal(reset.ledger.filter(entry => entry.label === `Daily Free Grant`).length, 2);
  assert.equal(refreshWallet(reset, new Date(`2026-09-19T18:00:00Z`)), reset);
  assert.ok(isAppState({ ...state, wallet: reset }));
});
test(`Reward cap, allowed packs, and idempotent grants protect local accounting`, () => {
  let state = member();
  assert.equal(run(state, { type: `purchase`, cents: 101 }).result.ok, false);
  for (let index = 0; index < 3; index++) state = run(state, { type: `ad-reward`, operationId: `ad-${index}` }).state;
  assert.equal(state.wallet.daily, 48);
  assert.equal(run(state, { type: `ad-reward`, operationId: `fourth` }).result.ok, false);
  const replay = run(state, { type: `ad-reward`, operationId: `ad-0` });
  assert.equal(replay.result.ok, true);
  assert.equal(replay.state.wallet.daily, 48);
  state = run(state, { type: `purchase`, cents: 100, operationId: `one-pack` }).state;
  state = run(state, { type: `purchase`, cents: 100, operationId: `one-pack` }).state;
  assert.equal(state.wallet.purchased, 10);
});
test(`Rewind has its own cost and failed message attempts remain free`, () => {
  let state = member();
  const profile = discoveryProfiles(state)[0];
  assert.equal(run(state, { type: `send-message`, profileId: profile.id, text: ` ` }).state.wallet.daily, 33);
  state = run(state, { type: `swipe`, profileId: profile.id, kind: `pass` }).state;
  state = run(state, { type: `rewind` }).state;
  assert.equal(state.wallet.daily, 31);
  assert.equal(state.swipes.length, 0);
  state = run(state, { type: `swipe`, profileId: profile.id, kind: `like` }).state;
  assert.equal(run(state, { type: `rewind` }).result.ok, false);
  state = run(state, { type: `send-message`, profileId: profile.id, text: `Hello`, operationId: `hello` }).state;
  assert.equal(state.wallet.daily, 30);
  assert.equal(state.messages.filter(message => message.id === `hello_reply`).length, 1);
  assert.equal(run(state, { type: `send-message`, profileId: profile.id, text: `Hello`, operationId: `hello` }).state.messages.length, state.messages.length);
});
test(`Safety is free and reciprocal blocking removes discovery, conversations, and MXO results`, () => {
  let state = member();
  const profile = state.profiles[2];
  const before = walletTotal(state.wallet);
  state = run(state, { type: `report`, profileId: profile.id, reason: `Demo Report` }).state;
  state = run(state, { type: `block`, profileId: profile.id }).state;
  assert.equal(walletTotal(state.wallet), before);
  assert.equal(canViewProfile(state, profile), false);
  assert.equal(state.matches.includes(profile.id), false);
  assert.equal(state.messages.some(message => message.profileId === profile.id), false);
  assert.equal(recommendLocally(state, `photography`).recommendations.includes(profile.id), false);
  const reverseBlock = { ...state.profiles[0], blockedIds: [state.user.id] };
  assert.equal(canViewProfile(state, reverseBlock), false);
});
test(`Hidden/incognito profile access applies uniformly with blocks taking precedence`, () => {
  const state = member();
  const hidden = { ...state.profiles[0], discoverable: false };
  const incognito = { ...state.profiles[0], incognito: true, likedIds: [] };
  assert.equal(canViewProfile(state, hidden), false);
  assert.equal(canViewProfile(state, incognito), false);
  assert.equal(canViewProfile(state, { ...incognito, likedIds: [state.user.id] }), true);
  assert.equal(canViewProfile({ ...state, blocks: [incognito.id] }, { ...incognito, likedIds: [state.user.id] }), false);
  const privateState = { ...state, profiles: [hidden, incognito] };
  assert.equal(visibleProfiles(privateState).length, 0);
  assert.equal(recommendLocally(privateState, `coffee`).recommendations.length, 0);
  const observer = { ...state, user: state.profiles[0] };
  const privateUser = { ...state.user, incognito: true, likedIds: [] };
  assert.equal(canViewProfile(observer, privateUser), false);
  assert.equal(canViewProfile(observer, { ...privateUser, likedIds: [observer.user.id] }), true);
  assert.equal(canViewProfile(observer, { ...privateUser, likedIds: [observer.user.id], blockedIds: [observer.user.id] }), false);
});
test(`MXO applies stated criteria without leaking unavailable profiles or charging twice`, () => {
  let state = member();
  const response = recommendLocally(state, `women ages 25 to 30 within 5 miles`);
  assert.deepEqual(response.recommendations, [state.profiles[0].id, state.profiles[1].id]);
  assert.equal(response.text.includes(`Sofia`), false);
  assert.equal(recommendLocally(state, `not women`).recommendations.includes(state.profiles[0].id), false);
  assert.equal(recommendLocally(state, `not vegan`).recommendations.includes(state.profiles[3].id), false);
  assert.equal(recommendLocally(state, `hiking and not coffee`).recommendations[0], state.profiles[4].id);
  state = run(state, { type: `ask-mxo`, text: `hiking`, operationId: `mxo` }).state;
  assert.equal(state.wallet.daily, 32);
  assert.equal(state.mxoMessages.length, 3);
  assert.equal(run(state, { type: `ask-mxo`, text: `hiking`, operationId: `mxo` }).state.mxoMessages.length, 3);
});
test(`Preferences distinguish missing data and media presence and enforce tier gates`, () => {
  let state = member();
  const prefs = { ...state.preferences, attributes: { ...state.preferences.attributes, religion: [`Not Provided`] } };
  state = run(state, { type: `save-preferences`, preferences: prefs }).state;
  assert.equal(matchesPreferences(state, state.profiles[0]), false);
  assert.equal(matchesPreferences(state, state.profiles[5]), true);
  assert.equal(run(state, { type: `save-preferences`, preferences: { ...prefs, attributes: { ...prefs.attributes, ethnicity: [`Asian`] } } }).result.ok, false);
  assert.equal(recommendLocally(state, `Asian`).recommendations.length, 0);
  const mediaPrefs = { ...state.preferences, attributes: { ...state.preferences.attributes, religion: [], voice: [`Has Introduction`] } };
  state = run(state, { type: `save-preferences`, preferences: mediaPrefs }).state;
  assert.equal(matchesPreferences(state, state.profiles[0]), false);
  assert.equal(matchesPreferences(state, state.profiles[1]), true);
});
test(`Owner mutation guards and deletion clean all related local state`, () => {
  let state = member();
  const profileId = state.profiles[2].id;
  const profile = createProfile(8, { name: `Test Person` });
  assert.equal(run(state, { type: `admin-save-profile`, profile }).result.ok, false);
  assert.equal(run(state, { type: `admin-delete-profile`, profileId }).result.ok, false);
  state = run(state, { type: `report`, profileId, reason: `Check This` }).state;
  assert.equal(run(state, { type: `resolve-report`, reportId: state.reports[0].id }).result.ok, false);
  state = { ...state, session: { role: `owner`, onboarded: true } };
  state = run(state, { type: `admin-save-profile`, profile }).state;
  const created = state.profiles.find(value => value.name === `Test Person`)!;
  assert.equal(created.number, 8);
  assert.ok(created.id.startsWith(`User_8_`));
  assert.equal(run(state, { type: `admin-save-profile`, profile: { ...created, number: 9 } }).result.ok, false);
  state = run(state, { type: `admin-delete-profile`, profileId: created.id }).state;
  state = run(state, { type: `admin-save-profile`, profile }).state;
  assert.equal(state.profiles.find(value => value.name === `Test Person`)?.number, 9);
  assert.equal(state.nextProfileNumber, 10);
  state = run(state, { type: `admin-delete-profile`, profileId }).state;
  assert.equal(state.profiles.some(value => value.id === profileId), false);
  assert.equal(state.matches.includes(profileId), false);
  assert.equal(state.messages.some(message => message.profileId === profileId), false);
  assert.equal(state.reports.some(report => report.profileId === profileId), false);
  assert.ok(isAppState(state));
});
test(`Persistence round trips validated state, rejects corruption, and strips transient media`, () => {
  const state = member();
  assert.deepEqual(migrateSnapshot(serializeSnapshot(state)), state);
  assert.throws(() => migrateSnapshot(`{ broken json`));
  assert.throws(() => migrateSnapshot(JSON.stringify({ ...state, version: 99 })));
  assert.throws(() => migrateSnapshot(JSON.stringify({ ...state, wallet: { ...state.wallet, daily: -5 } })));
  assert.throws(() => migrateSnapshot(JSON.stringify({ ...state, wallet: { ...state.wallet, daily: 500 } })));
  assert.throws(() => migrateSnapshot(JSON.stringify({ ...state, profiles: [state.profiles[0], state.profiles[0]] })));
  assert.throws(() => migrateSnapshot(JSON.stringify({ ...state, nextProfileNumber: 3 })));
  const { nextProfileNumber, ...older } = state;
  assert.equal(migrateSnapshot(JSON.stringify(older)).nextProfileNumber, nextProfileNumber);
  const transient = { ...state, user: { ...state.user, photos: [`blob:preview`, `data:image/png;base64,ABC`], voiceUri: `blob:voice`, videoUri: `demo:video` } };
  const durable = serializableSnapshot(transient);
  assert.deepEqual(durable.user.photos, [`avatar:coral`]);
  assert.equal(durable.user.voiceUri, undefined);
  assert.equal(durable.user.videoUri, `demo:video`);
  assert.equal(transient.user.photos[0], `blob:preview`);
  assert.ok(isAppState(migrateSnapshot(serializeSnapshot(transient))));
});
test(`Saved copy migration updates app-owned text while preserving personal content and wallet state`, () => {
  let state = member();
  state = run(state, { type: `purchase`, cents: 100, operationId: `copy_purchase` }).state;
  state = run(state, { type: `ad-reward`, operationId: `copy_reward` }).state;
  const oldWelcome = `Hi, I’m MXO, your local demo connection guide. Tell me what matters to you — try “someone who likes hiking and coffee” or “ages 25 to 35 within 10 miles.” I use only what you share and the demo profiles.`;
  const oldReply = `The demo profiles below match Coffee, Hiking and your saved preferences. These suggestions use self-reported profile details, not a compatibility score. Availability may change with privacy settings.`;
  state.user.bio = `I make fictional demo profiles for work.`;
  state.user.links = [{ label: `Creative Inspiration (Demo)`, url: `https://www.metmuseum.org/` }];
  state.profiles[0].links[0].label = `Creative Inspiration (Demo)`;
  state.profiles[1].links = [{ label: `Favorite Place (Demo)`, url: `https://example.com/my-place` }];
  state.profiles[3].links[0].label = `My Music (Demo)`;
  state.messages.push({ id: `personal_message`, profileId: state.profiles[0].id, sender: `self`, text: oldWelcome, at: now.toISOString() });
  state.reports.push({ id: `personal_report`, profileId: state.profiles[0].id, reason: `Demo Report`, status: `open`, at: now.toISOString() });
  state.mxoMessages = [
    { id: `MXO_Welcome`, role: `assistant`, text: oldWelcome, at: now.toISOString() },
    { id: `copy_request`, role: `user`, text: oldReply, at: now.toISOString() },
    { id: `copy_request_reply`, role: `assistant`, text: oldReply, at: now.toISOString() },
    { id: `unpaired_reply`, role: `assistant`, text: oldReply, at: now.toISOString() },
  ];
  state.wallet.ledger = state.wallet.ledger.map(entry => entry.id === `copy_purchase` ? { ...entry, label: `Demo XO Pack — No Charge` } : entry.id === `copy_reward` ? { ...entry, label: `Demo Ad Reward` } : entry);
  const migrated = migrateSnapshot(JSON.stringify(state));
  assert.equal(migrated.profiles[0].links[0].label, `Creative Inspiration`);
  assert.equal(migrated.mxoMessages[0].text, initialState(now).mxoMessages[0].text);
  assert.equal(migrated.mxoMessages[2].text, oldReply.replace(`The demo profiles`, `The profiles`));
  assert.deepEqual(migrated.mxoMessages[1], state.mxoMessages[1]);
  assert.deepEqual(migrated.mxoMessages[3], state.mxoMessages[3]);
  assert.deepEqual(migrated.profiles.slice(1), state.profiles.slice(1));
  assert.deepEqual(migrated.profiles.map(profile => profile.id), state.profiles.map(profile => profile.id));
  assert.deepEqual(migrated.user, state.user);
  assert.deepEqual(migrated.messages, state.messages);
  assert.deepEqual(migrated.reports, state.reports);
  assert.equal(migrated.wallet.ledger.find(entry => entry.id === `copy_purchase`)?.label, `XO Pack — No Charge`);
  assert.equal(migrated.wallet.ledger.find(entry => entry.id === `copy_reward`)?.label, `XO Reward`);
  const { ledger: migratedLedger, ...migratedWallet } = migrated.wallet;
  const { ledger: originalLedger, ...originalWallet } = state.wallet;
  assert.deepEqual(migratedWallet, originalWallet);
  assert.deepEqual(migratedLedger.map(entry => ({ ...entry, label: `` })), originalLedger.map(entry => ({ ...entry, label: `` })));
  assert.deepEqual(migrateSnapshot(JSON.stringify(migrated)), migrated);
  assert.ok(isAppState(migrated));
});

test(`Matched chat is free with an empty wallet and operation retries never duplicate messages`, () => {
  let state = member();
  const profileId = state.matches[0];
  state = { ...state, wallet: spend(state.wallet, 33, `Spent Elsewhere`, `empty-wallet`, now)! };
  const before = state.wallet;
  const action: Action = { type: `send-message`, profileId, text: `Hello again`, operationId: `free-message` };
  const sent = run(state, action);
  assert.equal(sent.result.ok, true);
  assert.equal(walletTotal(sent.state.wallet), 0);
  assert.deepEqual(sent.state.wallet.ledger, before.ledger);
  assert.equal(sent.state.messages.filter(message => message.id === `free-message_reply`).length, 1);
  assert.deepEqual(dailyUsage(sent.state, now), { rewind: 0, super: 0, firstMessage: 0 });
  assert.deepEqual(sent.state.introductions, []);
  assert.deepEqual(run(sent.state, action).state, sent.state);
  assert.equal(run(sent.state, { ...action, operationId: `another-free-message` }).result.ok, true);
  assert.ok(isAppState(sent.state));
});

test(`An unmatched introduction costs one XO, waits without a reply, and becomes free after a mutual match`, () => {
  let state = member();
  const target = state.profiles[4];
  const action: Action = { type: `send-message`, profileId: target.id, text: `  Let’s talk about hiking  `, operationId: `pending-intro` };
  assert.equal(introductionAvailability(state, target.id, now).available, true);
  state = run(state, action).state;
  assert.equal(state.wallet.daily, 32);
  assert.equal(state.matches.includes(target.id), false);
  assert.equal(state.user.likedIds.includes(target.id), true);
  assert.deepEqual(state.messages.filter(message => message.profileId === target.id).map(message => [message.sender, message.text]), [[`self`, `Let’s talk about hiking`]]);
  assert.deepEqual(state.introductions, [{ profileId: target.id, operationId: `pending-intro`, at: now.toISOString() }]);
  assert.equal(dailyUsage(state, now).firstMessage, 1);
  assert.deepEqual(run(state, action).state, state);
  assert.equal(run(state, { ...action, operationId: `second-intro` }).result.ok, false);
  state = { ...state, session: { role: `owner`, onboarded: true } };
  state = run(state, { type: `admin-save-profile`, profile: { ...target, likedIds: [state.user.id] } }).state;
  const matched = run(state, { type: `swipe`, profileId: target.id, kind: `like`, operationId: `mutual-like` });
  assert.equal(matched.result.matchId, target.id);
  const wallet = matched.state.wallet;
  state = run(matched.state, { ...action, operationId: `matched-followup` }).state;
  assert.equal(state.wallet.daily, wallet.daily);
  assert.deepEqual(state.wallet.ledger, wallet.ledger);
  assert.equal(state.introductions.length, 1);
  assert.equal(state.messages.some(message => message.id === `matched-followup_reply`), true);
  assert.ok(isAppState(state));
});

test(`An introduction with existing reciprocal interest creates a match and charges only the introduction`, () => {
  const before = member();
  const target = before.profiles[0];
  const first = run(before, { type: `send-message`, profileId: target.id, text: `Coffee sometime?`, operationId: `reciprocal-intro` });
  assert.equal(first.result.matchId, target.id);
  assert.equal(first.state.wallet.daily, 32);
  assert.equal(first.state.messages.filter(message => message.profileId === target.id).length, 2);
  assert.equal(first.state.dailyActions.firstMessage, 1);
  const second = run(first.state, { type: `send-message`, profileId: target.id, text: `I know a place`, operationId: `free-followup` });
  assert.equal(second.result.ok, true);
  assert.equal(second.state.wallet.daily, 32);
  assert.equal(second.state.dailyActions.firstMessage, 1);
  assert.equal(second.state.introductions.length, 1);
  assert.ok(isAppState(second.state));
});

test(`Rewinding an earlier pass preserves the independently expressed interest of a pending introduction`, () => {
  let state = member();
  const profileId = state.profiles[4].id;
  state = run(state, { type: `swipe`, profileId, kind: `pass` }).state;
  state = run(state, { type: `send-message`, profileId, text: `I changed my mind`, operationId: `intro-after-pass` }).state;
  const introductions = state.introductions;
  const messages = state.messages;
  state = run(state, { type: `rewind` }).state;
  assert.equal(state.swipes.length, 0);
  assert.equal(state.user.likedIds.includes(profileId), true);
  assert.equal(state.wallet.daily, 30);
  assert.deepEqual(state.messages, messages);
  assert.deepEqual(state.introductions, introductions);
  assert.deepEqual(dailyUsage(state, now), { rewind: 1, super: 0, firstMessage: 1 });
  assert.ok(isAppState(state));
});

test(`Separate daily caps survive rewinds, packs, removals and plan changes without refunds`, () => {
  let state = member();
  const target = state.profiles[4];
  const pending = state.profiles[5];
  state = run(state, { type: `swipe`, profileId: target.id, kind: `super`, operationId: `capped-super` }).state;
  state = run(state, { type: `rewind`, operationId: `capped-rewind` }).state;
  state = run(state, { type: `send-message`, profileId: pending.id, text: `Hello`, operationId: `capped-intro` }).state;
  assert.deepEqual(dailyUsage(state, now), { rewind: 1, super: 1, firstMessage: 1 });
  assert.equal(state.wallet.daily, 30);
  assert.equal(run(state, { type: `swipe`, profileId: target.id, kind: `super`, operationId: `over-super` }).result.ok, false);
  assert.equal(run(state, { type: `send-message`, profileId: target.id, text: `Hello`, operationId: `over-intro` }).result.ok, false);
  state = run(state, { type: `swipe`, profileId: target.id, kind: `pass` }).state;
  assert.deepEqual(run(state, { type: `rewind`, operationId: `over-rewind` }).state, state);
  state = run(state, { type: `purchase`, cents: 1000 }).state;
  assert.equal(remainingDailyAction(state, `super`, now), 0);
  state = run(state, { type: `upgrade`, plan: `m` }).state;
  for (const action of [`rewind`, `super`, `firstMessage`] as const) assert.equal(remainingDailyAction(state, action, now), PLAN_LIMITS.m[action] - 1);
  state = run(state, { type: `upgrade`, plan: `m` }).state;
  assert.deepEqual(dailyUsage(state, now), { rewind: 1, super: 1, firstMessage: 1 });
  state = run(state, { type: `block`, profileId: pending.id }).state;
  state = run(state, { type: `unblock`, profileId: pending.id }).state;
  assert.equal(introductionAvailability(state, pending.id, now).available, false);
  state = { ...state, session: { role: `owner`, onboarded: true } };
  state = run(state, { type: `admin-delete-profile`, profileId: pending.id }).state;
  assert.equal(state.introductions.some(introduction => introduction.profileId === pending.id), true);
  assert.equal(state.contactHistory.includes(pending.id), true);
  assert.deepEqual(dailyUsage(state, now), { rewind: 1, super: 1, firstMessage: 1 });
  const expiry = new Date(now.getTime() + 1000);
  state = { ...state, wallet: { ...state.wallet, cancelAt: expiry.toISOString() } };
  state = run(state, { type: `refresh` }, expiry).state;
  assert.equal(state.wallet.plan, `free`);
  assert.equal(remainingDailyAction(state, `super`, expiry), 0);
  assert.ok(isAppState(state));
});

test(`Eastern midnight resets quotas while introduction history and old operation retries remain durable`, () => {
  let state = member();
  const target = state.profiles[4];
  const action: Action = { type: `send-message`, profileId: target.id, text: `Hello`, operationId: `midnight-intro` };
  state = run(state, action).state;
  const beforeMidnight = new Date(`2026-09-11T03:59:59.999Z`);
  const midnight = new Date(`2026-09-11T04:00:00.000Z`);
  assert.equal(remainingDailyAction(state, `firstMessage`, beforeMidnight), 0);
  assert.equal(remainingDailyAction(state, `firstMessage`, midnight), PLAN_LIMITS.free.firstMessage);
  state = run(state, { type: `refresh` }, midnight).state;
  assert.deepEqual(dailyUsage(state, midnight), { rewind: 0, super: 0, firstMessage: 0 });
  assert.equal(state.dailyActions.date, `2026-09-11`);
  assert.equal(introductionAvailability(state, target.id, midnight).available, false);
  assert.deepEqual(run(state, action, midnight).state, state);
  state = run(state, { type: `send-message`, profileId: state.profiles[5].id, text: `Good morning`, operationId: `next-day-intro` }, midnight).state;
  assert.equal(state.dailyActions.firstMessage, 1);
  assert.equal(run(state, { type: `refresh` }, beforeMidnight).state.dailyActions.firstMessage, 1);
  assert.ok(isAppState(state));
});

test(`Rejected introductions and capped actions never consume funds, quotas or retry IDs`, () => {
  let state = member();
  const target = state.profiles[4];
  state = run(state, { type: `swipe`, profileId: target.id, kind: `pass` }).state;
  state = { ...state, wallet: spend(state.wallet, 32, `Spent Elsewhere`, `drain-wallet`, now)! };
  for (const action of [
    { type: `rewind`, operationId: `failed-rewind` },
    { type: `send-message`, profileId: target.id, text: `Hello`, operationId: `failed-intro` },
    { type: `swipe`, profileId: state.profiles[5].id, kind: `super`, operationId: `failed-super` },
  ] satisfies Action[]) {
    const result = run(state, action);
    assert.equal(result.result.ok, false);
    assert.deepEqual(result.state, state);
    assert.equal(result.state.wallet.operations.includes(action.operationId), false);
  }
  state = run(state, { type: `purchase`, cents: 100 }).state;
  assert.equal(run(state, { type: `send-message`, profileId: target.id, text: `Hello`, operationId: `failed-intro` }).result.ok, true);
  const invalidText = run(state, { type: `send-message`, profileId: target.id, text: ` `, operationId: `invalid-text` });
  assert.equal(invalidText.result.ok, false);
  assert.deepEqual(invalidText.state, state);
  const blocked = run(state, { type: `block`, profileId: target.id }).state;
  assert.equal(run(blocked, { type: `send-message`, profileId: target.id, text: `Hello` }).result.ok, false);
  const hidden = { ...state, profiles: state.profiles.map(profile => profile.id === target.id ? { ...profile, incognito: true, likedIds: [] } : profile) };
  assert.equal(introductionAvailability(hidden, target.id, now).available, false);
  assert.equal(run({ ...state, session: { role: `owner`, onboarded: false } }, { type: `send-message`, profileId: target.id, text: `Hello` }).result.ok, false);
});

test(`Ending a prior matched conversation prevents paid recontact but a new match restores free chat`, () => {
  let state = member();
  const profileId = state.matches[0];
  state = run(state, { type: `unmatch`, profileId }).state;
  assert.equal(state.introductions.length, 0);
  assert.equal(introductionAvailability(state, profileId, now).available, false);
  assert.equal(run(state, { type: `send-message`, profileId, text: `Reopening` }).result.ok, false);
  state = run(state, { type: `rewind` }).state;
  state = run(state, { type: `swipe`, profileId, kind: `like` }).state;
  assert.equal(state.matches.includes(profileId), true);
  const before = state.wallet;
  state = run(state, { type: `send-message`, profileId, text: `A new conversation` }).state;
  assert.equal(state.wallet.daily, before.daily);
  assert.deepEqual(state.wallet.ledger, before.ledger);
  state = run(state, { type: `block`, profileId }).state;
  state = run(state, { type: `unblock`, profileId }).state;
  assert.equal(introductionAvailability(state, profileId, now).available, false);
  assert.equal(state.introductions.length, 0);
  assert.ok(isAppState(state));
});

test(`Legacy snapshots and live states restore usage from ledger without treating seeded messages as introductions`, () => {
  let state = member();
  state = run(state, { type: `purchase`, cents: 100, operationId: `legacy-pack` }).state;
  state = { ...state, wallet: spend(state.wallet, 32, `Other Spending`, `legacy-other`, now)! };
  state = { ...state, wallet: spend(state.wallet, 2, `Super Like`, `legacy-super`, now)! };
  state = { ...state, wallet: spend(state.wallet, 1, `Rewind`, `legacy-rewind`, now)! };
  state.blocks = [state.profiles[5].id];
  state.user.blockedIds = state.blocks;
  const { dailyActions, introductions, contactHistory, ...legacy } = state;
  assert.deepEqual(dailyActions, { date: `2026-09-10`, rewind: 0, super: 0, firstMessage: 0 });
  assert.deepEqual(introductions, []);
  assert.deepEqual(contactHistory, state.matches);
  const migrated = migrateSnapshot(JSON.stringify(legacy));
  assert.deepEqual(migrated.dailyActions, { date: `2026-09-10`, rewind: 1, super: 1, firstMessage: 0 });
  assert.deepEqual(migrated.introductions, []);
  assert.equal(migrated.contactHistory.includes(state.profiles[5].id), true);
  assert.deepEqual(migrated.wallet, state.wallet);
  assert.deepEqual(migrated.messages, state.messages);
  assert.deepEqual(migrateSnapshot(serializeSnapshot(migrated)), migrated);
  assert.equal(remainingDailyAction(legacy as AppState, `super`, now), 0);
  const live = run(legacy as AppState, { type: `refresh` }).state;
  assert.deepEqual(live, migrated);
  assert.ok(isAppState(live));
});

test(`Persistence rejects malformed new quota and introduction fields instead of replacing them`, () => {
  const state = member();
  for (const changes of [
    { dailyActions: null },
    { dailyActions: { rewind: 0 } },
    { dailyActions: { ...state.dailyActions, super: -1 } },
    { dailyActions: { ...state.dailyActions, date: `2026-02-30` } },
    { introductions: null },
    { contactHistory: [``] },
    { contactHistory: [state.user.id] },
    { introductions: [{ profileId: state.profiles[0].id, operationId: `unrecorded`, at: now.toISOString() }] },
  ]) assert.throws(() => migrateSnapshot(JSON.stringify({ ...state, ...changes })));
  const sent = run(state, { type: `send-message`, profileId: state.profiles[4].id, text: `Hello`, operationId: `durable-intro` }).state;
  assert.deepEqual(migrateSnapshot(serializeSnapshot(sent)), sent);
  assert.throws(() => migrateSnapshot(JSON.stringify({ ...sent, introductions: [...sent.introductions, ...sent.introductions] })));
});
