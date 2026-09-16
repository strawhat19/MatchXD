# Local signup validation

MatchXD currently records interest on the visitor’s device and opens the free app preview immediately. `beta` means free beta interest; `founding` means interest in a proposed $1/month plan. Both start with `wallet.plan === "free"`. Neither choice creates a subscription, authorizes a future charge, or takes payment.

There is no backend signup collection, contact verification, real authentication, or cross-device synchronization. Sharing this build lets people try the flow, but their signups do **not** reach the developer. Connect a backend before sharing it to collect actual demand. This is preparation for that work, not a production-ready dating service.

## Try the flow

Run `npm run web` and use a dedicated browser profile with test data.

The landing page defaults to **Beta**. Its Features and Pricing tabs stay in sync: **Plans** shows the original feature cards, Free/M/MX/MXD cards, and detailed comparison. On web, choosing Free opens beta signup; choosing M, MX, or MXD opens founding-interest signup. Displaying or choosing a plan does not activate a paid entitlement or billing.

1. From the landing page, choose the free beta option. Enter a test email or phone, name, adult date of birth, and city; choose a photo or avatar; optionally add a bio, interests, and private product feedback. Confirm the age requirement and choose **Join & Explore Free**.
2. Confirm the thank-you notice, immediate discovery access, and Free wallet. Sample profiles and interactions run locally; there is no live connection with other visitors.
3. Refresh, then sign out through Settings. **Continue On This Device** should reopen the saved profile without repeating onboarding. Signing out preserves the profile and its signup interest.
4. Sign out again and open the landing page’s founding signup option. Use a different test contact. Confirm that the proposed $1/month interest is selected, no payment is requested, and discovery still opens on Free. Both signup records remain locally; the earlier profile becomes available to the local preview.
5. Submit another signup with the same contact, changing its plan or feedback. Email case and phone formatting should not create duplicates. The existing signup/profile IDs and creation time stay stable; the plan, feedback, and update time change.
6. Check missing/invalid contact and an underage birth date: completion must be blocked. Feedback is optional and limited to 1,000 characters. Existing valid version-1 snapshots without the new signup fields should still load their profiles and activity, with an empty interest collection. `npm test` covers the domain and persistence cases.

Only completed onboarding creates a signup record. Clearing browser data, resetting the demo, or deleting the local account removes local records. Separate devices, browser profiles, origins, and localhost ports have separate storage.

Ordinary sign-out and return preserve the current profile’s activity. Signing up with a different saved contact switches the local test profile and starts fresh activity; stored profile likes/blocks and signup records remain. This is a single active preview session, not a full multi-account authentication system.

## Inspect local records

Web persists the snapshot in `localStorage` under `matchxd.demo.v1`; native builds use AsyncStorage. The `signupInterests` collection contains `id`, `profileId`, normalized `contact: { kind, value }`, `plan`, `feedback`, `createdAt`, and `updatedAt`. Contact and feedback are separate from the public `Profile` data. Email addresses are lowercased; phone values contain digits only. This checks formatting, not ownership.

`activeSignupInterestId` identifies the interest linked to the current `user` profile. It remains saved after sign-out so that returning locally retains the relationship. Older snapshots default to `signupInterests: []` and `activeSignupInterestId: null`; missing contact details are never invented.

In the app page’s DevTools console, this read-only example shows counts and IDs without printing contact values or feedback:

```js
const matchxdSnapshot = JSON.parse(localStorage.getItem("matchxd.demo.v1") || "null");
console.table((matchxdSnapshot?.signupInterests || []).map(interest => ({
  id: interest.id,
  profileId: interest.profileId,
  contactKind: interest.contact.kind,
  plan: interest.plan,
  hasFeedback: Boolean(interest.feedback),
  active: interest.id === matchxdSnapshot.activeSignupInterestId,
})));
console.log("Active entitlement:", matchxdSnapshot?.wallet?.plan);
```

Inspect the same key in DevTools’ storage panel when checking your test contact or feedback. Local storage is unencrypted and editable by the person using the browser. This local collection is not an administrative database or evidence of verified users.

## Future backend boundary

`complete-signup` currently validates and atomically updates the profile, private signup interest, local session, and free entitlement in the domain transition. Use this boundary for a future authenticated server operation that saves the profile and signup interest together and returns stable IDs. Handle duplicate submissions and persistence failures without losing or duplicating interest records.

Keep `SignupInterest.plan` separate from access entitlements and billing. Preserve IDs, timestamps, and selected intent when transitioning to server-backed accounts; verify contact ownership and establish authorization before restoring or changing someone’s account. A founding-interest record must never automatically become a paid subscription. Add payment consent and billing later as a separate flow. Local test records must not be uploaded automatically.

## Copy sources

Checked September 16, 2026: [Match Group’s company page](https://mtch.com/about/) identifies its dating-brand portfolio, including Tinder, Hinge, and Match. This supports describing an independent alternative; it does not establish a monopoly.

[Tinder’s subscription documentation](https://www.help.tinder.com/hc/en-us/articles/115004487406-Tinder-subscriptions) documents paid features including prioritized likes and seeing who likes you. The copy describes documented features and frames frustration with paid visibility as a question. It does not claim secret algorithm manipulation. No fixed competitor prices are quoted. MatchXD’s affordable premium-style features and honest matching remain product goals, not claims that the production service already exists.
