# MatchXD frontend readiness

Branch: codex/matchxd-frontend-readiness. Source baseline: c13fba0 (Match XD AI Updates).

## Scope

Preserves the Expo coral/charcoal dating preview, fictional adult profiles, existing local matching and scripted messaging, profile editing, preferences, themes and moderation demo. No database, authentication provider, payment, telemetry connection, real message or deployment added. Existing WebAnalytics component remains unchanged.

Adds connections and password-reset setup states; persistent account navigation; full-width account content; explicit local-demo banner; analytics layout with unavailable traffic/runtime metrics and separately labeled device snapshot counts; public About, Contact, Privacy, Terms and Safety pages and aliases; route metadata/noindex and crawl access for reading those directives. Public footer links work across web/native. Current local data remains in the original storage adapter; navigation preference uses a separate versioned non-sensitive device key.

Owner preview is an existing simulated role, not real identity or authorization. No new owner role assignment was introduced. Existing local signup drafts are not submitted. Use fictional information only. There is no cloud sharing, cross-device sync, delivered support or real moderation. Auth controls stay disabled and never collect passwords.

## References

Shared guidance copied from the prepared BengaliBlush pack (upstream 7c26b2427ae7abeba3068a31661f4c18fbb20086) plus its generic disconnected workflow. Source reference inspected: Domains-Database c08500922be6a78a305e9e00d71195c3d1b2e6a1 AccountPage native component and account navigation context. Adapted account/private-connection separation, full-width layout and disclosure patterns without transferring credentials or backend code. Existing destination sidebar and demo management are preserved rather than replacing the dating navigation. Requested reverse-engineer-anything skill was unavailable; source inspection was used instead.

## Future connection checklist

- Separate verified Firebase Auth identity from demo role. Enable Google/email-password only after explicit connection approval; add actual password reset and verified email flows.
- Use private account-scoped Firestore documents and trusted role assignment. Never turn the device role into authority. Implement rules, query bounds, subscription cleanup and account-isolated storage/migrations.
- Do not upload existing local profile/contact/demo conversation data automatically. Offer explicit reviewed migration and exclude fictional seed records.
- Server-side Vercel reports require verified identity/capability, fixed project scope and private caching. Current report controls are disabled because no provider query exists.
- Replace simulated messages/moderation with participant-private services only in a separately authorized launch. Adult eligibility, reporting operations, abuse protections, consent and deletion require independent implementation/review.
- Configure the actual canonical domain and sitemap only after target is selected and connected. No custom-domain claim added. Robots/noindex are not access control.
- App Store and ad submission are not performed or guaranteed. Review current store rules, user-generated-content safety, rights, privacy disclosures, deletion, native builds/signing and ad eligibility before submission. Dating content needs its own policy assessment; frontend readiness is not approval.

## Validation

Source inspection only. No tests, build, lint, typecheck, browser or native UI verification run, following AGENTS.md. New pages require user review and runtime validation before merge. Main remains unchanged; this branch is not a production deployment.
