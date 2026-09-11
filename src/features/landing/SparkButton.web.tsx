import './SparkButton.css';
import { useTypingWord } from './useTypingWord';
import type { SparkButtonProps } from './SparkButton.types';
import { useRef, useState, useEffect, type CSSProperties } from 'react';

export const SparkButton = ({ onPress, active = true, className = `mx-pill mx-pill-black`, revealDelay = 0 }: SparkButtonProps) => {
  const button = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const running = active && visible && !reducedMotion;
  const { text, word, phase } = useTypingWord(active && visible, reducedMotion);

  useEffect(() => {
    const element = button.current;
    if (!element) return;
    const reveal = element.closest(`.mx-reveal-group`) ?? element;
    const preference = window.matchMedia(`(prefers-reduced-motion: reduce)`);
    let intersects = typeof IntersectionObserver === `undefined`;
    const updateVisibility = () => {
      const hasReveal = reveal.classList.contains(`mx-reveal-group`) || reveal.classList.contains(`mx-reveal`);
      const entered = !hasReveal || reveal.classList.contains(`mx-entered`) || reveal.classList.contains(`mx-focus-revealed`);
      setVisible(intersects && entered && !document.hidden);
    };
    const updateMotion = () => setReducedMotion(preference.matches);
    const observer = typeof IntersectionObserver === `undefined` ? null : new IntersectionObserver(entries => {
      intersects = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0);
      updateVisibility();
    }, { root: element.closest(`.mx-landing`), threshold: 0 });
    const revealObserver = new MutationObserver(updateVisibility);
    observer?.observe(element);
    revealObserver.observe(reveal, { attributes: true, attributeFilter: [`class`] });
    preference.addEventListener(`change`, updateMotion);
    document.addEventListener(`visibilitychange`, updateVisibility);
    updateMotion();
    updateVisibility();
    return () => {
      observer?.disconnect();
      revealObserver.disconnect();
      preference.removeEventListener(`change`, updateMotion);
      document.removeEventListener(`visibilitychange`, updateVisibility);
    };
  }, []);

  return <button ref={button} className={`${className} mx-spark-button`} style={{ '--reveal-delay': `${revealDelay}ms` } as CSSProperties} onClick={onPress} aria-label={`Find your ${word}`} data-typing-phase={phase} data-typing-active={running}>
    <span className="mx-pill-label mx-spark-label" aria-hidden="true">Find your<span className="mx-spark-slot"><span className="mx-spark-sizer">person</span><span className="mx-spark-word">{[...text].map((letter, index) => <span key={`${word}-${index}`} className="mx-spark-letter">{letter}</span>)}<span className="mx-spark-caret" /></span></span></span>
    <span aria-hidden="true">↗</span>
  </button>;
};
