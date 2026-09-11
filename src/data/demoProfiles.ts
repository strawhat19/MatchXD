import { profileId } from '../domain/identity';
import { createWallet } from '../domain/wallet';
import { createDailyActions } from '../domain/quotas';
import { AppState, Attribute, Profile } from '../domain/types';

export const SELF_ID = `User_1_Alex_5_21_1997_DemoSelf`;
export const emptyAttributes = () => ({ gender: [], ethnicity: [], diet: [], salary: [], politics: [], religion: [], height: [], voice: [], video: [] } satisfies Record<Attribute, string[]>);
export const createProfile = (number: number, values: Partial<Profile> = {}): Profile => ({
  id: profileId(number, values.name || `New`),
  number,
  name: `New Profile`,
  dob: `1997-05-21`,
  city: `New York, NY`,
  bio: `Tell people a little about yourself`,
  job: ``,
  photos: [`sofia`],
  distance: 3,
  interests: [],
  attributes: {},
  links: [],
  directoryOptIn: false,
  discoverable: true,
  incognito: false,
  likedIds: [],
  blockedIds: [],
  ...values,
});
const seedProfile = (number: number, name: string, values: Partial<Profile>) => createProfile(number, { id: `User_${number}_${name}_9_10_2026_Demo`, name, ...values });
export const demoProfiles = (): Profile[] => [
  seedProfile(2, `Sofia`, { dob: `1999-08-16`, job: `Product Designer`, distance: 3, photos: [`sofia`], bio: `Usually finding a new coffee spot, getting lost in a gallery, or planning a weekend somewhere green. Tell me your favorite little corner of the city.`, interests: [`Coffee`, `Art`, `Travel`, `Hiking`], likedIds: [SELF_ID], directoryOptIn: true, links: [{ label: `Creative Inspiration`, url: `https://www.metmuseum.org/` }], attributes: { gender: `Woman`, diet: `Vegetarian`, height: `5'5"–5'8"`, politics: `Liberal`, religion: `Agnostic` } }),
  seedProfile(3, `Maya`, { dob: `1998-03-04`, voiceUri: `demo:voice`, job: `Architect`, distance: 5, photos: [`maya`], bio: `A morning run, a great playlist, and dinner with friends. Building a life that feels as good as it looks. Bonus points if you have a dog.`, interests: [`Fitness`, `Dogs`, `Cooking`, `Music`], likedIds: [SELF_ID], directoryOptIn: true, links: [{ label: `Favorite Place`, url: `https://www.centralparknyc.org/` }], attributes: { gender: `Woman`, ethnicity: `Asian`, diet: `Pescatarian`, salary: `$60k–$100k`, height: `5'0"–5'4"`, religion: `Spiritual` } }),
  seedProfile(4, `Elena`, { dob: `1996-11-12`, job: `Photographer`, distance: 7, photos: [`elena`], bio: `Chasing good light and even better conversations. I make a very convincing case for one more chapter and one more slice of pizza.`, interests: [`Photography`, `Reading`, `Food`, `Travel`], likedIds: [SELF_ID], attributes: { gender: `Woman`, ethnicity: `Hispanic / Latino`, diet: `No Preference`, height: `5'5"–5'8"`, politics: `Moderate` } }),
  seedProfile(5, `Marcus`, { dob: `1995-07-09`, videoUri: `demo:video`, job: `Music Producer`, distance: 4, photos: [`marcus`], bio: `Making music, trying new recipes, and saying yes to live shows. Looking for someone who can turn a regular Tuesday into a good story.`, interests: [`Music`, `Cooking`, `Dancing`, `Movies`], likedIds: [SELF_ID], directoryOptIn: true, links: [{ label: `Music Inspiration`, url: `https://www.npr.org/music` }], attributes: { gender: `Man`, ethnicity: `Black`, diet: `Vegan`, salary: `$60k–$100k`, height: `5'9"–6'0"`, politics: `Liberal` } }),
  seedProfile(6, `Ethan`, { dob: `1994-01-27`, job: `Urban Planner`, distance: 12, photos: [`ethan`], bio: `Weekdays designing better neighborhoods. Weekends finding trails and a good bowl of ramen. I always bring extra snacks.`, interests: [`Hiking`, `Food`, `Volunteering`, `Dogs`], attributes: { gender: `Man`, ethnicity: `White`, diet: `Vegetarian`, height: `Over 6'0"`, salary: `$100k–$150k`, religion: `Agnostic` } }),
  seedProfile(7, `Noah`, { dob: `1998-06-18`, job: `Software Engineer`, distance: 9, photos: [`noah`], bio: `Board game strategist, amateur baker, and movie enthusiast. Looking for a teammate for little adventures and ambitious breakfast plans.`, interests: [`Gaming`, `Movies`, `Cooking`, `Beach`], attributes: { gender: `Nonbinary`, diet: `No Preference`, height: `5'9"–6'0"`, salary: `$100k–$150k` } }),
];
export const initialState = (now = new Date()): AppState => {
  const profiles = demoProfiles();
  const matches = [profiles[2].id, profiles[3].id];
  return {
    version: 1,
    nextProfileNumber: 8,
    user: createProfile(1, { id: SELF_ID, name: `Alex`, photos: [`noah`], bio: `Here for good conversations and little adventures. Coffee, fresh air, and a shared playlist make a pretty good day.`, interests: [`Coffee`, `Travel`, `Music`], likedIds: matches }),
    profiles,
    session: null,
    settings: { theme: `dark`, incognito: false, discoverable: true, notifications: { push: false, email: false, sms: false } },
    preferences: { ageMin: 18, ageMax: 99, distance: 100, hiddenNames: [], attributes: emptyAttributes() },
    wallet: createWallet(now),
    dailyActions: createDailyActions(now),
    introductions: [],
    contactHistory: matches,
    swipes: [],
    matches,
    messages: [{ id: `Message_Demo_1`, profileId: matches[0], sender: `profile`, text: `Hey Alex! What is one place in the city you could visit over and over?`, at: now.toISOString() }, { id: `Message_Demo_2`, profileId: matches[1], sender: `profile`, text: `We both love music. What has been on repeat this week?`, at: now.toISOString() }],
    blocks: [],
    reports: [],
    mxoMessages: [{ id: `MXO_Welcome`, role: `assistant`, text: `Hi, I’m MXO, your connection guide. Tell me what matters to you — try “someone who likes hiking and coffee” or “ages 25 to 35 within 10 miles.”`, at: now.toISOString() }],
  };
};
