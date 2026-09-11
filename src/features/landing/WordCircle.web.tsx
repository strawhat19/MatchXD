import { useId } from 'react';
import { XoToken } from '../../components/XoToken';

export const WordCircle = () => {
  const arc = `connection-ring-${useId().replaceAll(`:`, ``)}`;
  return <div className="mx-word-circle mx-reveal" aria-label="Real people. Brighter connections. XOXO.">
    <div className="mx-word-mask">
    <svg className="mx-word-ring" viewBox="0 0 160 160" aria-hidden="true">
      <circle cx="80" cy="80" r="79" fill="#17191F" />
      <defs><path id={arc} d="M80 17a63 63 0 1 1 0 126a63 63 0 1 1 0-126" /></defs>
      <text fill="#FFFFFF" fontSize="11" fontFamily="Poppins_500Medium,Arial,sans-serif"><textPath href={`#${arc}`} textLength="391" lengthAdjust="spacing">REAL PEOPLE ✳ BRIGHTER CONNECTIONS ✳ XOXO ✳ </textPath></text>
    </svg>
    <div className="mx-word-center" aria-hidden="true"><XoToken size={38} /></div>
    </div>
  </div>;
};
