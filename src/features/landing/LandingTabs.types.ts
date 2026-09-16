export type LandingView = `beta` | `plans`;
export type LandingTabsProps = {
  value: LandingView;
  onChange: (value: LandingView) => void;
  scope: `features` | `pricing`;
};
export const LANDING_VIEWS: readonly LandingView[] = [`beta`, `plans`];
export const LANDING_VIEW_LABELS: Record<LandingView, string> = { beta: `Beta`, plans: `Plans` };
