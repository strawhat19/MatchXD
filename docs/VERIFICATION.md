# MatchXD Prototype Verification

Date: September 10, 2026. Status: **Complete for the executed local prototype verification described below**.

This record distinguishes source coverage, executed checks, and behavior that has not been exercised. It covers the first local prototype from [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), including the user's Coral Classic/dark-mode choice, mobile app-icon header, and connected-X pass button. It is not a production-readiness certification.

## Messaging And Daily Limits Update — September 11, 2026

The current engine replaces the earlier per-message debit with one paid introduction per recipient before a match and free matched chat. Rewinds, Super Likes, and introductions have independent daily caps of 1/3/5/10 for Free/M/MX/MXD. Contact history and quota usage persist across reloads; daily reset restores allowances but never permits a second pending introduction to the same person. Legacy snapshot and live-state normalization preserves existing balances and activity.

Executed with the bundled Node runtime: `node --import tsx --test src/domain/*.test.ts` passed all 26 tests; `node node_modules/typescript/bin/tsc --noEmit` passed. New regressions cover zero-balance matched chat, pending and reciprocal introductions, retries, caps, upgrades, purchases, daily rollover, block/unmatch/deletion history, migration, invalid saved fields, and rewinding an earlier pass after an introduction. Pricing, member UI, hero punctuation, and placeholder/token counters were source-reviewed. No browser, native simulator, build, or export checks were run for this update. Earlier browser message-debit observations below describe the previous policy.

## Executed Checks

| Check | Observed Result | Scope |
| --- | --- | --- |
| `npm test` with bundled Node 24.19.0 | Passed: 15 tests, 0 failures | Domain actions, wallet, visibility, IDs, and snapshot handling; not device UI |
| `npm run typecheck` with bundled Node 24.19.0 | Final pass, exit 0 | Includes the final contrast tokens/UI, preserved onboarding fields, and 320px Discover header corrections |
| `npm run lint` with bundled Node 24.19.0 | Final pass, exit 0, no warnings | Configured source lint rules after all final source corrections |
| `expo install --check` | Dependencies reported up to date | Expo package compatibility |
| `npx expo export --platform all --output-dir .local-tools/export` with bundled Node 24.19.0 | Final pass, exit 0: web 1,225 modules, iOS 1,520, Android 1,896 | Includes all final source corrections; web JavaScript plus iOS/Android Hermes bundles; does not install or run native apps |
| Browser adult onboarding | Verified by the implementation session | Underage entry rejected; valid adult entry reached the app |
| Browser like → match | Verified by the implementation session | Mutual demo match created and like charged once |
| Browser send message | Verified by the implementation session | Outgoing message and labeled demo reply, single message debit |
| Browser reload persistence | Verified by the implementation session | Local activity and balances survived reload |
| Responsive theme review | Verified by the implementation session | Light/dark layouts and mobile/desktop navigation reviewed |
| Browser plan upgrade | Verified by the implementation session | Simulated plan activation and allowance difference applied |
| Browser wallet purchase, reward, cancellation, history | Verified by the implementation session | $1 mock checkout added 10 purchased XOs separately from daily XOs; reward added 5 daily XOs; cancellation retained the balance and scheduled period-end expiry; ledger reflected events |
| Browser MXO and Profiler | Verified by the implementation session | Coffee/hiking request charged 1 XO and recommended Sofia with demo labeling; directory query Maya returned exactly one result |
| Browser profile edit | Verified by the implementation session | Bio, second photo, photo reorder, sample media, directory opt-in, and HTTPS link saved and persisted |
| Browser sample media | Video loaded without error (`readyState=4`, duration 8 seconds); voice Play invoked | Audible output was not verified in the headless browser |
| Browser preferences and incognito | Verified by the implementation session | Excluded name Maya removed that profile from Discover; MXD incognito setting saved |
| Browser report and block | Verified by the implementation session | Sofia report saved locally; block immediately made direct profile unavailable, removed match and MXO recommendation, and cost 0 XOs |
| Mobile viewport review | Verified at 390 × 844 | No horizontal overflow; discovery actions remained above bottom navigation after layout correction |
| Small-phone viewport review | Verified at 320 × 700 after header correction | Filters button fully visible; screenshot reviewed with no horizontal overflow |
| Browser horizontal gestures and action buttons | Verified by the implementation session | Controlled right drag liked and left drag passed for exactly 1 XO each after animation completion; rewind spent 1 XO and restored the card; super-like spent 1 XO and created the Sofia match |
| Browser Reset Demo Data | Verified after confirmation | Returned to landing with no session, Free plan, 33 daily / 0 purchased XOs, and six seeded profiles |
| Browser Delete Local Account | Verified after a fresh session and actions | Returned to landing with no session, 33 daily / 0 purchased XOs, and zero swipes |
| Desktop viewport review | Verified at 1440 × 1000 in light and dark themes | Screenshots reviewed with no horizontal overflow |
| Browser unblock and role switch | Verified by the implementation session | Unblock succeeded; sign-out and Demo Owner entry enforced the DOB gate; saved bio remained intact on re-entry |
| Browser owner CRUD | Verified by the implementation session | Created profile #8 with matching app-owned ID, edited its bio, deleted only the test profile; next profile number remained 9 |
| Browser report resolution | Verified by the implementation session | Mark Resolved changed the open-report count from 1 to 0; dashboard had no mobile horizontal overflow |
| Clean browser reload diagnostics | No application errors or warnings observed | Console contained React development information only; browser error list was empty |
| Source text-contrast recheck | Corrected token combinations exceed 4.5:1 | Ratios documented below; this is not a full accessibility audit |

