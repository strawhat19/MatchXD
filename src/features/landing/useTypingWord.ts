import { useEffect, useState } from 'react';

export const WORDS = [`spark`, `match`, `zing`, `person`] as const;
type TypingState = { text: string; word: typeof WORDS[number]; phase: `hold` | `erase` | `type` | `pause` };
const INITIAL: TypingState = { text: WORDS[0], word: WORDS[0], phase: `hold` };
const DELAYS = { hold: 1800, erase: 55, pause: 220, type: 95 };

const advance = (current: TypingState): TypingState => {
  if (current.phase === `hold`) return { ...current, text: current.text.slice(0, -1), phase: `erase` };
  if (current.phase === `erase`) return current.text.length > 1 ? { ...current, text: current.text.slice(0, -1) } : { text: ``, word: WORDS[(WORDS.indexOf(current.word) + 1) % WORDS.length], phase: `pause` };
  const text = current.word.slice(0, current.text.length + 1);
  return { ...current, text, phase: text === current.word ? `hold` : `type` };
};

export const useTypingWord = (active: boolean, reducedMotion: boolean): TypingState => {
  const [state, setState] = useState<TypingState>(INITIAL);
  useEffect(() => {
    if (!active || reducedMotion) {
      setState(current => current.text === INITIAL.text && current.word === INITIAL.word && current.phase === INITIAL.phase ? current : INITIAL);
      return;
    }
    const timer = setTimeout(() => setState(advance), DELAYS[state.phase]);
    return () => clearTimeout(timer);
  }, [active, reducedMotion, state]);
  return active && !reducedMotion ? state : INITIAL;
};
