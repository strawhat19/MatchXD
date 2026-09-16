import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../data/demoProfiles';
import { migrateSnapshot, serializeSnapshot } from '../storage/migrations';
import { defaultProfileAvatar } from './avatars';
import { activeSignupInterest, normalizeSignupContact, signupContactError, signupInterestError } from './interest';
import { transition } from './transition';
import { Action, AppState, SignupInterestInput } from './types';
import { isAppState } from './validation';

const now = new Date(`2026-09-16T16:00:00.000Z`);
const later = new Date(`2026-09-16T17:00:00.000Z`);
const profile = { name: `Taylor`, dob: `1998-06-21`, city: `Brooklyn`, photos: [defaultProfileAvatar] };
const signup = (state = initialState(now), interest: SignupInterestInput = { contact: `taylor@example.com`, plan: `beta` }, at = now) => transition(state, { type: `complete-signup`, profile, interest }, at);

test(`Beta and founding interest both start a free member preview without billing`, () => {
  for (const plan of [`beta`, `founding`] as const) {
    const completed = signup(initialState(now), { contact: ` Taylor@Example.com `, plan, feedback: ` More shared interests, please. ` });
    assert.equal(completed.result.ok, true);
    assert.deepEqual(completed.state.session, { role: `member`, onboarded: true });
    assert.equal(completed.state.onboardingComplete, true);
    assert.equal(completed.state.wallet.plan, `free`);
    assert.equal(completed.state.wallet.purchased, 0);
    assert.equal(completed.state.wallet.cancelAt, null);
    assert.deepEqual(completed.state.wallet.operations, []);
    assert.deepEqual(completed.state.wallet.ledger.map(entry => entry.label), [`Daily Free Grant`]);
    const interest = activeSignupInterest(completed.state)!;
    assert.equal(interest.plan, plan);
    assert.deepEqual(interest.contact, { kind: `email`, value: `taylor@example.com` });
    assert.equal(interest.feedback, `More shared interests, please.`);
    assert.equal(interest.profileId, completed.state.user.id);
    assert.equal(interest.createdAt, now.toISOString());
    assert.equal(interest.updatedAt, now.toISOString());
    assert.ok(isAppState(completed.state));
    const publicProfiles = JSON.stringify([completed.state.user, ...completed.state.profiles]);
    assert.ok(!publicProfiles.includes(`taylor@example.com`));
    assert.ok(!publicProfiles.includes(`More shared interests`));
    assert.deepEqual(completed.state.matches, []);
    assert.deepEqual(completed.state.messages, []);
  }
});

test(`Completing the explicitly opened owner preview preserves management access without taking a role from signup input`, () => {
  const ownerPreview = transition(initialState(now), { type: `start-session`, role: `owner` }, now).state;
  const owner = signup(ownerPreview).state;
  assert.deepEqual(owner.session, { role: `owner`, onboarded: true });
  assert.equal(owner.wallet.plan, `free`);
  const managed = transition(owner, { type: `admin-save-profile`, profile: { ...owner.profiles[0], bio: `Updated in the owner preview.` } }, now);
  assert.equal(managed.result.ok, true);
  assert.equal(managed.state.profiles[0].bio, `Updated in the owner preview.`);
  assert.ok(isAppState(migrateSnapshot(serializeSnapshot(managed.state))));

  const injectedAction = { type: `complete-signup`, role: `owner`, profile: { ...profile, role: `owner` }, interest: { contact: `member@example.com`, plan: `beta`, role: `owner` } } as unknown as Action;
  for (const state of [initialState(now), transition(initialState(now), { type: `start-session`, role: `member` }, now).state, transition(ownerPreview, { type: `sign-out` }, now).state]) {
    const member = transition(state, injectedAction, now).state;
    assert.deepEqual(member.session, { role: `member`, onboarded: true });
    assert.equal(transition(member, { type: `admin-delete-profile`, profileId: member.profiles[0].id }, now).result.ok, false);
  }
});

