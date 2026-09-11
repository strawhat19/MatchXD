# MatchXD Landing Design — Historical Three-Phone Version

Historical snapshot: September 10, 2026, before the eight-phone refinements.

> This implementation and verification report is archived. Its three-phone layout, pause controls, captions, header measurements, exports, and browser results describe the earlier version only. Read [Landing Refinements](LANDING_REFINEMENTS.md) for the current design and its separate verification status. The checks below do not verify the current source.

## Design And Platform Implementation

The landing page introduces MatchXD with a coral/pink hero, alternating light and dark headline words, three orbiting phone previews, and a scroll transition that gathers the phones into one centered iPhone 17. The previews illustrate Discover, MXO, and Messages with fictional content. The feature, pricing, privacy, and footer sections lead into the existing demo sign-in flow.

- Web: `src/features/auth/LandingScreen.web.tsx` and `LandingScreen.css` use semantic HTML, CSS, and a single animation-frame loop for the sticky phone scene. The CSS import is web-only.
- Native: `src/features/auth/LandingScreen.tsx` uses React Native views and Reanimated for orbit and scroll-driven gathering; it does not import DOM or CSS modules.
- Shared: `src/features/landing/PhonePreview.tsx`, `LandingHeader.tsx`, and `src/components/BrandMark.tsx` supply the illustrative phone frames, app-icon header, and brand treatment.
- The three devices are stylized illustrations scaled for the composition, not dimensionally exact manufacturer renders. Screen content is a marketing preview rather than a live signed-in app inside each phone.

## Why These Three Phones

The latest complete quarterly model-sales ranking found as of September 10, 2026 is Counterpoint Research's **Q2 2026 global smartphone sell-through** ranking, published August 25, 2026. It ranks the iPhone 17 first, iPhone 17 Pro Max second, and iPhone 17 Pro third. The iPhone 17 represented 6% of global smartphone unit sales. This measures sales during that quarter, not the worldwide installed base or all-time popularity. [Counterpoint primary source](https://counterpointresearch.com/en/insights/global-smartphone-sales-top-10-best-sellers)

| Rank | Model | Official Front/Body Reference |
| --- | --- | --- |
| 1 | iPhone 17 | 6.3-inch display, Dynamic Island, rounded display corners; body 149.6 × 71.5 mm |
| 2 | iPhone 17 Pro Max | 6.9-inch display, Dynamic Island, rounded display corners; body 163.4 × 78 mm |
| 3 | iPhone 17 Pro | 6.3-inch display, Dynamic Island, rounded display corners; body 150 × 71.9 mm |