The browser rows record observations reported by the coordinating agent during this implementation session. They do not claim every route, breakpoint, or native platform was tested. This completed record is a bounded verification report; cases not exercised are identified below.

The final export artifacts were verified in the git-ignored `.local-tools/export` directory after the contrast, onboarding, and narrow-header corrections. The unchanged domain retained its earlier 15-test passing result; those tests were not repeated for the final UI corrections. The only export warning concerned `NO_COLOR` being ignored because `FORCE_COLOR` was set; no application or compiler warning was reported by that command.

## Requirement Coverage Audit

| Planned Area | Current Source Evidence | Verified Coverage / Not Exercised |
| --- | --- | --- |
| Coral Classic, dark/light/system themes, Poppins, mobile icon and branded pass X | `src/theme/`, `src/components/BrandMark.tsx`, `AppShell.tsx`, `src/features/discovery/DiscoverScreen.tsx` | Light/dark responsive views and key text contrast checked; System appearance and assistive-setting review not exercised |
| Landing, loading, sign-in previews, 18+ onboarding | `src/features/auth/`, `src/app/_layout.tsx` | Browser member/owner DOB gates, role switch and preserved profile details passed |
| Discover pass/like/super-like/rewind, profile details, match reveal, empty deck | `src/features/discovery/DiscoverScreen.tsx`, `src/domain/transition.ts` | Browser horizontal like/pass gestures, single debits, super-like match and rewind restoration passed; empty-deck and insufficient-balance UI not individually exercised |
| Matches, conversations, scripted replies, unmatch/block/report | `src/features/messaging/`, shared visibility guard and domain actions | Browser message/report/block and direct blocked-profile check passed; browser unmatch and blocked direct conversation URL not exercised |
| Profile editing, photo order, interests/hobbies, attributes, media, validation | `src/features/profile/`, bundled images and `assets/media/intro.wav` / `intro.mp4` | Browser save/persistence, photo order and video loading passed; sound output and native pickers unverified |
| Age/distance and optional multiselect preferences, Any vs Not Provided, paid gates | `src/features/preferences/PreferencesScreen.tsx`, `src/domain/matching.ts` | Domain gates and browser excluded-name save covered; all optional criteria and disabled-filter UI not individually exercised |
| Plan comparison, checkout simulation, cancellation, packs, ledger, ad rewards | `src/features/wallet/WalletScreen.tsx`, `src/config/`, domain tests | Browser upgrade, purchase, reward, cancellation and ledger passed; reward cap covered by domain test |
| MXO conversational local rules, stated criteria and explanation | `src/features/mxo/MxoScreen.tsx`, `src/services/local/mxo.ts` | Browser recommendations, debit and removal after block passed; insufficient-balance UI not exercised |
| Opt-in Profiler, name search, user-added HTTPS links, removal and visibility | `src/features/profiler/ProfilerScreen.tsx`, profile editor, shared visibility | Browser search, opt-in and saved link passed; link removal and blocked-profile directory exclusion not individually exercised |
| Settings, notifications as preferences, discovery privacy, incognito, blocklist, reset/delete | `src/features/settings/SettingsScreen.tsx`, domain tests | Browser incognito, unblock, confirmed reset and confirmed local account deletion passed |
| Owner create/edit/delete, reports, counts, storage, mobile cards/desktop rows | `src/features/dashboard/DashboardScreen.tsx`, owner-guarded domain actions | Domain authorization/deletion cleanup and browser CRUD, numbering, report resolution, mobile layout passed |
| Local persistence, validated snapshot, recovery, app-owned numbering | `src/storage/`, `src/state/AppProvider.tsx`, `src/domain/identity.ts` | Domain serialization/corruption tests and browser reload passed; native persistence and storage-full UI not exercised |
| Configuration and handoff instructions | `src/config/`, `README.md`, `scripts/start-local.ps1` | Windows launcher source exists; physical-phone and fresh Mac setup not executed |