test(`Signup validation rejects invalid contact, plan, adult profile, and oversized feedback atomically`, () => {
  const state = initialState(now);
  const valid: Action = { type: `complete-signup`, profile, interest: { contact: `taylor@example.com`, plan: `beta` } };
  const invalid: unknown[] = [
    { ...valid, interest: { contact: ``, plan: `beta` } },
    { ...valid, interest: { contact: `not-an-email`, plan: `beta` } },
    { ...valid, interest: { contact: `taylor@example.com`, plan: `mxd` } },
    { ...valid, interest: { contact: `taylor@example.com`, plan: `founding`, feedback: `x`.repeat(1001) } },
    { ...valid, interest: { contact: `taylor@example.com`, plan: `founding`, feedback: 123 } },
    { ...valid, interest: null },
    { ...valid, profile: { ...profile, dob: `2012-06-21` } },
    { ...valid, profile: { ...profile, name: `` } },
    { ...valid, profile: { ...profile, city: `` } },
    { ...valid, profile: { ...profile, photos: [] } },
    { ...valid, profile: null },
  ];
  for (const action of invalid) {
    const result = transition(state, action as Action, now);
    assert.equal(result.result.ok, false);
    assert.deepEqual(result.state, state);
  }
  assert.equal(signup(state, { contact: `taylor@example.com`, plan: `beta`, feedback: `x`.repeat(1000) }).result.ok, true);
});

test(`Contact formats normalize locally and equivalent contact updates preserve record and profile identities`, () => {
  assert.deepEqual(normalizeSignupContact(` +1 (212) 555-0123 `), { kind: `phone`, value: `12125550123` });
  for (const contact of [`a@`, `a@example`, `a@.example.com`, `a b@example.com`, `1234`, `++12125550123`, `1234567890123456`, `555-call-me`]) assert.ok(signupContactError(contact));
  assert.equal(signupInterestError({ contact: `phone@example.com`, plan: `beta` }), null);
  const created = signup(initialState(now), { contact: `+1 (212) 555-0123`, plan: `beta` }).state;
  const first = transition(created, { type: `swipe`, profileId: created.profiles[0].id, kind: `like`, operationId: `first-local-like` }, now).state;
  const updated = signup(first, { contact: `1-212-555-0123`, plan: `founding`, feedback: `Please add voice intros.` }, later).state;
  assert.equal(updated.signupInterests.length, 1);
  assert.equal(updated.signupInterests[0].id, first.signupInterests[0].id);
  assert.equal(updated.user.id, first.user.id);
  assert.equal(updated.user.number, first.user.number);
  assert.equal(updated.nextProfileNumber, first.nextProfileNumber);
  assert.equal(updated.signupInterests[0].createdAt, now.toISOString());
  assert.equal(updated.signupInterests[0].updatedAt, later.toISOString());
  assert.equal(updated.signupInterests[0].plan, `founding`);
  assert.deepEqual(updated.wallet, first.wallet);
  assert.deepEqual(updated.swipes, first.swipes);
});

test(`Multiple local signups remain distinct and returning contacts reuse their saved profile`, () => {
  const first = signup().state;
  const firstInterest = first.signupInterests[0];
  const signedOut = transition(first, { type: `sign-out` }, now).state;
  const second = transition(signedOut, { type: `complete-signup`, profile: { ...profile, name: `Jordan` }, interest: { contact: `jordan@example.com`, plan: `founding` } }, later).state;
  assert.equal(second.signupInterests.length, 2);
  assert.notEqual(second.user.id, first.user.id);
  assert.notEqual(second.user.number, first.user.number);
  assert.equal(second.nextProfileNumber, first.nextProfileNumber + 1);
  assert.ok(second.profiles.some(value => value.id === first.user.id));
  assert.ok(isAppState(second));
  const returned = signup(second, { contact: `TAYLOR@example.com`, plan: `founding` }, later).state;
  assert.equal(returned.user.id, first.user.id);
  assert.equal(returned.activeSignupInterestId, firstInterest.id);
  assert.equal(returned.signupInterests.length, 2);
  assert.equal(returned.nextProfileNumber, second.nextProfileNumber);
  assert.ok(returned.profiles.some(value => value.id === second.user.id));
  assert.ok(!returned.profiles.some(value => value.id === returned.user.id));
  assert.ok(isAppState(returned));
});

