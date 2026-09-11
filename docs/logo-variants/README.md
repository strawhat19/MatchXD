# MatchXD Logo Variants

Open [the review gallery](index.html) in a browser. It works directly from disk and includes light/dark previews, a gallery theme switch, and SVG download links. The [contact sheet](logo-variants-preview.png) shows all ten assets together.

## The Five Directions

| Direction | Files in `assets/brand/variants/` | Intended Use |
| --- | --- | --- |
| **01 · Connected Wordmark** | `01-connected-wordmark-light.svg`, `01-connected-wordmark-dark.svg` | Recommended core wordmark: MATCH + original Connected X + D |
| **02 · Ink + Blush** | `02-ink-mark.svg`, `02-ink-icon.svg` | Original white parts become pure black; original blush stays intact |
| **03 · In The Round** | `03-circle-icon.svg`, `03-circle-mark.svg` | Original app icon in a true circle, plus a lightweight outline seal |
| **04 · Forward Signature** | `04-forward-wordmark-light.svg`, `04-forward-wordmark-dark.svg` | Distinctive condensed italic MATCH, with the same Connected X and upright D |
| **05 · Signed, XOXO** | `05-xoxo-signature-light.svg`, `05-xoxo-signature-dark.svg` | Secondary wordmark with a small XOXO signature for campaigns and welcome artwork |

Use **01** for the primary identity and **03** where a circular avatar or badge works better. **04** is an expressive alternative. **05** adds personality without changing how the main name reads.

The light versions use charcoal lettering with the coral/blush Connected X. Dark versions use off-white lettering and the adaptive icon's white/blush mark. The suffix names describe the intended background; the SVG backgrounds themselves are transparent.

## Source And Fidelity

- Original vector: `assets/brand/icon.svg`
- Original transparent adaptive artwork: `assets/brand/adaptive-icon.png`
- Original brand reference: `public/assets/concepts/MatchXDv1.png`
- The Connected X retains both original circle centers/radii and both original crossing-person paths. It has not been traced from the PNG or replaced with a font X.
- Icon variants retain the original internal `translate(26 22) scale(.66)` placement. The rounded-square treatment uses a 28-unit corner radius; the circular treatment replaces only the background silhouette.
- Variant 02 changes `white`/`#FFFFFF` to `#000000` while preserving `#FFD7DB`. This is intentionally a two-color mark, not an all-black monochrome.
- No current application components or original brand files are changed by this kit.

## Editing And Export

All ten SVGs contain editable vector geometry with named groups and individual letter paths. They have no linked raster images, external stylesheets, scripts, or font dependencies. Open them in Figma, Illustrator, Inkscape, or another SVG editor to adjust color, scale, spacing, or individual paths.

Lettering has been converted to outlines for portability. It is not live text. To change the wording, regenerate from the included source fonts or replace the letter paths in an editor. Keep the complete Connected X group together when resizing so the crossing shapes retain their proportions.

Suggested review sizes: use the core wordmark at 180 px wide or larger; use the XOXO lockup at 280 px wide or larger so its secondary line stays readable. Prefer the app icon or standalone mark at smaller sizes. These are design suggestions, not a tested production minimum-size standard.

The circular SVG has transparent corners for web/social use. Platform submission icons may require square export canvases and platform-specific masking; this preview asset is not a replacement for an app-store export configuration.

## Fonts And Licenses

- **Poppins ExtraBold**: copied from the existing local `@expo-google-fonts/poppins` dependency. Copyright 2020 The Poppins Project Authors. [SIL Open Font License](fonts/Poppins-OFL.txt).
- **Sofia Sans Extra Condensed Black Italic**: copied from the neighboring local CreativeWorkshop repository's font assets. Copyright 2019 The Sofia Sans Project Authors. [SIL Open Font License](fonts/SofiaSans-OFL.txt).

Both font sources and their original OFL notices are included in `fonts/`. The SVG outputs require neither font to be installed. The OFL documents explicitly distinguish created documents/artwork from the font software itself. Retain the license notices when redistributing the included font files; do not sell the font files by themselves. No proprietary or unlicensed system fonts were embedded in the SVGs.

## Regeneration And Verification

The generator writes only this documentation folder and `assets/brand/variants/`.

```powershell
python -m pip install --target docs/logo-variants/.tools fonttools
python docs/logo-variants/generate.py
```

`generate.py` outlines the lettering, preserves the original mark geometry, validates SVG XML, rejects live `<text>` and raster `<image>` elements, and writes [the manifest](manifest.json). `render-preview.cjs` optionally uses Sharp to render every standalone SVG into the PNG contact sheet. Set `MATCHXD_SHARP_PATH` to an installed Sharp module path if it is not resolvable locally.

Verification performed: all ten SVGs parsed, contained unique element IDs, had no external font/image references, and rendered successfully through Sharp. The contact sheet was visually inspected for clipping, alignment, proportions, and color treatment. Gallery download/reference links were checked against files on disk. No application build or development server was run.