The source audit found no missing planned screen area. Current implementation is local by design: all profile media and people are fictional, replies are scripted, checkout collects no card, ad rewards earn no revenue, and no remote notification is sent. Profiler does not crawl the web. Owner mode is explicitly a local demo role.

## Measured Fixes And Known Limits

1. **Primary text contrast corrected.** The initial source audit found normal-size muted/accent/button text below 4.5:1. The implementation now separates `accentText` and `onAccent` from the coral fill, including chat bubbles. Recalculated ratios: light muted on raised 4.96:1; light accent text on pale 5.62:1; light/dark primary labels 5.28:1/5.75:1; dark accent text on pale 5.21:1. This resolves those measured combinations, not every possible image overlay or accessibility condition.
2. **Physical iOS/Android checks have not run.** Native gesture/haptic behavior, media permissions and cached files, keyboard avoidance, safe areas, text enlargement, and screen-reader navigation remain unverified. Shared React Native source and successful bundling are not physical-device evidence.
3. **Reduced-motion and full keyboard navigation were not exercised.** Animation and labeled button alternatives exist, but their complete behavior with assistive settings has not been established by this audit.
4. **Media persistence is intentionally limited.** Browser uploads are session previews; blob/data URLs are removed when saving snapshots. Native uploads reference cache that the OS may clear. Bundled samples are durable; this is not remote media storage.
5. **Local state is not a trusted security or billing system.** Device time, wallet amounts, demo roles, and data can be edited locally. Real authorization, moderation, payment verification, and age enforcement require the later connected phase.

## Dependency Audit

The implementation session observed **14 moderate dependency findings, zero high, and zero critical**. The 14 package findings trace to two advisories rather than 14 separate root vulnerabilities:

- `decode-uri-component@0.2.2`, through `query-string@7.1.3` / `expo-router@57.0.20`: malformed URL-query denial of service, [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr). This is on a runtime URL-parsing path and remains unresolved.
- `uuid@7.0.3`, through `xcode@3.0.1` / the Expo toolchain: buffer bounds in affected UUID APIs, [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq). The inspected xcode package uses `v4()`, not the reported v3/v5/v6 APIs; that limits the observed path but does not erase the audit finding.

`npm audit fix --dry-run` left the findings unchanged. The force proposal involved incompatible Expo 46 / Router 5 / Splash Screen 55 changes, so no force downgrade or incompatible dependency replacement was applied. Reassess with compatible upstream releases before public deployment. Counts reflect this installation and may change as advisories update.

## Physical Device Follow-Up And Later Work

Before distributing a native build, exercise the marked native behaviors on physical iOS/Android devices, including audible media playback, pickers, keyboard behavior, gestures/haptics, accessibility settings, and persistence after restarting the app. A fresh Mac setup and Expo Go LAN/tunnel connection were not exercised in this session.

Live authentication, backend synchronization, production AI, payments, remote push, standalone builds, and store publication are later-phase work and were not performed. The moderate dependency findings above remain documented limitations of this local prototype.
