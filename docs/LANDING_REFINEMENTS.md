# MatchXD Landing Refinements

September 10, 2026. This document supersedes the [historical three-phone report](LANDING_DESIGN.md).

## Current Design

- Sixteen phones form an evenly overlapping circular card fan around the rotating app icon, showing Discover profiles, MXO, and Messages. Every phone has a distinct person and portrait, and the two MXO and two Messages previews each have their own conversation. The extra pinwheel tilt is removed. Scrolling gathers the ring into one upright phone showing Maya. Sofia is removed from the landing previews; existing signed-in profiles and saved data are preserved.
- The center icon turns independently once every 24 seconds, continuing after phone rotation stops. It follows the ring's center and scale, fades through the first 55% of gathering, and sits underneath the cards. Rotation pauses offscreen or after fading; reduced motion keeps it static. Native also pauses under the privacy modal.
- Discover's action row has 12 scaled pixels of bottom padding above the app navigation, shared by Maya and the other Discover previews. The white SVG heart and other control sizes stay unchanged.
- Phone model captions, demo labels, and visible pause controls are removed. Reduced-motion preferences remain supported. The web orbit stops beyond its orbit phase and when the document is hidden; native motion stops beyond its orbit phase and under the privacy modal.
- The slimmer shared header measures 68 px on desktop and 80 px on mobile, excluding native safe-area padding. The app icon, theme control, and Sign In content retain their sizes.
- Mobile gets a larger three-line hero and supporting copy, with at least 80 px between the initial button and web phone bodies (72 px native). Clearance uses the measured heading height and rotating ring bounds. The web stage uses the available viewport height below the header, keeping the final CTA within short viewports.
- Alternating black and white headline words enter through split reveals. Native uses masked line entrances. The black-and-white XOXO word circle combines a rotating outer message with a stationary center; web adds a vertical mask reveal. Rotation pauses offscreen, with native also pausing under its privacy modal.
- Liquid fills animate into landing actions and shared app buttons on hover, focus, or press as supported by the platform. Dark privacy-card actions use dark fills to preserve white-label contrast. Reduced-motion preferences remove the animated transition.
- The four web plan cards keep their existing typography and layout and include daily action allowances plus free matched chat. Their waves are capped at 72% of each card's height so the liquid surface stays below the top edge. A fourteen-row pricing comparison follows the cards, with daily grants, separate rewind/Super Like/first-message limits, free matched chat, included services, tier-specific preferences, incognito, and XO costs sourced from app configuration. Mobile tables scroll internally with a visible scroll hint.
- The comparison eyebrow, title, and description now precede the four plan cards, followed by the table. Web's large daily allowance counts from zero to 33 over 1.4 seconds, with temporary blur and a crisp final value. Its width is reserved and assistive technology reads only the final amount. The count replays after fully exiting and re-entering the viewport.
- Additional web feature, pricing, button, and footer text reveals replay after full viewport exit. Split headlines move word by word; supporting content uses brief blur/fade entrances. Hero and gathered-phone copy use their scroll visibility phases for replay. Keyboard-focused items stay revealed until the next full exit; reduced motion shows final content immediately.
- Both landing footers credit “Designed by Piratechs” and link to https://piratechs.com, the URL confirmed by the user. The web credit stays visible on mobile and includes a keyboard focus outline.
- Production-style copy carries the coral, blush, charcoal, and white identity through the hero, features, privacy information, pricing, and footer. Existing sign-in behavior, local profiles, settings, wallet data, and other persisted app data are preserved. The copy change does not enable remote services, live members, payments, or app-store distribution.

Web uses semantic HTML/CSS with one scheduled animation frame for the phone scene. Native uses React Native and Reanimated. Phone previews, header, orbit definitions, and liquid-button components are shared where appropriate.

## Logo Kit

The [logo review gallery](logo-variants/index.html) presents five directions across ten standalone SVGs: Connected wordmark, black-and-blush mark, circular icon, condensed italic signature, and XOXO signature. See the [contact sheet](logo-variants/logo-variants-preview.png) and [editing notes](logo-variants/README.md).

All variants preserve the original Connected X geometry. Lettering is outlined, with licensed source fonts included for regeneration. Original logo files and the current app identity are preserved.

## Current Card Fan Verification

