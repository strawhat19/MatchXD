# MatchXD Implementation Plan

## Implementation Status — September 10, 2026

The first local prototype has now been implemented using Coral Classic with the After Hours-inspired dark palette. Mobile headers use the app icon, and the pass action uses the connected-X mark. The original planning document below is preserved as the agreed scope; its statements about work not yet started describe the planning checkpoint, not the current repository.

All planned screen areas now have routes and local behavior. The application uses fictional profiles, local persistence, and explicitly simulated external services. See [README](../README.md) for startup and usage, and [Verification](VERIFICATION.md) for the completed local checks, dependency findings, and unverified device behavior. This is not a production release or a deployed dating service. Backend connections, real authentication, live payments/AI/notifications, and store distribution remain the later phases described below.

---

Planning date: September 10, 2026. This document proposes the implementation; no application code, accounts, payments, or deployment have been created.

## Agreed Direction

- Mobile first, with an intentionally designed desktop layout.
- One shared iOS, Android, and web codebase wherever practical.
- United States first, with USD pricing.
- Profiler is an opt-in directory of public links supplied by users.
- First implementation is local only, with sample profiles and simulated external services.
- MatchXDv1.png is the visual reference: coral/red, soft pink, charcoal, white, and the connected-X symbol.
- Keep the existing README edit and concept image. Expand README during implementation, preserving its title.

## Recommended Stack

