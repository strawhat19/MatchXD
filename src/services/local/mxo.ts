import { hasTier } from '../../config/plans';
import { INTERESTS, OPTIONS } from '../../config/app';
import { AppState, Attribute } from '../../domain/types';
import { ageOf, matchesPreferences, visibleProfiles } from '../../domain/matching';

export const recommendLocally = (state: AppState, text: string) => {
  const query = text.toLocaleLowerCase();
  const excluded = (value: string) => {
    const index = query.indexOf(value.toLocaleLowerCase());
    return index >= 0 && /\b(?:not|no|without|except|excluding)\s+(?:(?:a|an|any)\s+)?$/.test(query.slice(0, index));
  };
  const excludedInterests = INTERESTS.filter(interest => query.includes(interest.toLocaleLowerCase()) && excluded(interest));
  const interests = INTERESTS.filter(interest => query.includes(interest.toLocaleLowerCase()) && !excluded(interest));
  if (/\b(outdoors|trails)\b/.test(query) && !interests.includes(`Hiking`)) interests.push(`Hiking`);
  const ageRange = query.match(/(?:ages?\s*)?(\d{2})\s*(?:to|[-–])\s*(\d{2})\b/);
  const distance = query.match(/(?:within|under|up to|max(?:imum)?)\s+(\d+)\s*(?:mi(?:les)?|km)\b/);
  const maxMiles = distance ? Number(distance[1]) / (distance[0].includes(`km`) ? 1.609344 : 1) : undefined;
  const attributes: Partial<Record<Attribute, string[]>> = {};
  const excludedAttributes: Partial<Record<Attribute, string[]>> = {};
  for (const key of Object.keys(OPTIONS) as Attribute[]) {
    if (key === `voice` || key === `video` || key === `gender`) continue;
    const values = OPTIONS[key].filter(value => value !== `Other` && value !== `No Preference` && query.includes(value.toLocaleLowerCase()));
    if (values.some(value => !excluded(value))) attributes[key] = values.filter(value => !excluded(value));
    if (values.some(excluded)) excludedAttributes[key] = values.filter(excluded);
  }
  const genders = [[`Woman`, /\b(women|woman|female)\b/], [`Man`, /\b(men|man|male)\b/], [`Nonbinary`, /\b(nonbinary|non-binary)\b/]] as const;
  for (const [value, pattern] of genders) {
    const mention = query.match(pattern)?.[0];
    if (!mention) continue;
    if (excluded(mention)) excludedAttributes.gender = [...(excludedAttributes.gender || []), value];
    else attributes.gender = [...(attributes.gender || []), value];
  }
  if (/\bvoice\b/.test(query)) attributes.voice = [excluded(`voice`) ? `Not Provided` : `Has Introduction`];
  if (/\bvideo\b/.test(query)) attributes.video = [excluded(`video`) ? `Not Provided` : `Has Introduction`];
  if ((attributes.ethnicity || excludedAttributes.ethnicity) && !hasTier(state.wallet.plan, `m`)) return { text: `Ethnicity preferences are part of M and above. You can change your plan in Wallet, or ask me about shared interests, age, or distance. No identity traits are inferred from photos.`, recommendations: [] };
  if ((attributes.salary || attributes.height || excludedAttributes.salary || excludedAttributes.height) && !hasTier(state.wallet.plan, `mx`)) return { text: `Salary and height preferences are part of MX and above. You can change your plan in Wallet, or ask me about shared interests, age, or distance.`, recommendations: [] };
  if (!interests.length && !excludedInterests.length && !ageRange && !distance && !Object.keys(attributes).length && !Object.keys(excludedAttributes).length) return { text: `Tell me one or two things you’d like to share with someone. Try “coffee and hiking,” “women ages 25 to 35,” or “within 10 miles.”`, recommendations: [] };
  const candidates = visibleProfiles(state).filter(profile => matchesPreferences(state, profile)).filter(profile => {
    if (interests.some(interest => !profile.interests.includes(interest))) return false;
    if (excludedInterests.some(interest => profile.interests.includes(interest))) return false;
    if (ageRange && (ageOf(profile.dob) < Number(ageRange[1]) || ageOf(profile.dob) > Number(ageRange[2]))) return false;
    if (maxMiles !== undefined && profile.distance > maxMiles) return false;
    if ((Object.entries(excludedAttributes) as [Attribute, string[]][]).some(([key, values]) => !profile.attributes[key] || values.includes(profile.attributes[key]!))) return false;
    return (Object.entries(attributes) as [Attribute, string[]][]).every(([key, values]) => values.includes(key === `voice` ? (profile.voiceUri ? `Has Introduction` : `Not Provided`) : key === `video` ? (profile.videoUri ? `Has Introduction` : `Not Provided`) : profile.attributes[key] || `Not Provided`));
  }).slice(0, 3);
  const reasons = [...interests, ...excludedInterests.map(value => `not ${value}`), ...(ageRange ? [`ages ${ageRange[1]}–${ageRange[2]}`] : []), ...(distance ? [`within ${distance[1]} ${distance[0].includes(`km`) ? `km` : `miles`}`] : []), ...Object.values(attributes).flat(), ...Object.values(excludedAttributes).flat().map(value => `not ${value}`)];
  return { recommendations: candidates.map(profile => profile.id), text: candidates.length ? `The profiles below match ${reasons.join(`, `)} and your saved preferences. These suggestions use self-reported profile details, not a compatibility score. Availability may change with privacy settings.` : `No visible profiles match all of these: ${reasons.join(`, `)}. Try a wider distance or fewer criteria. Your blocks and privacy settings always apply.` };
};
