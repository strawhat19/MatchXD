import './CountUp.css';
import { useRef, useEffect } from 'react';
import { formatCount } from './CountUp.shared';

export type CountUpProps = { value: number };

export const CountUp = ({ value }: CountUpProps) => {
  const wrapper = useRef<HTMLSpanElement>(null);
  const number = useRef<HTMLSpanElement>(null);
  const target = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  const formattedTarget = formatCount(target);

  useEffect(() => {
    const element = wrapper.current;
    const digits = number.current;
    if (!element || !digits) return;
    const preference = window.matchMedia(`(prefers-reduced-motion: reduce)`);
    let frame = 0;
    let elapsed = 0;
    let previousTime = 0;
    let armed = true;
    let running = false;
    let intersection = 0;
    const write = (count: number, blur = 0) => {
      digits.textContent = formatCount(count);
      digits.style.filter = blur > 0 ? `blur(${blur.toFixed(2)}px)` : `none`;
    };
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    };
    const tick = (time: number) => {
      frame = 0;
      if (!running || document.hidden || intersection <= 0) { previousTime = 0; return; }
      elapsed = Math.min(1400, elapsed + (previousTime ? time - previousTime : 0));
      previousTime = time;
      const progress = elapsed / 1400;
      const eased = 1 - Math.pow(1 - progress, 3);
      write(progress >= 1 ? target : Math.floor(target * eased), Math.sin(progress * Math.PI) * 1.4);
      if (progress >= 1) { running = false; write(target); }
      else frame = requestAnimationFrame(tick);
    };
    const start = () => {
      armed = false;
      elapsed = 0;
      pause();
      if (preference.matches || !target) { running = false; write(target); return; }
      running = true;
      write(0);
      frame = requestAnimationFrame(tick);
    };
    const changeMotion = () => {
      if (preference.matches) {
        pause();
        running = false;
        if (intersection > 0) armed = false;
        write(target);
      } else if (armed && intersection >= .35 && !document.hidden) start();
      else write(armed ? 0 : target);
    };
    const changeVisibility = () => {
      if (document.hidden) { pause(); return; }
      if (armed && intersection >= .35) start();
      else if (running && intersection > 0 && !frame) frame = requestAnimationFrame(tick);
    };
    write(preference.matches ? target : 0);
    if (typeof IntersectionObserver === `undefined`) { write(target); return; }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        intersection = entry.isIntersecting ? entry.intersectionRatio : 0;
        if (intersection <= 0) {
          pause();
          running = false;
          armed = true;
          elapsed = 0;
          write(preference.matches ? target : 0);
        } else if (armed && intersection >= .35 && !document.hidden) start();
      });
    }, { root: element.closest(`.mx-landing`), threshold: [0, .35] });
    observer.observe(element);
    preference.addEventListener(`change`, changeMotion);
    document.addEventListener(`visibilitychange`, changeVisibility);
    return () => {
      pause();
      observer.disconnect();
      preference.removeEventListener(`change`, changeMotion);
      document.removeEventListener(`visibilitychange`, changeVisibility);
    };
  }, [target]);

  return <span ref={wrapper} className="mx-countup-value"><span className="mx-countup-sizer" aria-hidden="true">{formattedTarget}</span><span ref={number} className="mx-countup-number" aria-hidden="true">0</span><span className="mx-countup-accessible">{formattedTarget}</span></span>;
};
