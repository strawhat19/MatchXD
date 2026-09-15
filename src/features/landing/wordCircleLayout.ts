export const WORD_CIRCLE_PATH = `M80 17a63 63 0 1 1 0 126a63 63 0 1 1 0-126`;
export const WORD_CIRCLE_SEGMENTS = [
  { text: `REAL PEOPLE`, startOffset: 0, textLength: 94 },
  { text: `BRIGHTER CONNECTIONS`, startOffset: 122, textLength: 173 },
  { text: `XOXO`, startOffset: 323, textLength: 46 },
];
export const WORD_CIRCLE_MARKS = [108, 309, 382].map(offset => `rotate(${offset / (126 * Math.PI) * 360} 80 80) translate(74.5 7.5) scale(${11 / 24})`);
