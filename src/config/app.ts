import { Attribute } from '../domain/types';

export const APP = { name: `MatchXD`, currency: `USD`, minimumAge: 18, schemaVersion: 1, timezone: `America/New_York` } as const;
export const INTERESTS = [`Coffee`, `Travel`, `Cooking`, `Hiking`, `Music`, `Art`, `Fitness`, `Reading`, `Dogs`, `Gaming`, `Photography`, `Dancing`, `Movies`, `Volunteering`, `Food`, `Beach`];
export const OPTIONS: Record<Attribute, string[]> = {
  gender: [`Woman`, `Man`, `Nonbinary`, `Other`],
  ethnicity: [`Asian`, `Black`, `Hispanic / Latino`, `Middle Eastern / North African`, `Native American`, `Pacific Islander`, `White`, `Multiracial`, `Other`],
  diet: [`No Preference`, `Vegetarian`, `Vegan`, `Pescatarian`, `Halal`, `Kosher`],
  salary: [`Under $35k`, `$35k–$60k`, `$60k–$100k`, `$100k–$150k`, `$150k+`],
  politics: [`Liberal`, `Moderate`, `Conservative`, `Apolitical`, `Other`],
  religion: [`Agnostic`, `Atheist`, `Buddhist`, `Christian`, `Hindu`, `Jewish`, `Muslim`, `Spiritual`, `Other`],
  height: [`Under 5'0"`, `5'0"–5'4"`, `5'5"–5'8"`, `5'9"–6'0"`, `Over 6'0"`],
  voice: [`Has Introduction`, `Not Provided`],
  video: [`Has Introduction`, `Not Provided`],
};
export const ATTRIBUTE_LABELS: Record<Attribute, string> = { gender: `Gender`, ethnicity: `Ethnicity`, diet: `Diet`, salary: `Salary`, politics: `Politics`, religion: `Religion`, height: `Height`, voice: `Voice Introduction`, video: `Video Introduction` };
