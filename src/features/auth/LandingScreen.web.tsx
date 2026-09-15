import './LandingScreen.css';
import { Icon } from '../../components/Icon';
import { CountUp } from '../landing/CountUp';
import { Redirect, router } from 'expo-router';
import { ECONOMY } from '../../config/economy';
import { useApp } from '../../state/AppProvider';
import { XoCopy } from '../../components/XoToken';
import { WordCircle } from '../landing/WordCircle';
import { orbitPhones } from '../landing/phoneOrbit';
import { SparkButton } from '../landing/SparkButton';
import { useTheme } from '../../theme/ThemeProvider';
import { PhonePreview } from '../landing/PhonePreview';
import { SymbolIcon } from '../../components/SymbolIcon';
import { LandingHeader } from '../landing/LandingHeader';
import { CommunityStats } from '../landing/CommunityStats';
import { PricingComparison } from '../landing/PricingComparison';
import { PLANS, PLAN_ORDER, DAILY_GRANTS } from '../../config/plans';
import { AppIcon, BrandMark, ConnectedX } from '../../components/BrandMark';
import { planActionAllowances, PLAN_MATCHED_CHAT } from '../../config/planComparison';
import { useRef, useState, useEffect, useLayoutEffect, type CSSProperties } from 'react';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const amount = clamp(value); return amount * amount * (3 - 2 * amount); };
const setRevealGroup = (node: HTMLElement, entered: boolean) => {
  if (node.classList.contains(`mx-entered`) === entered) return;
  node.classList.toggle(`mx-entered`, entered);
  if (!entered) node.querySelectorAll(`.mx-focus-revealed`).forEach(item => item.classList.remove(`mx-focus-revealed`));
};
const SplitText = ({ text, dark = false, start = 0 }: { text: string; dark?: boolean; start?: number }) => <span className={`mx-split ${dark ? `mx-ink` : ``}`}>{text.split(` `).map((word, index, words) => <span className="mx-word" key={`${word}-${index}`}><span style={{ '--word-order': index + start } as CSSProperties}>{word}{index < words.length - 1 ? `\u00a0` : ``}</span></span>)}</span>;
const PlanBenefits = ({ plan }: { plan: (typeof PLAN_ORDER)[number] }) => <ul className="mx-plan-benefits">{planActionAllowances(plan).map(action => <li key={action.id}>{action.label}: {action.limit} / day</li>)}<li>{PLAN_MATCHED_CHAT}</li></ul>;

