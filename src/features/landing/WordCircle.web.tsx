import { useId } from 'react';
import { XoToken } from '../../components/XoToken';
import { SPARK_PATH } from '../../components/SymbolIcon';
import { WORD_CIRCLE_PATH, WORD_CIRCLE_MARKS, WORD_CIRCLE_SEGMENTS } from './wordCircleLayout';

export const WordCircle = () => {
  const arc = `connection-ring-${useId().replaceAll(`:`, ``)}`;
  return <div className="mx-word-circle mx-reveal" aria-label="Real people. Brighter connections. XOXO.">
    <div className="mx-word-mask">
    <svg className="mx-word-ring" viewBox="0 0 160 160" aria-hidden="true">
      <circle cx="80" cy="80" r="79" fill="#17191F" />
      <defs><path id={arc} d={WORD_CIRCLE_PATH} /></defs>
      <text fill="#FFFFFF" fontSize="11" fontFamily="Poppins_500Medium,Arial,sans-serif">{WORD_CIRCLE_SEGMENTS.map(segment => <textPath key={segment.text} href={`#${arc}`} textLength={segment.textLength} startOffset={segment.startOffset} lengthAdjust="spacing">{segment.text}</textPath>)}</text>
      {WORD_CIRCLE_MARKS.map(transform => <path key={transform} d={SPARK_PATH} transform={transform} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="butt" />)}
    </svg>
    <div className="mx-word-center" aria-hidden="true"><XoToken size={38} /></div>
    </div>
  </div>;
};
