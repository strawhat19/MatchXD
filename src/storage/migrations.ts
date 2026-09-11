import { isAppState } from '../domain/validation';
import { AppState, Profile } from '../domain/types';
import { restoreActivityHistory } from '../domain/quotas';

const legacyWelcome = `Hi, I’m MXO, your local demo connection guide. Tell me what matters to you — try “someone who likes hiking and coffee” or “ages 25 to 35 within 10 miles.” I use only what you share and the demo profiles.`;
const currentWelcome = `Hi, I’m MXO, your connection guide. Tell me what matters to you — try “someone who likes hiking and coffee” or “ages 25 to 35 within 10 miles.”`;
const legacyLinks = [
  { id: `User_2_Sofia_9_10_2026_Demo`, label: `Creative Inspiration`, url: `https://www.metmuseum.org/` },
  { id: `User_3_Maya_9_10_2026_Demo`, label: `Favorite Place`, url: `https://www.centralparknyc.org/` },
  { id: `User_5_Marcus_9_10_2026_Demo`, label: `Music Inspiration`, url: `https://www.npr.org/music` },
];
const migrateReply = (text: string) => {
  const tierReplies = [
    `Ethnicity preferences are part of M and above. You can change your demo plan in Wallet, or ask me about shared interests, age, or distance. No identity traits are inferred from photos.`,
    `Salary and height preferences are part of MX and above. You can change your demo plan in Wallet, or ask me about shared interests, age, or distance.`,
  ];
  const prompt = `Tell me one or two things you’d like to share with someone. Try “coffee and hiking,” “women ages 25 to 35,” or “within 10 miles.”`;
  if (tierReplies.includes(text)) return text.replace(`your demo plan`, `your plan`);
  if (text === `${prompt} I only filter fictional demo profiles using your stated preferences; I don’t search the internet.`) return prompt;
  if (text.startsWith(`The demo profiles below match `) && text.endsWith(` and your saved preferences. These suggestions use self-reported profile details, not a compatibility score. Availability may change with privacy settings.`)) return text.replace(`The demo profiles below match `, `The profiles below match `);
  if (text.startsWith(`No visible demo profiles match all of these: `) && text.endsWith(`. Try a wider distance or fewer criteria. Your blocks and privacy settings always apply.`)) return text.replace(`No visible demo profiles match `, `No visible profiles match `);
  return text;
};
const migrateV1Copy = (state: AppState): AppState => {
  const userMessageIds = new Set(state.mxoMessages.filter(message => message.role === `user`).map(message => `${message.id}_reply`));
  return {
    ...state,
    profiles: state.profiles.map(profile => {
      const legacy = legacyLinks.find(link => link.id === profile.id);
      return legacy ? { ...profile, links: profile.links.map(link => link.label === `${legacy.label} (Demo)` && link.url === legacy.url ? { ...link, label: legacy.label } : link) } : profile;
    }),
    mxoMessages: state.mxoMessages.map(message => message.role !== `assistant` ? message : message.id === `MXO_Welcome` && message.text === legacyWelcome ? { ...message, text: currentWelcome } : userMessageIds.has(message.id) ? { ...message, text: migrateReply(message.text) } : message),
    wallet: { ...state.wallet, ledger: state.wallet.ledger.map(entry => !state.wallet.operations.includes(entry.id) ? entry : entry.label === `Demo XO Pack — No Charge` ? { ...entry, label: `XO Pack — No Charge` } : entry.label === `Demo Ad Reward` ? { ...entry, label: `XO Reward` } : entry) },
  };
};
const durableMedia = (uri?: string) => uri && !/^(blob:|data:)/i.test(uri) ? uri : undefined;
const durableProfile = (profile: Profile): Profile => {
  const photos = profile.photos.filter(photo => durableMedia(photo));
  return { ...profile, photos: photos.length ? photos : [`noah`], voiceUri: durableMedia(profile.voiceUri), videoUri: durableMedia(profile.videoUri) };
};
export const serializableSnapshot = (state: AppState): AppState => ({ ...state, user: durableProfile(state.user), profiles: state.profiles.map(durableProfile) });
export const serializeSnapshot = (state: AppState) => JSON.stringify(serializableSnapshot(state));
export const migrateSnapshot = (raw: string): AppState => {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== `object` || !(`version` in parsed)) throw new Error(`The Saved Data Has No Supported Version`);
  if (parsed.version !== 1) throw new Error(`This Saved Data Version Is Unsupported`);
  if (!(`nextProfileNumber` in parsed) && `user` in parsed && `profiles` in parsed && Array.isArray(parsed.profiles)) {
    const profiles = [parsed.user, ...parsed.profiles];
    if (profiles.every(profile => profile && typeof profile === `object` && `number` in profile && Number.isSafeInteger(profile.number))) Object.assign(parsed, { nextProfileNumber: Math.max(...profiles.map(profile => profile.number)) + 1 });
  }
  const restored = restoreActivityHistory(parsed as AppState);
  if (!isAppState(restored)) throw new Error(`The Saved Data Failed Validation`);
  return migrateV1Copy(restored);
};