const FeatureTicker = () => {
  const track = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  useLayoutEffect(() => {
    const node = track.current;
    const group = node?.firstElementChild;
    const container = node?.parentElement;
    if (!node || !group || !container) return;
    const measure = () => {
      const groupWidth = group.getBoundingClientRect().width;
      if (!groupWidth) return;
      node.style.setProperty(`--ticker-distance`, `${-groupWidth}px`);
      setCopies(Math.max(2, Math.ceil(container.clientWidth / groupWidth) + 1));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    observer.observe(container);
    measure();
    return () => observer.disconnect();
  }, []);
  return <div className="mx-ticker" aria-hidden="true"><div ref={track}>{Array.from({ length: copies }, (_, index) => <span key={index}>LESS ENDLESS SWIPING <b><SymbolIcon name="spark" color="currentColor" size={27} /></b> MORE REAL POSSIBILITY <b><SymbolIcon name="spark" color="currentColor" size={27} /></b> YOUR KIND OF PEOPLE <b><SymbolIcon name="spark" color="currentColor" size={27} /></b> YOUR KIND OF PACE <b><SymbolIcon name="spark" color="currentColor" size={27} /></b> </span>)}</div></div>;
};

export const LandingScreen = () => {
  const { dark } = useTheme();
  const { state, ready } = useApp();
  const page = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const journey = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const ending = useRef<HTMLDivElement>(null);
  const centerIcon = useRef<HTMLDivElement>(null);
  const privacy = useRef<HTMLDialogElement>(null);
  const deviceNodes = useRef<(HTMLDivElement | null)[]>([]);
  const phase = useRef(0);
  const entranceProgress = useRef(0);
  const sparkScroll = useRef<{ start: number; target: number } | null>(null);
  const [reduced, setReduced] = useState(() => typeof window !== `undefined` && window.matchMedia(`(prefers-reduced-motion: reduce)`).matches);
  const authenticated = ready && !!state.session;

  useEffect(() => {
    const preference = window.matchMedia(`(prefers-reduced-motion: reduce)`);
    const change = () => setReduced(preference.matches);
    preference.addEventListener(`change`, change);
    return () => preference.removeEventListener(`change`, change);
  }, []);

  useEffect(() => {
    const root = page.current;
    if (!root || authenticated) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const circularText = entry.target.classList.contains(`mx-word-circle`);
        if (circularText) entry.target.classList.toggle(`mx-onstage`, entry.isIntersecting);
        if (entry.isIntersecting && entry.intersectionRatio >= .18) entry.target.classList.add(`mx-entered`);
        if (!entry.isIntersecting) entry.target.classList.remove(`mx-entered`, `mx-focus-revealed`);
      });
    }, { root, threshold: [0, .18] });
    const revealFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      event.target.closest(`.mx-reveal`)?.classList.add(`mx-entered`);
      event.target.closest(`.mx-reveal-item`)?.classList.add(`mx-focus-revealed`);
    };
    root.querySelectorAll(`.mx-reveal`).forEach(node => observer.observe(node));
    root.addEventListener(`focusin`, revealFocused);
    return () => { observer.disconnect(); root.removeEventListener(`focusin`, revealFocused); };
  }, [authenticated]);

  useLayoutEffect(() => {
    const scrollArea = page.current;
    const scene = stage.current;
    const track = journey.current;
    const ticker = scrollArea?.querySelector<HTMLElement>(`.mx-ticker`);
    const focusAction = ending.current?.querySelector<HTMLElement>(`.mx-focus-right`);
    const focusHeading = ending.current?.querySelector<HTMLElement>(`.mx-focus-left`);
    if (!scrollArea || !scene || !track || authenticated) return;
    if (reduced && sparkScroll.current) {
      scrollArea.scrollTo({ top: sparkScroll.current.target, behavior: `instant` });
      sparkScroll.current = null;
      delete scrollArea.dataset.sparkScroll;
    }
    let frame = 0;
    let previousTime = performance.now();
    let width = scene.clientWidth;
    let height = scene.clientHeight;
    let stageInset = Number.parseFloat(scene.style.getPropertyValue(`--stage-inset`)) || 0;
    let tickerHeight = 0;
    let tickerTop = 0;
    let sceneVersion = 0;
    let drawnVersion = -1;
    let previousProgress = -1;
    let previousEntranceProgress = -1;
    let previouslyVisible = false;
    let viewportHeight = scrollArea.clientHeight;
    let trackHeight = track.offsetHeight;
    let introBottom = 0;
    let focusTop = 0;
    let focusBottom = height;
    let start = track.offsetTop;
    let distance = Math.max(1, track.offsetHeight - height);
    let displayedProgress = clamp(scrollArea.scrollTop / distance);
    const measureScene = () => {
      width = scene.clientWidth;
      height = scene.clientHeight;
      introBottom = (intro.current?.offsetTop ?? 0) + (intro.current?.offsetHeight ?? 0);
      focusTop = (focusHeading?.offsetTop ?? 0) + (focusHeading?.offsetHeight ?? 0) + 16;
      focusBottom = (focusAction?.offsetTop ?? height) - 16;
      sceneVersion += 1;
    };
    deviceNodes.current.forEach((node, index) => {
      if (node) node.style.zIndex = `${index === 0 ? orbitPhones.length + 1 : orbitPhones.length - index}`;
    });
    const draw = (time: number) => {
      frame = 0;
      const delta = Math.min(50, time - previousTime);
      previousTime = time;
      const scrollTop = scrollArea.scrollTop;
      const scrolling = sparkScroll.current;
      if (scrolling && Math.abs(scrollTop - scrolling.target) <= 1) {
        sparkScroll.current = null;
        delete scrollArea.dataset.sparkScroll;
      }
      const tickerVisible = Math.max(0, Math.min(tickerHeight, scrollTop + viewportHeight - tickerTop));
      const scrollReveal = scrolling && !reduced ? smooth((scrollTop - scrolling.start) / Math.max(1, scrolling.target - scrolling.start) / .3) : 0;
      const inset = Math.max(tickerVisible, tickerHeight * scrollReveal);
      if (Math.abs(inset - stageInset) > .01) {
        stageInset = inset;
        scene.style.setProperty(`--stage-inset`, `${inset}px`);
      }
      const targetProgress = clamp(scrollTop / distance);
      const visible = scrollTop < start + trackHeight && !document.hidden;
      const settling = Math.abs(targetProgress - displayedProgress) > .0001;
      const progress = reduced || !visible || !settling ? targetProgress : displayedProgress + (targetProgress - displayedProgress) * (1 - Math.exp(-delta / 55));
      displayedProgress = progress;
      const motionProgress = reduced ? Number(progress >= .5) : progress;
      if (reduced || motionProgress >= .88) entranceProgress.current = 1;
      else if (visible) entranceProgress.current = clamp(entranceProgress.current + delta / 1400);
      const entering = entranceProgress.current < 1;
      const phoneProgress = Math.max(motionProgress, .88 - entranceProgress.current * .5);
      const phoneGather = smooth((phoneProgress - .38) / .5);
      const gather = smooth((motionProgress - .38) / .5);
      const rise = smooth(motionProgress / .38);
      const changed = progress !== previousProgress || visible !== previouslyVisible || sceneVersion !== drawnVersion || entranceProgress.current !== previousEntranceProgress;
      if (!reduced && visible && !entering && progress < .38) phase.current += delta * .0001;
      const spread = 1 - phoneGather;
      const mobile = width < 700;
      const baseScale = mobile ? Math.min(.79, width / 460) : Math.min(.92, height / 880);
      const revealedScale = Math.min(baseScale, height * .47 / 716, width * (mobile ? 1.75 : .95) / 1432);
      const orbitScale = baseScale + (revealedScale - baseScale) * rise;
      const focusHeight = mobile ? Math.max(0, focusBottom - focusTop) : height * .66;
      const focusY = mobile ? (focusTop + focusBottom) / 2 : height * .51;
      const scale = orbitScale * spread + Math.min(mobile ? .87 : 1.02, focusHeight / 582.4) * phoneGather;
      const radius = 410 * orbitScale * spread;
      const startY = introBottom + (mobile ? 80 : 64) + 716 * baseScale;
      const orbitY = startY + (height * .51 - startY) * rise;
      const entranceOffset = 410 * orbitScale * smooth(1 - entranceProgress.current);
      const centerY = (orbitY - entranceOffset) * (1 - gather) + focusY * gather;
      if (centerIcon.current && changed) {
        const iconFade = 1 - smooth(phoneGather / .55);
        const iconInView = centerY + 85 * orbitScale > 0 && centerY - 85 * orbitScale < height;
        centerIcon.current.style.transform = `translate(-50%, -50%) translate3d(0, ${centerY.toFixed(2)}px, 0) scale(${orbitScale.toFixed(4)})`;
        centerIcon.current.style.opacity = `${iconFade}`;
        centerIcon.current.style.visibility = iconFade < .01 ? `hidden` : `visible`;
        centerIcon.current.style.setProperty(`--icon-motion`, !reduced && visible && iconInView && iconFade > .01 ? `running` : `paused`);
      }
      deviceNodes.current.forEach((node, index) => {
        if (!node) return;
        const fade = index === 0 ? 1 : 1 - smooth((phoneProgress - .48) / .34);
        if (changed) node.style.opacity = `${fade}`;
        if (fade < .01 || !visible) {
          if (node.style.visibility !== `hidden`) node.style.visibility = `hidden`;
          return;
        }
        const angle = phase.current + index * Math.PI * 2 / orbitPhones.length;
        const turn = Math.atan2(Math.sin(angle), Math.cos(angle));
        const x = Math.sin(angle) * radius;
        const y = centerY - Math.cos(angle) * radius;
        const extent = 324 * scale + 40;
        const inView = y + extent > 0 && y - extent < height && x + extent > -width / 2 && x - extent < width / 2;
        const visibility = inView ? `visible` : `hidden`;
        if (node.style.visibility !== visibility) node.style.visibility = visibility;
        if (!inView) return;
        node.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${(turn * 180 / Math.PI * spread).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      });
      if (intro.current && changed) {
        setRevealGroup(intro.current, motionProgress <= .25 && visible);
        intro.current.style.opacity = `${1 - smooth(motionProgress / .25)}`;
        intro.current.style.transform = `translateY(${-progress * (reduced ? 0 : 90)}px)`;
        intro.current.style.visibility = motionProgress > .25 ? `hidden` : `visible`;
      }
      if (ending.current && changed) {
        setRevealGroup(ending.current, motionProgress >= .71 && visible);
        ending.current.style.opacity = `${smooth((motionProgress - .71) / .17)}`;
        ending.current.style.transform = `translateY(${(1 - gather) * (reduced ? 0 : 35)}px)`;
        ending.current.style.visibility = motionProgress < .71 ? `hidden` : `visible`;
      }
      if (changed) {
        const nextPhase = entering ? `enter` : progress < .38 ? `orbit` : progress < .88 ? `gather` : `focus`;
        if (scene.dataset.phase !== nextPhase) scene.dataset.phase = nextPhase;
        scene.style.setProperty(`--journey-progress`, `${progress}`);
      }
      if (!scene.dataset.ready) scene.dataset.ready = `true`;
      previousProgress = progress;
      previousEntranceProgress = entranceProgress.current;
      previouslyVisible = visible;
      drawnVersion = sceneVersion;
      if (!reduced && visible && (entering || progress < .38 || settling)) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame) { previousTime = performance.now(); frame = requestAnimationFrame(draw); } };
    const measure = () => {
      const headerHeight = `${header.current?.offsetHeight ?? 96}px`;
      if (scrollArea.style.getPropertyValue(`--header-height`) !== headerHeight) scrollArea.style.setProperty(`--header-height`, headerHeight);
      viewportHeight = scrollArea.clientHeight;
      trackHeight = track.offsetHeight;
      tickerHeight = ticker?.offsetHeight ?? 0;
      tickerTop = ticker?.offsetTop ?? track.offsetTop + track.offsetHeight;
      measureScene();
      start = track.offsetTop;
      distance = Math.max(1, trackHeight - height - stageInset);
      schedule();
    };
    const stopSparkScroll = () => {
      if (!sparkScroll.current) return;
      sparkScroll.current = null;
      delete scrollArea.dataset.sparkScroll;
      scrollArea.scrollTo({ top: scrollArea.scrollTop, behavior: `instant` });
      schedule();
    };
    const stopOnScrollKey = (event: KeyboardEvent) => {
      if ([` `, `Home`, `End`, `ArrowUp`, `ArrowDown`, `PageUp`, `PageDown`].includes(event.key)) stopSparkScroll();
    };
    const finishSparkScroll = () => {
      if (sparkScroll.current && Math.abs(scrollArea.scrollTop - sparkScroll.current.target) <= 1) stopSparkScroll();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(scene);
    observer.observe(scrollArea);
    if (ticker) observer.observe(ticker);
    if (focusAction) observer.observe(focusAction);
    if (focusHeading) observer.observe(focusHeading);
    if (intro.current) observer.observe(intro.current);
    if (header.current) observer.observe(header.current);
    scrollArea.addEventListener(`scroll`, schedule, { passive: true });
    scrollArea.addEventListener(`scrollend`, finishSparkScroll);
    scrollArea.addEventListener(`keydown`, stopOnScrollKey);
    scrollArea.addEventListener(`wheel`, stopSparkScroll, { passive: true });
    scrollArea.addEventListener(`touchstart`, stopSparkScroll, { passive: true });
    scrollArea.addEventListener(`pointerdown`, stopSparkScroll, { passive: true });
    document.addEventListener(`visibilitychange`, schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scrollArea.removeEventListener(`scroll`, schedule);
      scrollArea.removeEventListener(`scrollend`, finishSparkScroll);
      scrollArea.removeEventListener(`keydown`, stopOnScrollKey);
      scrollArea.removeEventListener(`wheel`, stopSparkScroll);
      scrollArea.removeEventListener(`touchstart`, stopSparkScroll);
      scrollArea.removeEventListener(`pointerdown`, stopSparkScroll);
      document.removeEventListener(`visibilitychange`, schedule);
    };
  }, [reduced, authenticated]);

  const goTo = (id: string) => {
    sparkScroll.current = null;
    if (page.current) delete page.current.dataset.sparkScroll;
    const target = page.current?.querySelector<HTMLElement>(`#${id}`);
    if (target) page.current?.scrollTo({ top: id === `top` ? 0 : target.offsetTop - (header.current?.offsetHeight ?? 96), behavior: reduced ? `instant` : `smooth` });
  };
  const begin = () => router.push(`/sign-in`);
  const findSpark = () => {
    const root = page.current;
    const ticker = root?.querySelector<HTMLElement>(`.mx-ticker`);
    if (!root || !ticker) return;
    const top = root.scrollTop + ticker.getBoundingClientRect().bottom - root.getBoundingClientRect().bottom;
    sparkScroll.current = reduced ? null : { start: root.scrollTop, target: Math.max(0, top) };
    if (!reduced) root.dataset.sparkScroll = `active`;
    root.scrollTo({ top: Math.max(0, top), behavior: reduced ? `instant` : `smooth` });
  };
  if (authenticated) return <Redirect href={state.session?.onboarded ? `/discover` : `/onboarding`} />;

  return <div ref={page} className={`mx-landing ${dark ? `mx-dark` : `mx-light`}`} style={{ '--motion-play': reduced ? `paused` : `running` } as CSSProperties}>
    <a className="mx-skip" href="#experience" onClick={event => { event.preventDefault(); goTo(`experience`); page.current?.querySelector<HTMLElement>(`#experience`)?.focus(); }}>Skip the animation</a>
    <header ref={header} className="mx-header"><LandingHeader onHome={() => goTo(`top`)} /></header>
    <main>
      <section ref={journey} id="top" className="mx-journey" aria-label="Meet MatchXD">
        <div ref={stage} className="mx-stage" data-phase="orbit">
          <div className="mx-stage-grain" aria-hidden="true" />
          <div ref={intro} className="mx-intro mx-reveal-group">
            <div className="mx-eyebrow mx-reveal-item"><span className="mx-tiny-spark" aria-hidden="true"><SymbolIcon name="spark" color="currentColor" size={24} /></span> PREMIUM FEATURES, REASONABLE PRICING</div>
            <h1 aria-label="You will love the cost of love."><span aria-hidden="true"><span className="mx-headline-line"><SplitText text="You" /> <SplitText text="will" dark start={1} /> <SplitText text="love" start={2} /></span><span className="mx-headline-line"><SplitText text="The" start={3} /> <SplitText text="cost" dark start={4} /> <br className="mx-mobile-break" /><SplitText text="of love" start={5} /><SplitText text="." dark start={7} /></span></span></h1>
            <p className="mx-reveal-item" style={{ '--reveal-delay': `180ms` } as CSSProperties}>Leaving you more time to</p>
            <SparkButton className="mx-pill mx-pill-black mx-pill-cream mx-reveal-item" revealDelay={300} onPress={findSpark} />
          </div>
          <div className="mx-orbit-scene" aria-hidden="true">
            <div ref={centerIcon} className="mx-orbit-icon"><div className="mx-orbit-icon-spin"><AppIcon size={120} /></div></div>
            {orbitPhones.map((phone, index) => <div key={index} ref={node => { deviceNodes.current[index] = node; }} className={`mx-device mx-device-${index}`} data-phone={index}>
              <PhonePreview width={280} model={phone.model} screen={phone.screen} person={phone.person} />
            </div>)}
          </div>
          <div ref={ending} className="mx-focus-copy mx-reveal-group">
            <div className="mx-focus-left"><span className="mx-eyebrow mx-reveal-item">A WORLD OF POSSIBILITY.</span><h2><SplitText text="All it takes" /><br /> <SplitText text="is" start={3} /> <em><SplitText text="one." start={4} /></em></h2><p className="mx-reveal-item">One shared interest.<br />One first message.<br />One very good feeling.</p></div>
            <div className="mx-focus-right"><div className="mx-focus-symbol mx-reveal-item"><ConnectedX size={58} white /></div><h3 className="mx-reveal-item">Your people.<br />Your pace.</h3><p className="mx-reveal-item">Discover, connect, and be yourself.<br />We’ll leave the chemistry to you.</p><button className="mx-pill mx-pill-black mx-pill-compact mx-reveal-item" onClick={begin}>Let’s meet someone <span className="mx-pill-icon" aria-hidden="true"><Icon name="arrow-up-right" color="currentColor" size={23} /></span></button></div>
          </div>
          <div className="mx-progress" aria-hidden="true" />
        </div>
      </section>
      <FeatureTicker />
      <section id="experience" className="mx-experience mx-section" tabIndex={-1}>
        <div className="mx-section-heading"><div><span className="mx-eyebrow mx-reveal mx-reveal-item">THOUGHTFUL BY DESIGN</span><h2 className="mx-reveal"><SplitText text="Good chemistry." /><br /><span><SplitText text="Better features." start={2} /></span></h2></div><WordCircle /><p className="mx-reveal mx-reveal-item">A dating app should make room for connection. So we made the good stuff part of the experience.</p></div>
        <div className="mx-features">
          <article className="mx-feature mx-feature-discover"><span className="mx-feature-number mx-reveal mx-reveal-item">01 / DISCOVER</span><div className="mx-feature-art mx-interest-art mx-reveal mx-reveal-item" aria-hidden="true"><span>Coffee walks</span><span>One more chapter</span><span>Bad dancing</span><span>Good company</span></div><h3 className="mx-reveal"><SplitText text="More you." /><br /><SplitText text="Less guesswork." start={2} /></h3><p className="mx-reveal mx-reveal-item">Bring your interests, your story, and your kind of energy. Find the things you have in common.</p><button className="mx-pill mx-pill-black mx-pill-compact mx-reveal mx-reveal-item" onClick={begin}>Meet your people <span className="mx-pill-icon" aria-hidden="true"><Icon name="arrow-up-right" color="currentColor" size={23} /></span></button></article>
          <article className="mx-feature mx-feature-mxo"><span className="mx-feature-number mx-reveal mx-reveal-item">02 / YOUR WINGMATE</span><div className="mx-feature-art mx-chat-art mx-reveal mx-reveal-item" aria-hidden="true"><div>Hiking. Coffee. Someone kind.</div><div><ConnectedX size={24} /> I think you’ll like these people.</div></div><h3 className="mx-reveal"><SplitText text="A little help" /><br /><SplitText text="finding your type." start={3} /></h3><p className="mx-reveal mx-reveal-item">Tell MXO what matters to you and explore profiles with shared interests. Your own words, your own way.</p><button className="mx-pill mx-pill-black mx-pill-compact mx-reveal mx-reveal-item" onClick={begin}>Meet MXO <span className="mx-pill-icon" aria-hidden="true"><Icon name="arrow-up-right" color="currentColor" size={23} /></span></button></article>
          <article className="mx-feature mx-feature-privacy"><span className="mx-feature-number mx-reveal mx-reveal-item">03 / ON YOUR TERMS</span><div className="mx-feature-art mx-privacy-art mx-reveal mx-reveal-item" aria-hidden="true"><div><Icon name="eye-off" size={42} color="#FFFFFF" /></div><span>Your space. Protected.</span></div><h3 className="mx-reveal"><SplitText text="Keep your" /><br /><SplitText text="peace of mind." start={2} /></h3><p className="mx-reveal mx-reveal-item">Free blocking and reporting. Links you choose to share. And incognito with MXD when you want more privacy.</p><button className="mx-pill mx-pill-pink mx-pill-compact mx-reveal mx-reveal-item" onClick={() => privacy.current?.showModal()}>Your privacy choices <span className="mx-pill-icon" aria-hidden="true"><Icon name="arrow-up-right" color="currentColor" size={23} /></span></button></article>
        </div>
      </section>
      <section id="plans" className="mx-pricing mx-section">
        <div className="mx-pricing-lead"><div className="mx-big-number"><CountUp value={PLANS.free.daily} /><span className="mx-number-caption mx-reveal mx-reveal-item"><XoCopy size={18}>XOs / DAY</XoCopy></span></div><div><span className="mx-eyebrow mx-reveal mx-reveal-item">A FRESH START. EVERY DAY.</span><h2 className="mx-reveal"><SplitText text="Premium feeling." /><br /><SplitText text="Down-to-earth pricing." start={2} /></h2><p className="mx-reveal mx-reveal-item"><XoCopy size={16}>Start with {PLANS.free.daily} free XOs every day. Send one first message for {ECONOMY.costs.firstMessage} XO before matching. Once you match, chat freely with no token cost. Each plan adds more daily rewinds, Super Likes, and first messages.</XoCopy></p><button className="mx-pill mx-pill-black mx-reveal mx-reveal-item" onClick={begin}>Start with free <span className="mx-pill-icon" aria-hidden="true"><Icon name="arrow-up-right" color="currentColor" size={23} /></span></button></div></div>
        <CommunityStats placeholders />
        <PricingComparison instructions={false}><div className="mx-plan-line">{PLAN_ORDER.map((id, index) => <article key={id} onClick={event => { if (!(event.target instanceof Element) || !event.target.closest(`button`)) begin(); }} className="mx-plan mx-reveal mx-reveal-item" style={{ '--reveal-delay': `${index * 80}ms` } as CSSProperties}><span>{PLANS[id].name}</span><strong>{PLANS[id].price ? `$${(PLANS[id].price / 100).toFixed(2)}` : `$0`}<small>/ month</small></strong><span><XoCopy size={14}>{PLANS[id].daily} XOs every day</XoCopy></span><small className="mx-plan-breakdown" aria-label={`Daily grant breakdown: ${PLAN_ORDER.slice(0, index + 1).map(tier => `${DAILY_GRANTS[tier]} from ${PLANS[tier].name}`).join(` plus `)} = ${PLANS[id].daily} XOs`}><span>Daily breakdown</span>{PLAN_ORDER.slice(0, index + 1).map((tier, tierIndex) => <span key={tier}>{tierIndex ? `+ ` : ``}{DAILY_GRANTS[tier]} {PLANS[tier].name}</span>)}</small><PlanBenefits plan={id} /><button className="mx-pill mx-pill-black mx-pill-compact mx-plan-cta" onClick={begin} aria-label={id === `free` ? `Start free with the Free plan` : `Start free trial of the ${PLANS[id].name} plan`}>{id === `free` ? `Start free` : `Start free trial`} <span className="mx-pill-icon" aria-hidden="true"><Icon name="arrow-up-right" color="currentColor" size={23} /></span></button></article>)}</div></PricingComparison>
      </section>
    </main>
    <footer className="mx-footer">
      <div className="mx-footer-invite"><span className="mx-eyebrow mx-reveal mx-reveal-item">TWO PATHS. ONE CONNECTION.</span><h2 className="mx-reveal"><SplitText text="Your next" /> <em><SplitText text="hello" start={2} /></em><br /><SplitText text="starts here." start={3} /></h2><SparkButton className="mx-pill mx-pill-pink mx-pill-cream mx-reveal mx-reveal-item" onPress={begin} /><p className="mx-reveal mx-reveal-item">On your phone. On your desktop. On your terms.</p></div>
      <div className="mx-footer-main"><div className="mx-footer-brand mx-reveal mx-reveal-item"><BrandMark size={37} color="#FFFFFF" /><p>Real people.<br />Brighter connections.</p></div><nav aria-label="Footer"><button className="mx-reveal mx-reveal-item" onClick={() => goTo(`experience`)}>The experience</button><button className="mx-reveal mx-reveal-item" onClick={() => goTo(`plans`)}>Simple pricing</button><button className="mx-reveal mx-reveal-item" onClick={() => privacy.current?.showModal()}>Privacy & safety</button><button className="mx-reveal mx-reveal-item" onClick={begin}>Meet your people <span className="mx-inline-icon" aria-hidden="true"><Icon name="arrow-up-right" color="currentColor" size={14} /></span></button></nav><div className="mx-footer-availability"><span className="mx-reveal mx-reveal-item"><Icon name="smartphone" color="#FF8C9D" size={19} /> MADE FOR EVERY HELLO</span><p className="mx-reveal mx-reveal-item">Your next connection.<br />Wherever life takes you.</p><button className="mx-back-top mx-reveal mx-reveal-item" onClick={() => goTo(`top`)}><span>Back to the top <span className="mx-inline-icon" aria-hidden="true"><Icon name="arrow-up" color="currentColor" size={14} /></span></span></button></div></div>
      <div className="mx-footer-bottom"><span className="mx-reveal mx-reveal-item">© {new Date().getFullYear()} MatchXD</span><span className="mx-reveal mx-reveal-item">Designed by <a href="https://piratechs.com" target="_blank" rel="noopener noreferrer">Piratechs <span className="mx-inline-icon" aria-hidden="true"><Icon name="arrow-up-right" color="currentColor" size={12} /></span></a></span><span className="mx-reveal mx-reveal-item">Made with a little spark <b aria-hidden="true"><SymbolIcon name="spark" color="currentColor" size={18} /></b></span></div>
    </footer>
    <dialog ref={privacy} className="mx-privacy-dialog" aria-labelledby="privacy-heading" onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}><button className="mx-dialog-close" aria-label="Close privacy information" onClick={() => privacy.current?.close()}><Icon name="x" color="currentColor" size={24} /></button><span className="mx-eyebrow">YOUR CHOICES COME FIRST</span><h2 id="privacy-heading">A little more<br />peace of mind.</h2><p>Choose how you connect, what you share, and who can find you.</p><ul><li><XoCopy size={15}>Blocking and reporting never cost XOs.</XoCopy></li><li>Profiler includes only opt-in profiles and links people choose to share.</li><li>MXD incognito limits your visibility to people you like.</li><li>Manage your information and delete your account from Settings.</li></ul><p>Make room for connection at your own pace. You can change your preferences any time.</p><button className="mx-pill mx-pill-black" onClick={() => privacy.current?.close()}>Got it <span className="mx-pill-icon" aria-hidden="true"><Icon name="check" color="currentColor" size={23} /></span></button></dialog>
  </div>;
};
