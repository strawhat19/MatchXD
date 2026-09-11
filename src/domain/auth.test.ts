import test from 'node:test';
import assert from 'node:assert/strict';
import { transition } from './transition';
import { isAppState } from './validation';
import { initialState } from '../data/demoProfiles';
import { migrateSnapshot, serializeSnapshot } from '../storage/migrations';

const now = new Date(`2026-09-11T16:00:00.000Z`);
const begin = () => transition(initialState(now), { type: `start-session`, role: `member` }, now).state;

test(`Leaving sign-up or signing out without a completed session stays silent`, () => {
  const fresh = initialState(now);
  const draft = begin();
  for (const state of [fresh, draft]) {
    for (const type of [`sign-out`, `cancel-onboarding`] as const) {
      const result = transition(state, { type }, now);
      assert.deepEqual(result.result, { ok: true });
      assert.equal(result.state.session, null);
      assert.equal(result.state.onboardingComplete, false);
      assert.deepEqual(result.state.user, state.user);
      assert.deepEqual(result.state.wallet, state.wallet);
    }
  }
});

test(`Canceling onboarding cannot terminate a completed session`, () => {
  const completed = transition(begin(), { type: `save-user`, profile: { name: `Taylor`, dob: `1998-06-21` }, complete: true }, now).state;
  const canceled = transition(completed, { type: `cancel-onboarding` }, now);
  assert.deepEqual(canceled.state, completed);
  assert.deepEqual(canceled.result, { ok: true });
  const signedOut = transition(completed, { type: `sign-out` }, now);
  assert.equal(signedOut.result.message, `Signed Out`);
  assert.equal(signedOut.state.session, null);
  assert.equal(signedOut.state.onboardingComplete, true);
  assert.deepEqual(transition(signedOut.state, { type: `sign-out` }, now).result, { ok: true });
});

test(`Completed local profiles survive sign-out and reload without repeating onboarding`, () => {
  const completed = transition(begin(), { type: `save-user`, profile: { name: `Taylor`, city: `Brooklyn`, dob: `1998-06-21` }, complete: true }, now).state;
  const signedOut = transition(completed, { type: `sign-out` }, now).state;
  const restored = migrateSnapshot(serializeSnapshot(signedOut));
  const returning = transition(restored, { type: `start-session`, role: `member` }, now);
  assert.equal(returning.state.onboardingComplete, true);
  assert.deepEqual(returning.state.session, { role: `member`, onboarded: true });
  assert.deepEqual(returning.state.user, completed.user);
  assert.deepEqual(returning.result, { ok: true });
  assert.ok(isAppState(returning.state));
});

test(`Rejected or unfinished profiles do not qualify as completed onboarding`, () => {
  const draft = begin();
  const rejected = transition(draft, { type: `save-user`, profile: { dob: `2010-06-21` }, complete: true }, now);
  assert.equal(rejected.result.ok, false);
  assert.equal(rejected.state.onboardingComplete, false);
  assert.equal(rejected.state.session?.onboarded, false);
  const saved = transition(draft, { type: `save-user`, profile: { name: `Taylor` } }, now).state;
  const canceled = transition(saved, { type: `cancel-onboarding` }, now).state;
  const reopened = transition(migrateSnapshot(serializeSnapshot(canceled)), { type: `start-session`, role: `member` }, now).state;
  assert.equal(reopened.onboardingComplete, false);
  assert.equal(reopened.session?.onboarded, false);
});

test(`Legacy snapshots infer completion only from an existing completed local session`, () => {
  const legacy = initialState(now);
  delete legacy.onboardingComplete;
  assert.equal(migrateSnapshot(JSON.stringify(legacy)).onboardingComplete, false);
  legacy.session = { role: `member`, onboarded: false };
  assert.equal(migrateSnapshot(JSON.stringify(legacy)).onboardingComplete, false);
  legacy.session.onboarded = true;
  assert.equal(migrateSnapshot(JSON.stringify(legacy)).onboardingComplete, true);
  assert.equal(isAppState({ ...legacy, onboardingComplete: `true` }), false);
  assert.throws(() => migrateSnapshot(JSON.stringify({ ...legacy, onboardingComplete: `true` })));
});

test(`Resetting or deleting the local account removes completed onboarding`, () => {
  const completed = transition(begin(), { type: `save-user`, profile: { name: `Taylor`, dob: `1998-06-21` }, complete: true }, now).state;
  for (const type of [`reset`, `delete-account`] as const) {
    const cleared = transition(completed, { type }, now).state;
    assert.equal(cleared.session, null);
    assert.equal(cleared.onboardingComplete, false);
  }
});