test(`Two locally signed-up profiles can like each other and match after switching and reloading`, () => {
  const taylor = signup().state;
  const jordan = transition(taylor, { type: `complete-signup`, profile: { ...profile, name: `Jordan` }, interest: { contact: `jordan@example.com`, plan: `founding` } }, now).state;
  const switched = signup(migrateSnapshot(serializeSnapshot(jordan))).state;
  assert.equal(switched.user.id, taylor.user.id);
  const liked = transition(switched, { type: `swipe`, profileId: jordan.user.id, kind: `like`, operationId: `taylor-likes-jordan` }, now);
  assert.equal(liked.result.ok, true);
  assert.equal(liked.result.matchId, undefined);
  assert.ok(liked.state.user.likedIds.includes(jordan.user.id));
  const reloaded = migrateSnapshot(serializeSnapshot(transition(liked.state, { type: `sign-out` }, now).state));
  const jordanReturns = transition(reloaded, { type: `complete-signup`, profile: { ...profile, name: `Jordan` }, interest: { contact: `jordan@example.com`, plan: `founding` } }, now).state;
  const matched = transition(jordanReturns, { type: `swipe`, profileId: taylor.user.id, kind: `like`, operationId: `jordan-likes-taylor` }, now);
  assert.equal(matched.result.ok, true);
  assert.equal(matched.result.matchId, taylor.user.id);
  assert.deepEqual(matched.state.matches, [taylor.user.id]);
  assert.equal(matched.state.wallet.plan, `free`);
  assert.equal(matched.state.signupInterests.length, 2);
  assert.ok(isAppState(migrateSnapshot(serializeSnapshot(matched.state))));
});

test(`Signup details and local session survive serialization, sign-out, and reopening`, () => {
  const completed = signup(initialState(now), { contact: `taylor@example.com`, plan: `founding`, feedback: `Keep messaging simple.` }).state;
  const signedOut = transition(completed, { type: `sign-out` }, now).state;
  const restored = migrateSnapshot(serializeSnapshot(signedOut));
  assert.deepEqual(restored.signupInterests, completed.signupInterests);
  assert.equal(restored.activeSignupInterestId, completed.activeSignupInterestId);
  assert.equal(restored.session, null);
  const returned = transition(restored, { type: `start-session`, role: `member` }, later).state;
  assert.deepEqual(returned.user, completed.user);
  assert.deepEqual(returned.session, { role: `member`, onboarded: true });
  assert.equal(returned.wallet.plan, `free`);
  assert.equal(activeSignupInterest(returned)?.feedback, `Keep messaging simple.`);
  assert.ok(isAppState(returned));
});

test(`Legacy snapshots gain empty interest fields while malformed new signup data is rejected`, () => {
  const legacy = initialState(now) as Partial<AppState>;
  delete legacy.signupInterests;
  delete legacy.activeSignupInterestId;
  const restored = migrateSnapshot(JSON.stringify(legacy));
  assert.deepEqual(restored.signupInterests, []);
  assert.equal(restored.activeSignupInterestId, null);
  const completed = signup().state;
  const record = completed.signupInterests[0];
  for (const changes of [
    { signupInterests: null },
    { activeSignupInterestId: `missing` },
    { signupInterests: [{ ...record, plan: `mxd` }] },
    { signupInterests: [{ ...record, contact: { kind: `email`, value: `broken` } }] },
    { signupInterests: [{ ...record, profileId: `missing` }] },
    { signupInterests: [{ ...record, updatedAt: `not a date` }] },
    { signupInterests: [record, { ...record, id: `duplicate` }] },
  ]) assert.throws(() => migrateSnapshot(JSON.stringify({ ...completed, ...changes })));
});

test(`Signup cannot copy private contact, feedback, identity, or an elevated entitlement into the public profile`, () => {
  const existing = signup().state;
  const upgraded = transition(existing, { type: `upgrade`, plan: `mxd` }, now).state;
  const attemptedProfile = { ...profile, id: `forged`, number: 999, contact: `private@example.com`, feedback: `Private feedback`, incognito: true, likedIds: [`forged`] };
  const completed = transition(upgraded, { type: `complete-signup`, profile: attemptedProfile, interest: { contact: `taylor@example.com`, plan: `founding` } }, now).state;
  assert.equal(completed.user.id, existing.user.id);
  assert.equal(completed.user.number, existing.user.number);
  assert.equal(`contact` in completed.user, false);
  assert.equal(`feedback` in completed.user, false);
  assert.equal(completed.user.incognito, false);
  assert.deepEqual(completed.user.likedIds, []);
  assert.equal(completed.wallet.plan, `free`);
  assert.equal(completed.wallet.cancelAt, null);
  assert.deepEqual(completed.wallet.operations, []);
  assert.ok(isAppState(completed));
});

test(`Reset and delete account clear private interest records with the local profiles`, () => {
  for (const type of [`reset`, `delete-account`] as const) {
    const cleared = transition(signup().state, { type }, now).state;
    assert.deepEqual(cleared.signupInterests, []);
    assert.equal(cleared.activeSignupInterestId, null);
    assert.equal(cleared.onboardingComplete, false);
  }
});
