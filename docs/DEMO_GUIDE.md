# MatchXD Demo Guide

[Project overview](../README.md) · [Getting started](GETTING_STARTED.md) · [XO economy](XO_ECONOMY.md)

The current release runs locally with fictional adult profiles. Authentication, replies, AI recommendations, purchases, subscriptions, ads, and moderation are demonstrations. There is no backend, real dating network, payment processing, or cross-device synchronization. No card details are collected and no money is charged.

## Explore The App

1. Choose **Continue As Demo Member**, enter an adult date of birth in `YYYY-MM-DD` format, and complete onboarding. Your public profile shows age, not birth date. This local check demonstrates the 18+ flow; it is not identity verification.
2. Open Discover. Swipe or use pass, like, Super Like, and rewind buttons. Some fictional profiles have already liked your demo profile, so a like can create a mutual match.
3. Send one first message to an unmatched person for 1 XO, or open Matches to chat for free. Pending introductions wait for a mutual match; only matched conversations receive explicitly simulated replies. Try the Safety controls to report, block, or unmatch without spending XOs.
4. Edit Profile to arrange photos, change your description and interests, add optional attributes, try voice/video introductions, and manage public links. Preferences supports age, distance, optional criteria, and exact-name exclusions.
5. Try Wallet for simulated upgrades, XO packs, cancellation, ad rewards, and transaction history. See the [XO economy](XO_ECONOMY.md) for prices, daily limits, and balance rules.
6. Ask MXO for something like `coffee and hiking`, `women ages 25 to 35`, or `within 10 miles`. It uses local rules and your saved preferences, not a live AI model or compatibility score.
7. Search Profiler by name. Only visible, opted-in profiles and their user-added HTTPS links appear. It does not crawl the web or prove identity.
8. Open Settings for Light, Dark, or System appearance, visibility, MXD incognito, notification preferences, your blocklist, and local data controls. Notification switches save preferences; they do not deliver remote notifications.

## Explore The Owner Dashboard

Sign out and choose **Explore As Demo Owner**. Create, edit, or delete sample profiles, review reports, and inspect local counts and storage status. Fresh owner sessions also complete the adult date-of-birth gate.

This is not a production administrator login. Ownership and moderation permissions must be enforced by a server when accounts are connected; see [Deployment](DEPLOYMENT.md).

## Visibility And Safety

Blocks apply in both directions across discovery, profile links, conversations, Profiler, and MXO. Incognito profiles are visible only to people they have liked. A name exclusion is a personal filter, not an identity-based block.

Location is manually entered and distances are fictional approximations. Optional height is self-reported. Do not upload identity documents: document verification and sensitive-data storage are outside this local release.

## Saved Data And Recovery

Web uses browser localStorage; iOS and Android use AsyncStorage. A versioned, validated snapshot saves profiles, preferences, wallet activity, conversations, and demo reports under `matchxd.demo.v1`. Each browser origin and device has its own state, including separate localhost ports. This storage is not encrypted and should contain demo data only.

- **Sign Out** ends the local session and preserves your profile, photos, interests, preferences, and saved activity. It also lets you change demo roles. On re-entry, confirm an adult birth date again; saved profile details remain available.
- **Reset Demo Data** replaces local changes with the fictional starter data.
- **Delete Local Account** erases the local user's changes and activity, ends the session, and returns to fresh starter data. There is no remote account or real subscription to cancel.
- Corrupt or unsupported snapshots open a fresh in-memory demo with a storage warning. The next saved change replaces the invalid copy; Settings → Reset Demo Data also restores starter data. If storage is blocked or full, changes remain in memory and the app shows a warning.

## Photos, Audio, And Video

Bundled portraits and sample people are fictional demo content. The voice sample is synthetic, and the video is a branded sample clip, not an actual member recording. See [Asset Provenance](ASSET_PROVENANCE.md) for their origins.

Uploaded browser photos/audio/video are session previews; temporary blob/data URLs are excluded from saved snapshots and must be reselected after reload. Native selections reference local cached files, which can disappear when the operating system clears cache. Bundled samples remain available. No media is uploaded to a server.

See [Verification](VERIFICATION.md) for executed checks and known limitations.