Apple lists Sage among the iPhone 17 finishes, and Cosmic Orange/Silver among the Pro finishes. These informed the illustrative rim colors. All three use a pill-shaped Dynamic Island rather than a notch or single circular punch-hole. [Apple iPhone 17 specifications](https://www.apple.com/iphone-17/specs/), [Apple iPhone 17 Pro/Pro Max specifications](https://www.apple.com/iphone-17-pro/specs/)

Both implementations keep the iPhone 17 as phone index zero and preserve it when the other two fade away, ending the sequence on the highest-selling model. The orbit does not imply a fixed linear ranking order.

## Source Audit

The bounded source review covered both landing implementations, their CSS, shared phone/header components, and the optional brand color. The React best-practices checklist was used for lifecycle, motion, accessibility, and rendering concerns.

- Web scroll updates use one scheduled animation frame and passive scroll observation; transforms and opacity update directly without per-frame React state changes. Event listeners, animation frames, and the resize observer are cleaned up.
- Web continuous orbit stops when paused, reduced motion is requested, the document is hidden, or the scene is past its gathering phase. Reduced-motion CSS also disables the marquee animation and decorative transitions.
- Native motion uses Reanimated shared values, cancels repeated animation when paused, beyond the hero phase, or while its privacy modal is open, and provides a reduced-motion branch.
- A web skip link leads past the animated sequence. Action controls have text or accessible labels, focus styles are defined, and privacy uses a labeled dialog. Phone internals are decorative rather than dozens of focusable miniature controls.
- The native layout includes safe-area spacing, labeled actions, a pause control, and a privacy modal. Successful native bundling does not establish physical-device interaction or assistive-technology behavior.
- Web measures the preserved header height and uses it for sticky positioning and section navigation. Mobile phone scale and orbit radius are bounded by available width. Native uses two fitted headline lines, measured heading height, and a width-bounded orbit radius.
- Feature and pricing sections carry the pink treatment through the web page with blush `#FFE8EE`. The footer provides working section navigation, privacy information, demo entry, and return-to-top actions; native provides corresponding section, privacy, sign-in, and top actions.

### Final Hero Contrast Bounds

The earlier bright gradient stops failed the large-text threshold and were replaced. Web now uses `#F45B73`, `#F4506B`, and `#F04969`; native uses `#F45B73`, `#F4506B`, and `#EE3E66`. Both use white headline words and `#17191F` dark text. WCAG requires at least 3:1 for large text and 4.5:1 for normal text. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

| Hero Text | Conservative Minimum | Threshold | Result |
| --- | --- | --- | --- |
| Web white headline, including grain | 3.106:1 | 3:1 | Passed |
| Web opaque dark text, including grain | 4.683:1 | 4.5:1 | Passed |
| Native white headline | 3.186:1 | 3:1 | Passed |
| Native dark text | 4.615:1 | 4.5:1 | Passed |

The web bound treats any grain pixel as fully white or fully black at the CSS layer opacity of 0.025, which is more conservative than the SVG's additional internal opacity. It blends those colors with the gradient channel extremes in sRGB, then calculates WCAG relative luminance. The brightest background determines the white-text minimum; the darkest determines the dark-text minimum. Resting phone-caption opacity reductions were removed and the orbit slogan changed to the same dark ink, bringing them under this bound. These source-color calculations cover resting, opaque text; they do not establish contrast for miniature artwork or fade-transition frames.

## Historical Static And Export Checks

Checks ran with the compatible bundled **Node 24.19.0** against the final platform-specific landing source, including measured header offsets, bounded mobile phone sizing, and the revised native title and motion behavior. The all-platform export was refreshed after the mobile heading whitespace correction. A final web-only export includes the subsequent caption/slogan contrast and narrow pricing-grid CSS fixes; those changes do not affect native code, types, or linted logic.

| Check | Result | Scope |
| --- | --- | --- |
| `npm run typecheck` | Passed, exit 0 | Landing TypeScript and shared project source, including CSS module declaration |
| `npm run lint` | Passed, exit 0, no diagnostics | Configured project lint rules |
| `npx expo export --platform all --output-dir .local-tools/landing-export` | Passed, exit 0 | Web CSS/JS and both native Hermes bundles |
| `npx expo export --platform web --output-dir .local-tools/landing-export-web` | Passed, exit 0 | Final web CSS/text, preserving the current native export directory |
| Export artifact inspection | Passed | Final web CSS 16,931 bytes; web JS 2,559,234 bytes; iOS bundle 4,106,854 bytes; Android bundle 4,301,406 bytes |
| Export ignore rules | Confirmed | Both export directories are git-ignored |

The all-platform export reported web 1,311 modules, iOS 1,796, and Android 1,898; the final web refresh reported 1,444 modules. Final native artifacts are in `.local-tools/landing-export`; final web artifacts are in `.local-tools/landing-export-web`. The only export warnings concerned the terminal environment setting both `NO_COLOR` and `FORCE_COLOR`. No dependencies were changed. Domain tests were not repeated because the landing work did not alter domain behavior; the prior prototype verification records 15 passing tests.

## Historical Visual QA And Limits

The coordinating agent checked the final source in Chrome at `localhost:8082`.

| Browser Check | Observed Result |
| --- | --- |
| Mobile layout at 390 × 844 and 320 × 740 | No document overflow; at 320 px, every plan's `scrollWidth` equaled its `clientWidth` after the pricing-grid fix |
| Continuous motion and pause | All three phone transforms changed during live rotation; paused transforms stayed identical across successive observations |
| Gathering at 390 px | At scroll position 844, the phase was `gather`, stage top and header bottom both measured 96 px, and a nonleading phone had opacity 0.317353 |
| Final single-phone state at 390 px | At scroll position 1181.6, the phase was `focus`; only iPhone 17 remained visible at opacity 1, the others were hidden at opacity 0, and the centered phone had no 3D tilt; screenshot reviewed |
| Footer pricing navigation at 320 px | The plans section landed at 95.1 px against the 96 px header boundary |
| Privacy dialog at 320 px | Correctly labeled, scrollable, and closed with Escape |
| Demo entry and return | A mobile plan action reached `/sign-in` with the expected demo choices; the Back button returned to the landing page |
| Browser console | No errors or warnings reported after the checked flow |
| Desktop at 1452 × 927 | Initial carousel and preserved header screenshot reviewed; at scroll position 1460, the phase was `focus`, stage top measured 96 px, only iPhone 17 was visible, and there was no horizontal overflow; screenshot confirmed an upright, centered phone between the two copy columns |
| Desktop focus action and return | “Let’s meet someone” reached `/sign-in`; the Back button restored the landing page |
| Preserved header theme control | Toggle changed the page to `mx-dark` with header background `rgb(23,25,31)`, then restored `mx-light` with `rgb(246,247,249)` |
| Final preview state | No console errors or warnings; restored to `localhost:8082/`, scroll position 0, `orbit` phase, autoplay enabled, at the desktop viewport |

Reduced-motion branches were reviewed in source only: the available browser capabilities supported viewport resizing but not media-preference emulation. No native physical-device run was performed. These checks do not establish native accessibility, a complete keyboard/screen-reader audit, or motion smoothness across every browser and device.

The phone frames and previews do not imply that a signed iOS/Android app is available. Store distribution, real members, live recommendations, payments, and remote services remain outside this local prototype.
