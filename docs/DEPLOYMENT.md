# MatchXD Deployment Guide

MatchXD's web preview is live at **[matchxd.vercel.app](https://matchxd.vercel.app)**. Its [Vercel project](https://vercel.com/strawhat19s-projects/matchxd) automatically deploys GitHub pushes and merges to `main`. The app is also linked to [@strawhat19/matchxd on Expo](https://expo.dev/accounts/strawhat19/projects/matchxd), with that Expo project connected to the same GitHub repository. The owner confirmed personal, noncommercial use for Vercel Hobby on September 11, 2026; no money was spent and the custom domain remains unconfigured.

See [Deploy Expo To Web](deploy-expo-app-to-web.md) for the exact setup, first verified Git deployment, update process, and rollback guidance. EAS build profiles, production authentication, a backend, and live payments are not configured. The hosted app retains its local demo behavior; it is not yet a connected dating service.

For local setup, see [Getting Started](GETTING_STARTED.md). See [Development](DEVELOPMENT.md) for project configuration and checks, [Verification](VERIFICATION.md) for recorded results and limitations, and the [Implementation Plan](IMPLEMENTATION_PLAN.md) for the proposed connected-service architecture.

## Web Export And Preview

From the repository root, using supported Node:

```powershell
npm run export:web
npx serve -s dist
```

The export script writes the web bundle to `dist`. The `serve` command may offer to download the preview utility. It previews the export locally; neither command publishes the site or connects a backend.

The web configuration in [app.config.ts](../app.config.ts) uses `output: single`. [vercel.json](../vercel.json) defines the install/build commands, `dist` output, and client-route fallback used by Vercel. See [Deploy Expo To Web](deploy-expo-app-to-web.md) for the hosting policy, connection details, and completed web checks.

## Standalone Mobile Builds

Standalone builds and store submissions have not been configured or produced by this prototype.

1. Use the linked Expo project, install the development client when needed, and configure EAS Build. Review the iOS bundle identifier and Android package in [app.config.ts](../app.config.ts), then add development, preview, and production profiles to `eas.json`. Those profiles do not currently exist. Follow the [EAS setup guide](https://docs.expo.dev/build/setup/).
2. Configure an Android preview profile to produce an APK for direct device installation; production Play distribution normally uses an AAB. Build with the selected EAS profile and install its artifact. See the [Android APK guide](https://docs.expo.dev/build-reference/apk/).
3. Windows can request iOS cloud builds. Local iOS compilation and the iOS simulator require macOS and Xcode. Signed physical-iPhone cloud builds normally need Apple Developer membership and the appropriate registered devices or distribution method. Add signing credentials during this phase.

Expo Go remains a development host, not a standalone MatchXD installation. See [Getting Started](GETTING_STARTED.md) for device previews and moving development to a Mac.

## Connected Beta

Complete these integrations before opening a connected dating service:

- Connect the chosen backend; Supabase/PostgreSQL is proposed in the [Implementation Plan](IMPLEMENTATION_PLAN.md). Implement real authentication callbacks, media storage, mutual matching, realtime messaging, moderation, account/data deletion, and server authorization. Assign owner access to a verified account on the server; the local demo role cannot grant production permissions.
- Add server endpoints for AI and payments, store product mappings, receipt/webhook verification, and restore, refund, and cancellation handling. The current local balances and simulated purchases do not secure money or entitlements.
- Configure push credentials and actual notification delivery. Notification preferences alone do not send notifications. Phone authentication and SMS updates require their own provider setup.
- Keep secrets out of Git and client bundles. Add an environment example containing placeholders when the corresponding integrations exist. Changing an availability flag alone does not implement a service.

## Release Preparation

Complete target-device testing, accessibility checks, privacy and age-access handling, moderation operations, store listings, and review requirements before public use. Consult the [Verification](VERIFICATION.md) record for the limits of existing checks; local tests do not establish physical iPhone or Android behavior.

Review Apple's [App Store review guidelines](https://developer.apple.com/app-store/review/guidelines/) for user-generated content and dating apps. Native digital purchases need an appropriate store billing approach; recheck the applicable rules when connecting payments. Check [Stripe's restricted-business requirements](https://stripe.com/legal/restricted-businesses) before enabling web dating payments.

The planning snapshot recorded on **September 10, 2026** stated that Google Play personal accounts created after November 13, 2023 needed at least **12 closed-test participants opted in continuously for 14 days**, followed by an application for production access. Recheck [Google's testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) for the account before scheduling a release. Paying the registration fee does not itself publish the app.

## Cost Planning

The local browser and Expo Go prototype needs no paid service account. The following estimates were recorded on **September 10, 2026**. Recheck the linked provider pricing and eligibility before budgeting or purchasing. Usage, taxes, payment processing, and store commissions are separate.

| Item | Recorded Planning Cost | Source |
| --- | ---: | --- |
| Optional EAS cloud builds | Free allowance; Starter from $19/month plus usage | [Expo pricing](https://expo.dev/pricing) |
| Optional Supabase backend | Free tier; Pro from $25/month plus usage | [Supabase pricing](https://supabase.com/pricing) |
| Apple Developer membership | $99/year | [Apple membership](https://developer.apple.com/programs/whats-included/) |
| Google Play registration | $25 once | [Play Console registration](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |

Hosting, domain, SMS, email, AI, verification, and moderation costs depend on the later providers and usage. No paid accounts need to be opened to explore the prototype.

[Back To MatchXD](../README.md)
