import { AppState, SignupContact, SignupInterest, SignupInterestInput } from './types';

export const signupFeedbackLimit = 1000;

export const normalizeSignupContact = (input: unknown): SignupContact | null => {
  if (typeof input !== `string`) return null;
  const value = input.trim();
  if (value.includes(`@`)) {
    if (value.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(value)) return null;
    return { kind: `email`, value: value.toLowerCase() };
  }
  if (!/^\+?[\d\s().-]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, ``);
  if (digits.length < 7 || digits.length > 15) return null;
  // Formatting and a leading + do not create a second local record.
  return { kind: `phone`, value: digits };
};

export const signupContactError = (contact: unknown) => normalizeSignupContact(contact) ? null : `Enter A Valid Email Or Phone Number (Include Your Country Code)`;

export const signupInterestError = (input: SignupInterestInput) => {
  if (!input || typeof input !== `object`) return `Choose Beta Or Founding And Add Your Contact`;
  const contactError = signupContactError(input.contact);
  if (contactError) return contactError;
  if (![`beta`, `founding`].includes(input.plan)) return `Choose Beta Or Founding`;
  if (input.feedback !== undefined && (typeof input.feedback !== `string` || input.feedback.length > signupFeedbackLimit)) return `Keep Feedback To 1,000 Characters Or Fewer`;
  return null;
};

export const signupContactKey = (contact: SignupContact) => `${contact.kind}:${contact.value}`;

export const activeSignupInterest = (state: AppState) => state.signupInterests.find(interest => interest.id === state.activeSignupInterestId);

export const isSignupInterest = (input: unknown): input is SignupInterest => {
  if (!input || typeof input !== `object` || Array.isArray(input)) return false;
  const value = input as Partial<SignupInterest>;
  if (typeof value.id !== `string` || !value.id || typeof value.profileId !== `string` || !value.profileId) return false;
  if (!value.contact || typeof value.contact !== `object` || ![`email`, `phone`].includes(value.contact.kind)) return false;
  const normalized = normalizeSignupContact(value.contact.value);
  if (!normalized || normalized.kind !== value.contact.kind || normalized.value !== value.contact.value) return false;
  if (![`beta`, `founding`].includes(String(value.plan)) || typeof value.feedback !== `string` || value.feedback.length > signupFeedbackLimit) return false;
  if (typeof value.createdAt !== `string` || typeof value.updatedAt !== `string`) return false;
  const created = Date.parse(value.createdAt);
  const updated = Date.parse(value.updatedAt);
  return Number.isFinite(created) && Number.isFinite(updated) && updated >= created;
};

export const restoreSignupInterests = (state: AppState): AppState => {
  const missingInterests = !Object.prototype.hasOwnProperty.call(state, `signupInterests`);
  const missingActive = !Object.prototype.hasOwnProperty.call(state, `activeSignupInterestId`);
  if (!missingInterests && !missingActive) return state;
  return { ...state, ...(missingInterests ? { signupInterests: [] } : {}), ...(missingActive ? { activeSignupInterestId: null } : {}) };
};
