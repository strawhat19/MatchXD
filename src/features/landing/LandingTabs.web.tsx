import './LandingTabs.css';
import { LANDING_VIEWS, LANDING_VIEW_LABELS, type LandingTabsProps } from './LandingTabs.types';

export const LandingTabs = ({ value, onChange, scope }: LandingTabsProps) => <div className="mx-landing-tabs" role="tablist" aria-label={`${scope === `features` ? `Features` : `Pricing`} view`}>
  {LANDING_VIEWS.map(view => <button key={view} type="button" role="tab" id={`${scope}-tab-${view}`} aria-controls={`${scope}-panel`} aria-selected={value === view} tabIndex={value === view ? 0 : -1} onClick={() => onChange(view)} onKeyDown={event => {
    if (![ `ArrowLeft`, `ArrowRight`, `Home`, `End` ].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === `Home` ? `beta` : event.key === `End` ? `plans` : view === `beta` ? `plans` : `beta`;
    onChange(next);
    document.getElementById(`${scope}-tab-${next}`)?.focus();
  }}>{LANDING_VIEW_LABELS[view]}</button>)}
</div>;
