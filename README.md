# Match XD

![Match XD](./public/assets/versions/MatchXD_v0000_0.gif)

MatchXD is a mobile-first dating app prototype for iOS, Android, and web, built with Expo SDK 57, React Native, TypeScript, and Expo Router. The interface combines Coral Classic with a charcoal dark theme, a compact mobile app icon, and the connected-X pass action.

This version runs locally with fictional adult profiles. Authentication, replies, AI recommendations, purchases, subscriptions, ads, and moderation are demonstrations. There is no backend, real dating network, payment processing, or cross-device synchronization.

See [Verification](docs/VERIFICATION.md) for executed checks and known limitations, and [Asset Provenance](docs/ASSET_PROVENANCE.md) for the generated portraits, brand interpretation, and synthetic sample media.

## Start On Windows

1. Install [Node.js 24 LTS](https://nodejs.org/en/download), Git, and Expo Go on your phone. The package accepts Node `^20.19.4 || ^22.13.0 || >=24.3.0`; use a supported LTS release. Node **22.9 is too old**. Reopen your terminal after upgrading, then check `node --version`.
2. Open PowerShell in this repository. XAMPP, PHP, and Apache are not required; the project can stay in its current folder.
3. Install dependencies and start the development server:

```powershell
npm install
npm start
```

Keep the terminal running. Press `w` for web, or start web directly with `npm run web`. Open the address printed by Expo rather than an Apache URL. Stop the server with `Ctrl+C`.

On this Codex Windows computer, the included launcher can use the bundled supported Node runtime when the system Node is too old:

```powershell
.\scripts\start-local.ps1
.\scripts\start-local.ps1 -Web
```

Choose one command. The launcher is a convenience for this machine; installing supported Node is the portable setup. If PowerShell blocks a local script, follow your machine's script policy or use the normal npm commands with supported Node.

## Open On Your Phone

- Use an Expo Go version compatible with this project's **SDK 57**. Update Expo Go if it reports an SDK mismatch. Expo Go is a development host, not a standalone MatchXD installation.
- Connect the computer and phone to the same reachable Wi-Fi network. In Expo Go on Android, scan the terminal QR code; on iPhone, scan it with the Camera app and open Expo Go.
- On Windows, allow Node through the firewall on your trusted private network. A guest network, VPN, or Wi-Fi client isolation can stop the phone reaching the computer. Do not use `localhost` on your phone to reach your PC.
- If LAN access remains unavailable, use the optional tunnel below after installing its helper. Both devices need internet; tunnels are slower and create a temporary externally reachable development URL. [Expo CLI networking](https://docs.expo.dev/more/expo-cli/)

```powershell
npm install -g @expo/ngrok
npx expo start --tunnel
```

If a compatible Expo Go client is unavailable or an integration needs custom native code, use a development build in the later setup below. Remote push requires additional native/backend setup; the current notification switches only save preferences. [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Explore The Prototype

1. Choose **Continue As Demo Member**, enter an adult date of birth in `YYYY-MM-DD` format, and complete onboarding. Your public profile shows age, not birth date. This local check demonstrates the 18+ flow; it is not identity verification.
2. Open Discover. Swipe or use pass, like, super-like, and rewind buttons. Some fictional profiles have already liked your demo profile, so a like can create a mutual match.
3. Open Matches, send a message, and see an explicitly simulated reply. Try the Safety controls to report, block, or unmatch without spending XOs.
4. Edit Profile to arrange photos, change your description and interests, add optional attributes, try voice/video introductions, and manage public links. Preferences supports age, distance, optional criteria, and exact-name exclusions.
5. Try Wallet for simulated upgrades, XO packs, cancellation, ad rewards, and transaction history. No card details are collected and no money is charged.
6. Ask MXO for something like `coffee and hiking`, `women ages 25 to 35`, or `within 10 miles`. It uses local rules and your saved preferences, not a live AI model or compatibility score.
7. Search Profiler by name. Only visible, opted-in profiles and their user-added HTTPS links appear. It does not crawl the web or prove identity.
8. Open Settings for Light, Dark, or System appearance, visibility, MXD incognito, notification preferences, your blocklist, and local data controls.

To explore the dashboard, sign out and choose **Explore As Demo Owner**. Create, edit, or delete sample profiles, review reports, and inspect local counts and storage status. Fresh owner sessions also complete the adult date-of-birth gate. It is not a production administrator login; ownership and moderation permissions must be enforced by a server later.

Blocks apply in both directions across discovery, profile links, conversations, Profiler, and MXO. Incognito profiles are visible only to people they have liked. A name exclusion is a personal filter, not an identity-based block.

## XO Rules

All amounts are configurable. Money is stored as integer cents, and XO balances are integers.

| Plan | Monthly USD | Daily XOs | Added Access |
| --- | ---: | ---: | --- |
| Free | $0 | 33 | Discovery, matching, messaging, basic preferences |
| M | $3.33 | 88 | Ethnicity preferences |
| MX | $5.55 | 154 | Salary and height preferences |
| MXD | $11.11 | 253 | Incognito |

- Pass, like, Super Like, rewind, an unmatched first message, and MXO requests each cost 1 XO. Matched messages are always free, including at zero balance. A first message expresses interest; only one can be sent per recipient until a mutual match opens free chat. Pending introductions receive no scripted reply.
- Rewinds, Super Likes, and first messages have separate daily caps: 1 each on Free, 3 on M, 5 on MX, and 10 on MXD. Buying XOs does not bypass the caps. Upgrades retain usage already consumed that day; rewinding or removing a connection does not refund an allowance or reopen an introduction.
- Daily XOs reset at midnight `America/New_York`, including daylight-saving changes. Unused daily XOs expire; missed days do not accumulate. Purchased XOs do not expire, and daily XOs are spent first.
- Packs preserve 10 XOs per $1: 10/$1, 50/$5, or 100/$10. A simulated ad reward adds 5 daily XOs, up to 3 times a day.
- An upgrade grants only the difference from the highest daily allowance already granted that day. Cancellation retains access until the displayed simulated cancellation date, then returns to Free.
- Failed charged actions do not spend XOs, and replayed operation IDs do not charge twice. Blocking, reporting, unmatching, and privacy controls are free.

These are editable local balances, not payment security. A connected version needs server time, atomic wallet transactions, verified payment events, and server-enforced entitlements.

## Local Data And Media

Web uses browser localStorage; iOS and Android use AsyncStorage. A versioned, validated snapshot saves profiles, preferences, wallet activity, conversations, and demo reports under `matchxd.demo.v1`. Each browser origin and device has its own state, including separate localhost ports. This storage is not encrypted and should contain demo data only.

- **Sign Out** ends the local session and preserves your profile, photos, interests, preferences, and saved activity. It also lets you change demo roles. On re-entry, confirm an adult birth date again; saved profile details remain available.
- **Reset Demo Data** replaces local changes with the fictional starter data.
- **Delete Local Account** erases the local user's changes and activity, ends the session, and returns to fresh starter data. There is no remote account or real subscription to cancel.
- Corrupt or unsupported snapshots open a fresh in-memory demo with a storage warning. The next saved change replaces the invalid copy; Settings → Reset Demo Data also restores starter data. If storage is blocked or full, changes remain in memory and the app shows a warning.

Bundled portraits and sample people are fictional demo content. The voice sample is synthetic, and the video is a branded sample clip, not an actual member recording. Uploaded browser photos/audio/video are session previews; temporary blob/data URLs are excluded from saved snapshots and must be reselected after reload. Native selections reference local cached files, which can disappear when the operating system clears cache. Bundled samples remain available. No media is uploaded to a server.

Location is manually entered and distances are fictional approximations. Optional height is self-reported. Do not upload identity documents: document verification and sensitive-data storage are outside this prototype.

## Project Map And Configuration

| Path | Purpose |
| --- | --- |
| `src/app/` | Thin Expo Router route files and layouts |
| `src/features/` | Discovery, onboarding, profiles, messaging, wallet, MXO, directory, settings, and dashboard |
| `src/components/` | Responsive shell, brand mark, photos, and shared UI |
| `src/theme/` | Color/typography tokens and theme selection |
| `src/config/app.ts` | Brand, minimum age, interests, and optional attribute choices |
| `src/config/plans.ts` | Tier prices, cumulative XO allowances, separate daily action limits, and feature access |
| `src/config/economy.ts` | Action costs, packs, reward limits, timezone, and free matched messaging |
| `src/config/features.ts` | Explicit availability of external integrations |
| `src/domain/` | Validated actions, accounting, visibility, matching, IDs, and focused tests |
| `src/state/AppProvider.tsx` | Shared local state, action dispatch, and persistence notices |
| `src/storage/` | Native/web storage adapters, snapshot validation, and serialization |
| `src/data/demoProfiles.ts` | Seeded profiles, conversations, and initial state |
| `src/services/` | Service contracts and local MXO rules |
| `assets/` | App assets, fictional portraits, and sample media |
| `app.config.ts` | Expo name, platform IDs, icons, and plugins |
| `docs/IMPLEMENTATION_PLAN.md` | Original agreed scope and later integration plan |

No environment variables, credentials, Supabase project, or payment account are required for the local demo. Changing a feature flag alone does not implement an external integration.

## Checks And Web Export

Run these from a terminal using supported Node:

```powershell
npm run typecheck
npm test
npm run lint
```

The focused domain tests cover adult date validation, single-charge swipes, replay protection, wallet math, midnight/DST reset, upgrade/cancellation behavior, visibility, safety actions, owner guards, and snapshot recovery. They do not prove physical iPhone/Android behavior; verify device gestures, media pickers, keyboard behavior, and accessibility on actual target devices before release.

Optional static web export:

```powershell
npm run export:web
npx serve -s dist
```

The `serve` command may offer to download the preview utility. Deploying the exported `dist` later requires a web host configured to serve the app entry for client routes. Exporting does not connect a backend or publish the site.

## Continue On A Mac

Clone the same Git repository onto your Mac, install supported Node, then run `npm ci` and `npm start` in the cloned folder. Use the existing lockfile and do not copy Windows `node_modules`. Your phone can use the new QR code; local browser/device state does not automatically move with the repository.

Install Xcode only when you need the iOS simulator or local native compilation. With a simulator installed, press `i` in Expo or use `npm run ios`. Android emulators need Android Studio; press `a` or use `npm run android`. A physical phone with Expo Go does not require those simulators. [Expo development setup](https://docs.expo.dev/get-started/set-up-your-environment/)

## Later: Standalone Apps And Connected Beta

Standalone builds and store submissions are **not configured or produced by this prototype**. When ready:

1. Create/link an Expo project, install the development client when needed, and configure EAS Build. Review the app identifiers in `app.config.ts`, then add development, preview, and production profiles to `eas.json`. Follow the [EAS setup guide](https://docs.expo.dev/build/setup/) rather than assuming those profiles already exist.
2. Configure an Android preview profile to produce an APK for direct device installation; production Play distribution normally uses an AAB. Build with the selected EAS profile and install its artifact. [Android APK guide](https://docs.expo.dev/build-reference/apk/)
3. Windows can request iOS cloud builds. Local iOS compilation and the iOS simulator require macOS/Xcode. Signed physical-iPhone cloud builds normally need Apple Developer membership and the appropriate registered devices/distribution method. Add signing credentials only during this phase.
4. Connect the chosen backend (Supabase/PostgreSQL is proposed), real authentication callbacks, media storage, mutual matching, realtime messaging, moderation, deletion, and server authorization. Assign owner access to a verified account on the server; never trust the local demo role.
5. Add server endpoints for AI and payments, store product mappings, receipt/webhook verification, restore/refund/cancellation handling, and push credentials. Notification preferences need actual delivery services; phone auth and SMS updates need their own provider setup. Keep secrets out of Git and client bundles; add an environment example with placeholders when these integrations exist.
6. Complete device testing, accessibility, privacy/age handling, moderation operations, store listings, and review requirements before public use. Apple's [review guidelines](https://developer.apple.com/app-store/review/guidelines/) cover user-generated content and dating apps. Native digital purchases need an appropriate store billing approach; review applicable rules when connecting payments. Check [Stripe's restricted-business requirements](https://stripe.com/legal/restricted-businesses) before enabling web dating payments.

New Google Play personal accounts created after November 13, 2023 need at least **12 closed-test participants opted in continuously for 14 days**, followed by an application for production access. Paying the registration fee does not immediately publish the app. [Google testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)

## Costs

The local browser/Expo Go prototype needs no paid service account. The following planning figures were checked September 10, 2026; usage, taxes, payment processing, and store commissions are separate.

| Item | Planning Cost | Source |
| --- | ---: | --- |
| Optional EAS cloud builds | Free allowance; Starter from $19/month plus usage | [Expo pricing](https://expo.dev/pricing) |
| Optional Supabase backend | Free tier; Pro from $25/month plus usage | [Supabase pricing](https://supabase.com/pricing) |
| Apple Developer membership | $99/year | [Apple membership](https://developer.apple.com/programs/whats-included/) |
| Google Play registration | $25 once | [Play Console registration](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |

Hosting, domain, SMS, email, AI, verification, and moderation costs depend on the later providers and usage. No paid accounts need to be opened to explore this prototype.