- Spacing/reveal follow-up: Discover controls measured 13.17 rendered pixels above the app bar in the desktop preview and 11.18 px on 390 × 844 mobile. The comparison heading appeared once, 22 px above the four cards, on both layouts; neither overflowed the document. The mobile Piratechs link was visible and focusable.
- Counter replay was observed resetting to 0, then displaying 1 with `blur(0.05px)`, and finally 33 with no blur. Footer reveal classes reset when offscreen and returned on re-entry. A focused pricing button stayed opaque with no animation after focus moved away. Typecheck and full lint passed; typecheck and targeted landing lint passed again after the focus-retention fix. Native spacing, comparison slot, and agency link were reviewed in source; no physical-device run or new export was performed.
- Center-icon follow-up: desktop 1452 × 927 and mobile 390 × 844 show the icon centered on the average of all sixteen phone centers, within 0.001 px. The displayed icon measured 67.7 px on desktop and 55.7 px on mobile. At a fixed desktop scroll position of 695.2 px, the phone transform remained unchanged across two samples while the icon rotation changed. Its opacity reached zero and rotation paused before the final upright Maya phone on both viewports. Mobile had no document overflow.
- All sixteen carousel images loaded, with sixteen distinct image sources and distinct rendered contents. Eleven new fictional adult portraits were generated using the built-in image tool and saved unchanged as 1086 × 1448 PNGs. Exact prompts, paths, hashes, and visual reviews are recorded in [portrait set A](carousel-portraits-a.md) and [portrait set B](carousel-portraits-b.md).
- Typecheck and lint passed again after the icon and unique-preview changes. The browser log query returned no errors or warnings during this follow-up; that result does not supersede historical console notes below. Native animation cleanup, geometry, and reduced-motion branches were reviewed in source. Physical-device behavior and mid-session native OS preference changes were not tested. No domain tests or exports were repeated for this visual follow-up.
- Desktop 1452 × 927: sixteen evenly spaced radial phones overlap around the opening. The leading preview is Maya, and no Sofia text appears in the landing carousel. Decorative phone contents are hidden from assistive technology.
- Mobile 390 × 844: headline measured 53.9 px; initial button-to-phone clearance measured 80.6 px; no document overflow. At 375 × 667 the headline measured 51.8 px, the clearance measured 84.8 px, and the final Maya phone remained upright with its action ending at 632 px. At 320 × 740 the 44.2 px headline fit its 282 px content width.
- Desktop pricing: all eleven rows and four plan columns fit without horizontal scrolling. On mobile, keyboard arrows reached the last column while the feature labels remained fixed; at 390 px, the last cell ended at 357.2 px inside the 358 px container edge.
- At 320 px, all plan-card content remained inside its card. The focused MXD wave rose to its intended position with its top about 43 px below the card edge, and the inset focus outline stayed visible.
- Web word reveals run for 1.15 seconds with 120 ms word delays and a larger vertical entrance. Later heading lines continue the stagger. Native entrances run for one second with 180 ms stagger. Reduced-motion styles reveal text without movement. Native heading content fades before the rising ring can obscure it, and hidden heading controls are disabled and removed from accessibility navigation without changing layout measurements.

Typecheck and lint passed after the geometry, comparison, and accessibility changes. Native rendering and reduced-motion behavior were reviewed in source; no physical-device run or media-preference emulation was available. Domain behavior was not changed, so domain tests and exports were not repeated. The historical export below predates this work.

## Previous Pinwheel Follow-Up

The orbit uses a 430 px center radius for a 280 × 582.4 px phone and a 22.5° outward rotation offset. Phone size and orbit radius scale together until gathering begins. This leaves a guaranteed 217.75 px clear center diameter before scaling, with adjacent phone rectangles overlapping by about 8.22% of their area. Rounded corners increase the opening; decorative shadows are excluded from this geometric bound.

The revealed desktop ring fits the stage height. Mobile allows the outer phones to crop at the sides to preserve their size while keeping the opening visible. Native uses the same geometry and moves the opening into view before gathering.

Browser review covered desktop 1452 × 927 and mobile 390 × 844 / 375 × 667. The mobile rendered clear opening measured 97.4 px and 82.0 px, respectively, without document overflow. The desktop and 390 px mobile gather still ended with one upright phone; the mobile action remained within the viewport. Typecheck and lint were rerun successfully against both final platform files. Native clearance was checked mathematically and in source; physical-device rendering was not tested. The browser continued to report asynchronous-listener/channel errors with no established origin.

No dependencies changed. The export below belongs to the preceding refinement pass and predates this geometry adjustment; it was not rerun for this visual change.

## Earlier Refinement Verification

| Check | Recorded Status |
| --- | --- |
| Typecheck | Passed |
| Lint | Passed, no diagnostics |
| Domain tests | 16 passed |
| Desktop browser QA | Radial wheel, split headline colors, circle reveal/rotation, and privacy liquid focus reviewed |
| Mobile browser QA | Passed at 390 × 844 and 375 × 667: no horizontal overflow, 80 px header, eight-phone orbit, and one-phone final state with visible CTA |
| Navigation and button feedback | Feature anchor aligned at 80.4 px; sign-in and Back worked; shared Continue button liquid fill and focus outline verified with keyboard |
| Previous export | Passed, exit 0, for web, iOS, and Android with bundled Node 24.19.0 |

The final CTA bottom measured 798 px in the 844 px viewport and 632 px in the 667 px viewport. The mobile word circle revealed fully and rotated without overlapping its adjacent copy. The preview was restored to the light landing page at scroll position zero, desktop 1452 × 927, with the 68 px header and eight phones.

The browser log contained three earlier asynchronous-listener/channel errors at 22:11:57 UTC; their origin was not established. No new errors or warnings appeared during the final mobile, navigation, and sign-in checks at 22:25–22:28 UTC. These are not recorded as a clean lifetime console.

The final export is in the git-ignored `.local-tools/refined-landing-export` directory. Artifacts: landing CSS 19,113 bytes; shared liquid-button CSS 1,019 bytes; web JavaScript 2,560,502 bytes; iOS Hermes bundle 4,111,786 bytes; Android Hermes bundle 4,306,260 bytes. The export's only warning was the terminal setting both `NO_COLOR` and `FORCE_COLOR`. No dependencies changed.

Reduced-motion branches were reviewed in source; the browser tooling did not support emulating that preference. Native physical-device behavior and a complete assistive-technology audit remain unverified. The historical report's checks apply only to the earlier design.
