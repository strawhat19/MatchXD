# Development

[MatchXD](../README.md) · [Getting Started](GETTING_STARTED.md) · [XO Economy](XO_ECONOMY.md) · [Deployment](DEPLOYMENT.md)

MatchXD uses Expo Router, React Native, and TypeScript. Follow [Getting Started](GETTING_STARTED.md) for local prerequisites and startup commands. The current app uses local demo state; changing a feature flag alone does not implement an external integration.

## Project Map And Configuration

Paths below are relative to the repository root.

| Path | Purpose |
| --- | --- |
| [src/app/](../src/app/) | Thin Expo Router route files and layouts |
| [src/features/](../src/features/) | Discovery, onboarding, profiles, messaging, wallet, MXO, directory, settings, and dashboard |
| [src/components/](../src/components/) | Responsive shell, brand mark, photos, and shared UI |
| [src/theme/](../src/theme/) | Color/typography tokens and theme selection |
| [src/config/app.ts](../src/config/app.ts) | Brand, minimum age, interests, and optional attribute choices |
| [src/config/plans.ts](../src/config/plans.ts) | Tier prices, cumulative XO allowances, separate daily action limits, and feature access |
| [src/config/economy.ts](../src/config/economy.ts) | Action costs, packs, reward limits, timezone, and free matched messaging |
| [src/config/features.ts](../src/config/features.ts) | Explicit availability of external integrations |
| [src/domain/](../src/domain/) | Validated actions, accounting, visibility, matching, IDs, and focused tests |
| [src/state/AppProvider.tsx](../src/state/AppProvider.tsx) | Shared local state, action dispatch, and persistence notices |
| [src/storage/](../src/storage/) | Native/web storage adapters, snapshot validation, and serialization |
| [src/data/demoProfiles.ts](../src/data/demoProfiles.ts) | Seeded profiles, conversations, and initial state |
| [src/services/](../src/services/) | Service contracts and local MXO rules |
| [assets/](../assets/) | App assets, fictional portraits, and sample media |
| [app.config.ts](../app.config.ts) | Expo name, platform IDs, icons, and plugins |
| [docs/IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Original agreed scope and later integration plan |

The [XO Economy](XO_ECONOMY.md) explains plan allowances, action costs, and reset behavior. [Demo Guide](DEMO_GUIDE.md) describes local persistence and media limitations. Backend, authentication, payment, and native distribution work is outlined in [Deployment](DEPLOYMENT.md).

## Checks

Run these from the repository root in a terminal using supported Node:

```powershell
npm run typecheck
npm test
npm run lint
```

These commands are defined in [package.json](../package.json). The test command runs the focused tests in `src/domain/*.test.ts`, covering adult date validation, single-charge swipes, replay protection, wallet math, midnight/DST reset, upgrade/cancellation behavior, visibility, safety actions, owner guards, and snapshot recovery. Coverage also includes free matched chat, paid first messages, separate daily action caps, retained introduction history, and legacy-state migration.

Domain tests do not prove physical iPhone/Android behavior. Verify device gestures, media pickers, keyboard behavior, and accessibility on actual target devices before release. See [Verification](VERIFICATION.md) for executed checks and known limitations.

For static web export and preview commands, see [Deployment](DEPLOYMENT.md).
