import test from 'node:test';
import assert from 'node:assert/strict';
import { transition } from './transition';
import { isAppState } from './validation';
import { initialState } from '../data/demoProfiles';
import { migrateSnapshot, serializeSnapshot } from '../storage/migrations';
import { avatarOptions, defaultProfileAvatar, isStoredProfilePhoto, maxProfilePhotoBytes } from './avatars';

const now = new Date(`2026-09-11T16:00:00.000Z`);
const preview = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==`;

test(`Local avatars and uploaded images persist through completed onboarding`, () => {
  const draft = transition(initialState(now), { type: `start-session`, role: `member` }, now).state;
  for (const photo of [...avatarOptions.map(avatar => avatar.id), preview]) {
    const completed = transition(draft, { type: `save-user`, profile: { photos: [photo] }, complete: true }, now);
    assert.equal(completed.result.ok, true);
    const restored = migrateSnapshot(serializeSnapshot(completed.state));
    assert.deepEqual(restored.user.photos, [photo]);
    assert.ok(isAppState(restored));
  }
  assert.equal(transition(draft, { type: `save-user`, profile: { photos: [`avatar:unknown`] }, complete: true }, now).result.ok, false);
});

test(`Stored image validation bounds upload size and rejects unsupported or malformed data`, () => {
  assert.equal(isStoredProfilePhoto(preview), true);
  assert.equal(isStoredProfilePhoto(`data:image/jpeg;base64,${Buffer.alloc(maxProfilePhotoBytes).toString(`base64`)}`), true);
  for (const photo of [`data:image/svg+xml;base64,PHN2Zy8+`, `data:image/png;base64,ABC`, `data:image/png;base64,===!`, `data:audio/wav;base64,AAAA`, `data:image/jpeg;base64,${Buffer.alloc(maxProfilePhotoBytes + 1).toString(`base64`)}`]) {
    assert.equal(isStoredProfilePhoto(photo), false);
    const state = { ...initialState(now), user: { ...initialState(now).user, photos: [photo] } };
    assert.equal(isAppState(state), false);
    assert.deepEqual(migrateSnapshot(serializeSnapshot(state)).user.photos, [defaultProfileAvatar]);
  }
});
