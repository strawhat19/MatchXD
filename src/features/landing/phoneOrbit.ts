export const orbitPhones = [
  { model: `iphone17`, screen: `discover`, person: 0 },
  { model: `pro`, screen: `discover`, person: 1 },
  { model: `promax`, screen: `discover`, person: 2 },
  { model: `iphone17`, screen: `mxo`, person: 3 },
  { model: `pro`, screen: `discover`, person: 4 },
  { model: `promax`, screen: `discover`, person: 5 },
  { model: `iphone17`, screen: `discover`, person: 6 },
  { model: `pro`, screen: `messages`, person: 7 },
  { model: `promax`, screen: `discover`, person: 8 },
  { model: `iphone17`, screen: `discover`, person: 9 },
  { model: `pro`, screen: `discover`, person: 10 },
  { model: `promax`, screen: `mxo`, person: 11 },
  { model: `iphone17`, screen: `discover`, person: 12 },
  { model: `pro`, screen: `discover`, person: 13 },
  { model: `promax`, screen: `discover`, person: 14 },
  { model: `iphone17`, screen: `messages`, person: 15 },
] as const;

export type PreviewPerson = {
  age: number;
  name: string;
  city: string;
  photo: string;
  mxoReply?: string;
  mxoPrompt?: string;
  interests: readonly string[];
  messages?: readonly [string, string, string];
};

export const previewPeople = [
  { photo: `maya`, name: `Maya`, age: 29, city: `Queens`, interests: [`Travel`, `Design`, `Coffee`] },
  { photo: `elena`, name: `Elena`, age: 28, city: `Manhattan`, interests: [`Books`, `Music`, `Cooking`] },
  { photo: `marcus`, name: `Marcus`, age: 30, city: `Brooklyn`, interests: [`Jazz`, `Food`, `Design`] },
  {
    photo: `noah`, name: `Noah`, age: 29, city: `Manhattan`, interests: [`Hiking`, `Film`, `Art`],
    mxoPrompt: `A trail on Saturday. An indie film on Sunday.`,
    mxoReply: `Noah loves both. Ask which trail deserves a sequel.`,
  },
  { photo: `ethan`, name: `Ethan`, age: 31, city: `Queens`, interests: [`Travel`, `Cooking`, `Music`] },
  { photo: `aisha`, name: `Aisha`, age: 28, city: `Brooklyn`, interests: [`Books`, `Poetry`, `Coffee`] },
  { photo: `nina`, name: `Nina`, age: 30, city: `Queens`, interests: [`Pottery`, `Art`, `Tea`] },
  {
    photo: `isabel`, name: `Isabel`, age: 29, city: `Manhattan`, interests: [`Food`, `Markets`, `Travel`],
    messages: [`Important question: tacos or tapas?`, `Tacos first. Then a walk by the river?`, `That sounds like my kind of evening.`],
  },
  { photo: `zoe`, name: `Zoe`, age: 27, city: `Brooklyn`, interests: [`Nature`, `Running`, `Books`] },
  { photo: `priya`, name: `Priya`, age: 31, city: `Queens`, interests: [`Gardens`, `Art`, `Cooking`] },
  { photo: `lucia`, name: `Lucia`, age: 32, city: `Brooklyn`, interests: [`Coffee`, `Travel`, `Film`] },
  {
    photo: `amara`, name: `Amara`, age: 28, city: `Manhattan`, interests: [`Plants`, `Jazz`, `Design`],
    mxoPrompt: `Rooftop gardens, live jazz, and slow Sundays.`,
    mxoReply: `Amara shares your rhythm. Start with a favorite jazz record.`,
  },
  { photo: `theo`, name: `Theo`, age: 30, city: `Brooklyn`, interests: [`Hiking`, `Cycling`, `Nature`] },
  { photo: `gabriel`, name: `Gabriel`, age: 34, city: `Queens`, interests: [`Art`, `Food`, `Music`] },
  { photo: `julian`, name: `Julian`, age: 29, city: `Manhattan`, interests: [`Books`, `Coffee`, `Film`] },
  {
    photo: `oliver`, name: `Oliver`, age: 33, city: `Brooklyn`, interests: [`Hiking`, `Books`, `Cooking`],
    messages: [`What is your perfect Sunday?`, `A park walk, a bookshop, and pasta from scratch.`, `I make an excellent reading companion. And sous-chef.`],
  },
] as const satisfies readonly PreviewPerson[];