Use Expo, React Native, TypeScript, and Expo Router. This provides shared routing and most shared interface code across all three platforms. Keep a small number of platform-specific files for storage, payments, notifications, and browser-specific presentation. This is one repository, not a promise that every platform capability uses identical code. [Expo Router](https://docs.expo.dev/router/introduction/)

Use typed theme tokens and React Native StyleSheet for shared styling. SCSS does not style native views directly, so it should only be added if a later web-only surface needs it. Use Gesture Handler and Reanimated for swipes, expo-haptics for supported devices, expo-image for photos, and a small state store for the local session. Install package versions compatible with the selected stable Expo SDK. [React Native styling](https://reactnative.dev/docs/style), [Expo haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)

Use browser localStorage on web and AsyncStorage on mobile through the same asynchronous storage interface. Persist a versioned snapshot and support migrations, recovery from invalid data, and Reset Demo Data. Store media as assets or file references, not large base64 strings in localStorage. Local data remains specific to that browser or phone; cross-device synchronization starts with the backend. AsyncStorage is unencrypted and is suitable here for demo data, not sensitive identity documents or production credentials. [AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/)

Recommend Supabase/PostgreSQL for the later backend. Matches, conversations, reciprocal blocking, wallet transactions, and admin reporting fit relational data well. Supabase provides Auth, Storage, Realtime, row-level security, and PostGIS for distance queries. This is an architectural recommendation; Firebase remains possible, but using both initially would add unnecessary complexity. No backend SDK or credentials are needed in the local version. [Supabase database](https://supabase.com/docs/guides/database/overview), [PostGIS](https://supabase.com/docs/guides/database/extensions/postgis)

## Visual Design

Use Poppins as the initial typeface, with strong headings, readable body text, and restrained font weights. Build around large photographs, a compact connected-X brand mark, coral actions, and clear charcoal text. Use white surfaces in light mode and deep charcoal surfaces in dark mode; support Light, Dark, and System settings.

On phones, prioritize the discovery card and thumb-accessible actions with bottom navigation. On desktop, use side navigation and additional space for profile details and conversations rather than stretching the phone layout. Tablet layouts bridge those two forms.

Keep animation short and purposeful: swipe movement, match reveals, bottom sheets, and brief transitions. Respect reduced motion, accessible contrast, text enlargement, keyboard navigation, safe areas, and screen readers. Provide buttons as alternatives to swiping. Avoid heavy continuous background effects and forced splash-screen delays.

Use realistic fictional adult sample profiles, visibly identified as demo content. Keep their photos local for reliable previews. Do not imply that sample people, matches, messages, or verification badges represent real users.

## Screens and Local Behavior

| Area | First local implementation |
| --- | --- |
| Landing and startup | Brand introduction, concise value proposition, entry into the demo, actual loading states, and clearly unavailable store links until listings exist |
| Sign-in and onboarding | Explicit demo access; previews of future Google, Apple, Facebook, and phone sign-in; date-of-birth check for 18+; name, photos, bio, interests, hobbies, and location selection without prompted profile questions |
| Discover | Swipe or tap to pass, like, and super-like; rewind; expand profiles; visible XO balance; match demo; filter and exhausted-deck states |
| Matches and messages | Local matches, conversation list, message entry, simulated replies identified as demo behavior, unmatch, block, and report |
| Profile and edit | Photo order, description, interests, hobbies, optional attributes, voice/video sample media, profile preview, and save validation |
| Preferences | Age and distance, optional multiselect criteria, and clear handling of unprovided information |
| Wallet and plans | Free/M/MX/MXD comparison, simulated upgrade and cancellation, XO packs, ledger, insufficient-balance state, and demo ad rewards |
| MXO | Conversational interface that filters demo profiles using explicitly stated preferences and shows why a profile fits; local responses are labeled demo, with no live AI request |
| Profiler | Search opt-in directory entries by name; show only user-added public links; allow removal and visibility control; no external crawling or claims of identity verification |
| Settings and privacy | Light/dark/system, notification choices, blocklist, discovery visibility, MXD incognito, local account deletion, and demo reset |
| Owner dashboard | Demo Owner mode; create/edit/delete sample profiles, review demo reports, see local activity and storage status; mobile-friendly cards and desktop tables |

The dashboard must label local counts and simulated service states honestly. It cannot measure a deployed application's health before a backend exists. Deleting a profile should also handle its local matches, messages, directory entry, and discovery state consistently.

All external services are represented by explicit demo behavior or availability states. Google/phone sign-in will not actually authenticate; checkout will not collect card details; ads will not earn revenue; notification toggles will not send email, SMS, or remote push.

## Preferences and Visibility Rules

Support optional profile attributes and multiselect preferences for race/ethnicity, diet, gender, salary range, politics, religion, height, and presence of voice/video introductions. Interpret the brief's repeated “gender preferences” beside politics as political preferences. Interpret voice/video preferences as whether an introduction is present; do not infer identity traits from a voice or image.

Default preferences to no restriction. Distinguish “Any” from “Not Provided” in the data so missing information is not treated as a false match. Paid filters must have clear labels. Providing an attribute and filtering by it are separate controls: proposed gating applies to the advanced preference capability, not basic profile editing. Race/ethnicity preferences start with M; salary and height preferences start with MX; incognito starts with MXD.

Block by stable profile ID in both directions, including discovery, conversations, Profiler, and MXO recommendations. A saved name exclusion is only a personal filter; a name cannot reliably identify and block every account belonging to a person. Incognito makes the user's profile visible to other members only if the user has liked them. Apply this rule to discovery, direct profile links, search, Profiler, MXO, and recommendations, with blocks always taking precedence. Authorized moderation access remains separate from member visibility.

Use approximate city/distance display rather than exposing exact coordinates. Manual city entry can work without a location provider; real device location is optional and requested only when used. Broad location search/geocoding is a later integration.

Keep height self-reported initially. An ID may contain a recorded height, but it does not reliably prove current height. Any later document verification requires a separately designed provider flow; do not collect driver's licenses in localStorage or create a misleading “Verified Height” badge.

## Central XO and Plan Configuration

Store monetary values in integer cents and XO values in integers. Derive the following totals from the tier configuration instead of duplicating totals throughout the UI.

| Plan | Monthly Price | Daily Grant | Included Access |
| --- | ---: | ---: | --- |
| Free | $0 | 33 | Core discovery and messaging |
| M | $3.33 | 88 = 33 + 55 | Free capabilities and M preferences |
| MX | $5.55 | 154 = 33 + 55 + 66 | M capabilities and MX preferences |
| MXD | $11.11 | 253 = 33 + 55 + 66 + 99 | MX capabilities and incognito |

Current rules, adjustable in central configuration:

- Pass/swipe: 1 XO; like: 1; Super Like: 1; rewind: 1. A right swipe is one like operation and costs 1 total, never 2.
- Matched messages are free and unlimited. A first message to an unmatched person costs 1 XO, only once per recipient until matching. Daily resets do not allow another introduction to that person; wait for a mutual match before sending more.
- Rewinds, Super Likes, and first messages have separate daily caps: Free 1 of each, M 3 of each, MX 5 of each, MXD 10 of each. These initial caps live in `PLAN_LIMITS`; each capped action still costs 1 XO. Purchased XOs do not bypass caps.
- An MXO request costs 1 XO initially. Do not also charge it as an ordinary sent message. Make its cost independently configurable before connecting a paid AI service.
- 10 purchased XOs per $1. Keep this exchange rate while offering larger packs as an option.
- Daily XO allowances and action limits reset at midnight America/New_York; show the next reset time. Unused actions do not roll over. Reopening after several days grants the current day's allowance, not accumulated missed grants.
- Unused daily grants expire at reset. Purchased XOs are separate and do not expire. Spend daily grants before purchased XOs.
- Midday upgrades grant only the difference between daily XO entitlements. Actions already used count toward the new tier's caps; upgrades do not reset usage. Canceling retains paid access until the simulated billing period ends. Prevent repeated upgrade/downgrade grants within a day.
- Proposed demo ad reward: 5 XOs, maximum 3 rewards per day, added to the daily bucket. Both values are configurable and are not an estimate of actual ad revenue.
- Rewind is a new operation and does not refund the original swipe. Failed operations do not consume XOs. Disable repeat submissions and record operation IDs to prevent duplicate debits.
- Blocking, reporting, unmatching, deleting an account, and changing privacy settings always cost 0 XOs.

Keep grant/spend/refund ledger records and derive balances consistently. Production must use server time, atomic transactions, verified payment events, and server-enforced entitlements. A local balance is editable by the user and cannot secure money or paid access.

Keep plan comparisons, wallet summaries, and action feedback derived from the shared limits and costs. Free matched messaging must remain available even with an empty XO balance or exhausted first-message allowance.

## Proposed Files and Folders

This is the intended structure, not files already generated. Route files stay thin; feature logic lives outside the router directory.

```text
MatchXD/
  app.config.ts
  package.json
  package-lock.json
  tsconfig.json
  eslint.config.js
  README.md
  assets/
    brand/
    fonts/
    profiles/
    media/
  public/assets/concepts/MatchXDv1.png
  src/
    app/
      _layout.tsx
      index.tsx
      sign-in.tsx
      onboarding.tsx
      (app)/
        _layout.tsx
        discover.tsx
        matches.tsx
        messages/[conversationId].tsx
        mxo.tsx
        profiler.tsx
        profile/index.tsx
        profile/edit.tsx
        preferences.tsx
        wallet.tsx
        settings.tsx
        dashboard.tsx
    components/
      BrandMark.tsx
      AppShell.tsx
      ProfileCard.tsx
      XoBalance.tsx
      StatusCell.tsx
      ui/
    config/
      app.ts
      plans.ts
      economy.ts
      features.ts
    theme/
      tokens.ts
      ThemeProvider.tsx
    domain/
      types.ts
      wallet.ts
      matching.ts
      visibility.ts
    features/
      auth/
      discovery/
      messaging/
      profile/
      wallet/
      mxo/
      profiler/
      dashboard/
    services/
      contracts.ts
      local/
    storage/
      adapter.ts
      storage.web.ts
      storage.native.ts
      migrations.ts
    state/
      useAppStore.ts
    data/
      demoProfiles.ts
      demoConversations.ts
  docs/
    IMPLEMENTATION_PLAN.md
```

`plans.ts` owns prices and feature access; `economy.ts` owns XO grants, action costs, rewards, reset policy, and packs. `app.ts` owns brand and application settings. `features.ts` controls incomplete integrations explicitly. `tokens.ts` owns colors, spacing, radii, and typography.

Use small service contracts for authentication, profiles, discovery, messaging, wallet, billing, notifications, MXO, directory, and admin actions. Add remote implementations when those services are connected; do not fill the first version with unused integrations. Introduce `eas.json`, environment examples, database migrations, and server functions in the later phases that actually require them.

## Later Backend and Account Setup

Suggested entities: accounts, profiles, preferences, photos/media, interests, swipes, matches, conversations, messages, blocks, reports, directory links, wallets, wallet events, subscriptions, and push tokens.

Keep provider IDs in separate fields such as `auth_user_id`, `stripe_customer_id`, and `stripe_subscription_id`. Preserve app-owned identity. If adopting the requested numbered ID format, assign `number` and its matching immutable app ID together on the server; a local counter is only for the demo. Avoid making sensitive personal data part of publicly exposed IDs. With Firestore, sequential IDs and global counters have scaling tradeoffs that must be addressed. [Firestore best practices](https://firebase.google.com/docs/firestore/best-practices)

For the owner's future Google login, grant the role server-side to the intended verified account. Protect all dashboard operations with backend authorization and row-level security. A demo role, email typed into a form, hidden route, or user-editable metadata cannot grant production owner access. [Supabase authorization guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)

Add Google and Apple authentication first, followed by Facebook and phone OTP. Review Apple's login rules when adding third-party login. Phone OTP requires an SMS provider and abuse controls. MXO needs a server endpoint, an explicit AI provider choice, usage limits, and a clear policy for which profile data it receives. Email/SMS notifications are separate opt-ins, independent of authentication messages.

For web checkout, use Stripe's hosted payment fields inside the MatchXD design, with server-created payment sessions and verified webhooks. Stripe lists online dating/matchmaking as a restricted business requiring additional review; eligibility must be established before live payments. [Stripe restricted businesses](https://stripe.com/legal/restricted-businesses)

For native digital subscriptions and XO packs, plan on Apple/Google store billing with receipt verification and shared backend entitlements. Eligible US external-payment options can be considered later; they are not a universal exemption from store rules or fees. Apple Pay is a wallet/payment method, not a replacement for those digital-goods rules. Store prices come from store product metadata, and available price points must be checked before promising exact $3.33/$5.55/$11.11 prices on every storefront. [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/), [Google payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en), [Apple subscription pricing](https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions)

Apple requires content reporting, blocking, moderation, and contact information for user-generated content. Its dating-app review guidance also calls for a meaningfully different or improved experience. Build around transparent pricing, explainable recommendations, reliable filters, easy cancellation, and useful privacy controls. Those are product goals, not a guarantee of store approval. [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/)

Before public use, implement actual age-access enforcement, moderation operations, account/data deletion, data access rules, and abuse prevention. The local DOB gate and report screens demonstrate the experience; they are not production identity verification or a staffed moderation service.

## Costs and Services

Verified planning figures as of September 10, 2026. USD, before applicable taxes; usage and eligibility affect the final bill.

| Item | Local Prototype | Later Use |
| --- | --- | --- |
| Expo SDK, CLI, Expo Go | $0 | Framework and Expo Go remain free. [Expo FAQ](https://docs.expo.dev/faq/) |
| EAS cloud builds | Not needed for initial Expo Go preview | Free includes 15 Android and 15 iOS builds/month; optional Starter is $19/month plus additional usage. [Expo pricing](https://expo.dev/pricing) |
| Supabase | Not connected | Free development tier; Pro starts at $25/month, with usage-dependent additions. Free projects have quotas and inactivity pausing. [Supabase pricing](https://supabase.com/pricing) |
| Apple Developer Program | Not needed for Expo Go preview | $99/year for store distribution and normal paid signing capabilities. [Apple membership](https://developer.apple.com/programs/whats-included/) |
| Google Play Console | Not needed for Expo Go preview | $25 one-time registration. [Google registration](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |
| Stripe web payments | Simulated, $0 | Standard US domestic cards: 2.9% + $0.30; pay-as-you-go Billing adds 0.7% of billing volume for subscriptions. Subject to business approval. [Stripe pricing](https://stripe.com/pricing) |
| Native store billing | Simulated, $0 | Commissions depend on program, purchase type, and region; separate from developer-account fees. [Apple program](https://developer.apple.com/app-store/small-business-program/), [Google service fees](https://support.google.com/googleplay/android-developer/answer/112622?hl=en) |
| Expo push delivery | No remote delivery | No sending charge from Expo; backend work and credentials remain necessary. [Expo push FAQ](https://docs.expo.dev/push-notifications/faq/) |
| Hosting/domain, SMS, email, AI, verification, ads | Not connected, $0 | Choose providers before integration; no reliable total without traffic, message, media, and AI usage assumptions |

The initial local prototype can have $0 additional service fees using existing hardware. Publishing to both stores starts with $124 in first-year developer-account fees; Apple renews annually. This excludes hosting, backend usage, payment commissions, optional build plans, and operations. A production Supabase Pro project adds a starting $25/month; that is not the complete operating budget.

At the quoted domestic-card rate, a $1 web XO purchase incurs about $0.33 in processing fees before other costs. Larger packs at the same 10-XOs-per-dollar rate may be more sustainable. Preserve the requested rate and make pack sizes configurable.

## Build Sequence

1. Foundation: Expo/TypeScript setup, theme, responsive shell, brand assets, local storage, demo data, and clear demo entry.
2. Core loop: 18+ onboarding, profile editing, discovery gestures, preferences, blocks, matches, messages, and XO accounting.
3. Remaining local screens: plans/checkout simulation, reward simulation, MXO, Profiler, owner dashboard, and settings.
4. Handoff: detailed README, local reset/recovery instructions, known limitations, and focused checks of age gating, wallet arithmetic/idempotency, visibility rules, and persistence. No long builds or browser/device verification without prior notice and a justified need or request.
5. Connected beta, a separate phase: real auth, database, media, moderation, server authorization, live recommendations, and remote notifications.
6. Payments and distribution, a separate phase: Stripe approval, store billing, restore/cancel/refund handling, production review, and signed builds.

The first working milestone is onboarding -> discover -> like -> demo match -> message, with persistent XO accounting and profile editing. Complete the remaining agreed local screens before describing the whole prototype as finished.

## README Instructions to Provide During Implementation

The README should distinguish steps that work immediately from later paid or connected features. It should include:

1. Install supported Node LTS, Git, and Expo Go. XAMPP/PHP is not required; the repository may stay in its current folder.
2. From the project folder, run `npm install`, then `npx expo start`. Press `w` for web. Scan the QR code in Expo Go on Android or with the iPhone camera. The computer and phone should share a reachable network; document Windows firewall/LAN troubleshooting and the optional tunnel fallback. [Expo first-app guide](https://docs.expo.dev/tutorial/create-your-first-app/), [Expo CLI](https://docs.expo.dev/more/expo-cli/)
3. Explain the demo account, Demo Owner dashboard, every configurable XO value, data reset, sample media, and lack of cross-device sync.
4. Explain that Expo Go hosts the development preview; it is not a standalone MatchXD store installation. Remote push and additional native integrations require a development build. [Development builds FAQ](https://docs.expo.dev/develop/development-builds/faq/)
5. Explain Android APK/development-build installation when needed. Explain that Windows can trigger iOS cloud builds, while local iOS compilation and the simulator require macOS/Xcode. Physical-iPhone cloud signing normally needs paid Apple membership. [Expo FAQ](https://docs.expo.dev/faq/), [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
6. Explain moving to Mac by cloning the same repository, installing dependencies, and running the same Expo commands; do not copy Windows node_modules. Add Xcode only for local iOS builds/simulator work.
7. Document later environment setup without committing secrets, production auth callbacks, payment product mapping, push credentials, EAS profiles, store submissions, and web export/hosting.
8. Explain Google Play's current new-personal-account release requirement: at least 12 testers opted into a closed test for 14 consecutive days, then an application for production access. It is not immediate publication after paying the fee. [Google testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)

No Stripe, Firebase, Supabase, Apple, or Google account needs to be opened or connected to review this plan or build the first local prototype. Account setup belongs to the specific later integration phase that needs it.
