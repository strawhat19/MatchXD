import { localDay } from './wallet';
import { hasTier } from '../config/plans';
import { AppState, Attribute, Profile } from './types';

export const ageOf = (dob: string, now = new Date()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return NaN;
  const [year, month, day] = dob.split(`-`).map(Number);
  const birth = new Date(Date.UTC(year, month - 1, day));
  const today = localDay(now);
  if (birth.getUTCFullYear() !== year || birth.getUTCMonth() !== month - 1 || birth.getUTCDate() !== day || dob > today) return NaN;
  const [currentYear, currentMonth, currentDay] = today.split(`-`).map(Number);
  const notYetBirthday = currentMonth < month || (currentMonth === month && currentDay < day);
  return currentYear - year - Number(notYetBirthday);
};
export const canViewProfile = (state: AppState, profile: Profile) => {
  if (profile.id === state.user.id) return true;
  if (state.blocks.includes(profile.id) || state.user.blockedIds.includes(profile.id) || profile.blockedIds.includes(state.user.id)) return false;
  if (!profile.discoverable || (profile.incognito && !profile.likedIds.includes(state.user.id))) return false;
  return Number.isFinite(ageOf(profile.dob)) && ageOf(profile.dob) >= 18;
};
export const visibleProfiles = (state: AppState) => state.profiles.filter(profile => canViewProfile(state, profile));
export const matchesPreferences = (state: AppState, profile: Profile) => {
  const { preferences, wallet } = state;
  const age = ageOf(profile.dob);
  if (!Number.isFinite(age) || age < preferences.ageMin || age > preferences.ageMax || profile.distance > preferences.distance) return false;
  if (preferences.hiddenNames.some(name => name.trim().toLocaleLowerCase() === profile.name.trim().toLocaleLowerCase())) return false;
  return (Object.keys(preferences.attributes) as Attribute[]).every(attribute => {
    if (attribute === `ethnicity` && !hasTier(wallet.plan, `m`)) return true;
    if ((attribute === `salary` || attribute === `height`) && !hasTier(wallet.plan, `mx`)) return true;
    const wanted = preferences.attributes[attribute];
    const actual = attribute === `voice` ? (profile.voiceUri ? `Has Introduction` : `Not Provided`) : attribute === `video` ? (profile.videoUri ? `Has Introduction` : `Not Provided`) : profile.attributes[attribute] || `Not Provided`;
    return !wanted.length || wanted.includes(actual);
  });
};
export const discoveryProfiles = (state: AppState) => visibleProfiles(state).filter(profile => !state.swipes.some(swipe => swipe.profileId === profile.id) && !state.matches.includes(profile.id) && matchesPreferences(state, profile));
