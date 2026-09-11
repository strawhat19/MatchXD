from pathlib import Path
import html
import json
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, str(Path(__file__).parent / '.tools'))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'assets' / 'brand' / 'variants'
OUT.mkdir(parents=True, exist_ok=True)
FONTS = {
    'poppins': TTFont(HERE / 'fonts' / 'Poppins-ExtraBold.ttf'),
    'signature': TTFont(HERE / 'fonts' / 'SofiaSansExtraCondensed-BlackItalic.ttf'),
}
COLORS = {'ink': '#252831', 'paper': '#FAFAFC', 'coral': '#FA3D60', 'blush': '#FF9DAA'}
MANIFEST = []


def letters(text, font_name, cap_height, color, x, baseline, identifier, tracking=0):
    font = FONTS[font_name]
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    height = font['OS/2'].sCapHeight
    scale = cap_height / height
    paths = []
    cursor = x
    for index, character in enumerate(text):
        glyph_name = cmap[ord(character)]
        pen = SVGPathPen(glyphs)
        glyphs[glyph_name].draw(TransformPen(pen, (scale, 0, 0, -scale, cursor, baseline)))
        if pen.getCommands():
            paths.append(f'<path id="{identifier}-{index}-{character}" d="{pen.getCommands()}"/>')
        cursor += font['hmtx'][glyph_name][0] * scale + tracking
    return f'<g id="{identifier}" aria-label="{text}" fill="{color}">{"".join(paths)}</g>', cursor - tracking


def mark(x=0, y=0, scale=1, front='#FF9DAA', back='#FA3D60', identifier='connected-x'):
    return f'''<g id="{identifier}" transform="translate({x:.3f} {y:.3f}) scale({scale:.4f})">
      <circle id="{identifier}-front-head" cx="27" cy="12" r="10" fill="{front}"/>
      <circle id="{identifier}-back-head" cx="77" cy="12" r="10" fill="{back}"/>
      <path id="{identifier}-back-person" d="M10 104 L60 42 Q72 24 94 33 L42 96 Q36 104 24 104Z" fill="{back}"/>
      <path id="{identifier}-front-person" d="M12 33 Q33 24 46 42 L96 104H82 Q70 104 63 95Z" fill="{front}"/>
    </g>'''


def svg(name, width, height, body, title, description):
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{round(width)}" height="{round(height)}" viewBox="0 0 {width:.3f} {height:.3f}" role="img" aria-labelledby="title description">
  <title id="title">{html.escape(title)}</title>
  <desc id="description">{html.escape(description)}</desc>
  <metadata>MatchXD logo study. Original Connected X geometry retained. Lettering is editable vector paths; font licenses accompany the source kit.</metadata>
  {body}
</svg>'''
    (OUT / name).write_text(content, encoding='utf-8')
    root = ET.fromstring(content)
    assert not root.findall('.//{http://www.w3.org/2000/svg}text'), name
    assert not root.findall('.//{http://www.w3.org/2000/svg}image'), name
    assert 'http' not in body and 'data:' not in body, name
    MANIFEST.append({'file': name, 'title': title, 'width': round(width, 3), 'height': round(height, 3), 'outlined': True})


def wordmark(font_name='poppins', dark=False, signature=False):
    ink = COLORS['paper'] if dark else COLORS['ink']
    match, cursor = letters('MATCH', font_name, 122, ink, 16, 176, 'match-lettering', -2)
    scale = 1.64
    start_x = cursor + (8 if signature else 2) - 10 * scale
    front, back = ('#FFD7DB', '#FFFFFF') if dark else ('#FF9DAA', '#FA3D60')
    connected = mark(start_x, 176 - 104 * scale, scale, front, back)
    d, end = letters('D', 'poppins', 122, ink, start_x + 96 * scale + 7, 176, 'd-lettering')
    return match + connected + d, end + 18


for dark in (False, True):
    suffix = 'dark' if dark else 'light'
    body, width = wordmark(dark=dark)
    svg(f'01-connected-wordmark-{suffix}.svg', width, 202, body, f'MatchXD — Connected Wordmark ({suffix})', 'MATCH and D in Poppins ExtraBold outlines with the exact original two-person Connected X as the X. Transparent background.')
    body, width = wordmark('signature', dark=dark, signature=True)
    svg(f'04-forward-wordmark-{suffix}.svg', width, 202, body, f'MatchXD — Forward Signature ({suffix})', 'Distinctive condensed black italic MATCH lettering, original Connected X, and the same upright Poppins D. All lettering outlined. Transparent background.')
    body, width = wordmark(dark=dark)
    ink = COLORS['paper'] if dark else COLORS['ink']
    label, label_end = letters('XOXO', 'poppins', 21, ink, 0, 257, 'xoxo-signature', 6)
    offset = (width - label_end) / 2
    rule_color = '#7E5660' if dark else '#F2B1BC'
    label = f'<g id="xoxo-lockup" transform="translate({offset:.3f} 0)">{label}<path d="M-87 248H-22 M{label_end + 22:.3f} 248H{label_end + 87:.3f}" stroke="{rule_color}" stroke-width="2" stroke-linecap="round"/></g>'
    svg(f'05-xoxo-signature-{suffix}.svg', width, 286, body + label, f'MatchXD — XOXO Signature ({suffix})', 'Primary Connected X wordmark with a small spaced XOXO signature and blush rules. A secondary campaign lockup, not a replacement for the app icon.')

gradient = '<defs><linearGradient id="coral-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FF686C"/><stop offset="1" stop-color="#F33765"/></linearGradient></defs>'
svg('02-ink-mark.svg', 106, 110, mark(0, 2, 1, '#FFD7DB', '#000000'), 'MatchXD — Ink And Blush Mark', 'Original adaptive Connected X geometry. Only the original white head and white crossing person are changed to pure black; blush remains #FFD7DB. Transparent background.')
svg('02-ink-icon.svg', 120, 120, gradient + '<rect id="icon-background" width="120" height="120" rx="28" fill="url(#coral-gradient)"/>' + mark(26, 22, .66, '#FFD7DB', '#000000'), 'MatchXD — Ink And Blush Icon', 'Original coral gradient and original icon mark placement, with white parts changed to black and blush retained. Rounded-square display treatment.')
svg('03-circle-icon.svg', 120, 120, gradient + '<circle id="icon-background" cx="60" cy="60" r="60" fill="url(#coral-gradient)"/>' + mark(26, 22, .66, '#FFD7DB', '#FFFFFF'), 'MatchXD — Circular App Icon', 'A true circular application of the original coral gradient icon, preserving the white and blush Connected X geometry and placement. Transparent outside the circle.')
svg('03-circle-mark.svg', 120, 120, '<circle id="circle-outline" cx="60" cy="60" r="58.5" fill="none" stroke="#FA3D60" stroke-width="3"/>' + mark(26, 22, .66), 'MatchXD — Circular Outline Seal', 'Optional lightweight circular seal using the coral and blush Connected X. Transparent background, suitable as a secondary stamp.')
(HERE / 'manifest.json').write_text(json.dumps(MANIFEST, indent=2), encoding='utf-8')

cards = [
    ('01', 'Connected Wordmark', 'The most faithful evolution.', 'Poppins ExtraBold keeps the confident MATCH and D. The exact two-person symbol takes the X position; the dark version uses the adaptive icon’s white and blush.', '01-connected-wordmark-light.svg', '01-connected-wordmark-dark.svg', 'wordmark', ['Primary identity', 'Recommended']),
    ('02', 'Ink + Blush', 'A sharper contrast, the same connection.', 'Only the original white parts become pure black. The blush foreground person stays untouched. Both the transparent mark and a rounded app-icon treatment are included.', '02-ink-mark.svg', '02-ink-icon.svg', 'symbol', ['Transparent mark', 'App icon']),
    ('03', 'In The Round', 'Made for avatars, badges, and small spaces.', 'A genuine circular silhouette with transparent corners. The original coral gradient, white-and-blush symbol, and original internal placement stay intact.', '03-circle-icon.svg', '03-circle-mark.svg', 'symbol', ['Circular icon', 'Outline seal']),
    ('04', 'Forward Signature', 'A little more motion in the name.', 'Condensed black italic MATCH brings a distinctive, energetic rhythm. The Connected X and upright D stay consistent with the primary wordmark.', '04-forward-wordmark-light.svg', '04-forward-wordmark-dark.svg', 'wordmark', ['Distinctive font', 'Same X + D']),
    ('05', 'Signed, XOXO', 'A small signature with a warm personality.', 'A quiet XOXO line supports the main name. Use it on campaign artwork, welcome screens, or packaging; keep the simpler wordmark at small sizes.', '05-xoxo-signature-light.svg', '05-xoxo-signature-dark.svg', 'wordmark', ['Campaign lockup', 'Secondary identity']),
]
asset_prefix = '../../assets/brand/variants/'
card_html = []
for number, title, subtitle, description, light, dark, kind, tags in cards:
    links = [(light, 'Light SVG' if kind == 'wordmark' else tags[0]), (dark, 'Dark SVG' if kind == 'wordmark' else tags[1])]
    stage_labels = ['Light surface', 'Dark surface']
    stages = ''.join(f'<div class="stage {tone} {kind}"><span>{stage_labels[index]}</span><img src="{asset_prefix}{file}" alt="{html.escape(title)} — {tone} preview"/></div>' for index, (tone, file) in enumerate([('light', light), ('dark', dark)]))
    downloads = ''.join(f'<a href="{asset_prefix}{file}" download>{html.escape(label)} <span aria-hidden="true">↗</span></a>' for file, label in links)
    card_html.append(f'<article class="card card-{number}"><div class="card-heading"><span class="number">{number}</span><div><h2>{title}</h2><p class="subtitle">{subtitle}</p></div></div><div class="stages">{stages}</div><div class="card-bottom"><p>{description}</p><div class="downloads">{downloads}</div></div></article>')

gallery = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MatchXD — Logo Variants</title>
<style>
:root{color-scheme:light;--bg:#f7f6f3;--card:#fff;--ink:#252831;--muted:#626977;--line:#e7e5e2;--accent:#b92343}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Arial,Helvetica,sans-serif;line-height:1.5}body[data-theme=dark]{color-scheme:dark;--bg:#17191f;--card:#21242c;--ink:#fafafc;--muted:#b3b7c2;--line:#373b46;--accent:#ff8b9b}a{color:inherit}button,a{outline-offset:5px}main{max-width:1392px;padding:44px 48px 64px;margin:auto}header{display:flex;justify-content:space-between;align-items:center;gap:24px;padding-bottom:36px;border-bottom:1px solid var(--line)}.eyebrow{font-size:11px;letter-spacing:.26em;font-weight:700;text-transform:uppercase;color:var(--muted)}.theme{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:10px 16px;border-radius:22px;font:inherit;cursor:pointer}.intro{padding:56px 0 42px;max-width:780px}h1{font-size:clamp(36px,5.7vw,70px);line-height:1.07;letter-spacing:-.055em;margin:16px 0 22px;font-weight:750}h1 em{font-style:normal;color:var(--accent)}.intro p{max-width:600px;color:var(--muted);font-size:17px}.kit-note{display:flex;gap:9px;flex-wrap:wrap;margin-top:23px}.kit-note span{font-size:11px;border:1px solid var(--line);border-radius:18px;padding:6px 10px;background:var(--card);color:var(--muted)}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.card{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:var(--card)}.card-01{grid-column:1/-1}.card-heading{padding:23px 26px;display:flex;gap:17px;align-items:flex-start}.number{font-size:11px;color:var(--accent);padding-top:7px;letter-spacing:.08em}h2{font-size:24px;letter-spacing:-.04em;margin:0 0 4px}.subtitle{font-size:13px;color:var(--muted);margin:0}.stages{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.stage{min-width:0;height:195px;position:relative;padding:43px 22px 30px;display:flex;align-items:center;justify-content:center}.card-01 .stage{height:264px;padding:55px 40px}.stage.light{background:#fff}.stage.dark{background:#17191f}.stage>span{position:absolute;top:16px;left:20px;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#626977}.stage.dark>span{color:#a3a8b7}.stage img{display:block;width:100%;height:auto;max-height:100%;object-fit:contain}.stage.symbol img{width:120px;height:120px}.card-bottom{padding:23px 26px 25px}.card-bottom>p{color:var(--muted);font-size:13px;margin:0 0 21px;max-width:810px}.downloads{display:flex;gap:11px;flex-wrap:wrap}.downloads a{text-decoration:none;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:11px;font-weight:700;display:flex;gap:24px;align-items:center}.downloads a:hover{color:var(--accent);border-color:var(--accent)}.source{margin-top:32px;padding:26px;border:1px solid var(--line);border-radius:20px;display:flex;align-items:center;justify-content:space-between;gap:25px}.source h2{font-size:20px}.source p,footer{font-size:12px;color:var(--muted)}.source p{margin:8px 0 0;max-width:750px}.source a{white-space:nowrap;font-size:12px;color:var(--accent)}footer{margin-top:30px;display:flex;justify-content:space-between;gap:20px}footer a{color:var(--accent)}@media(max-width:850px){main{padding:25px 22px 40px}.grid{grid-template-columns:1fr}.intro{padding-top:38px}.stage{height:215px}.card-01 .stage{height:220px;padding:48px 22px}.source{align-items:flex-start;flex-direction:column}}@media(max-width:450px){.stages{grid-template-columns:1fr}.stage,.card-01 .stage{height:205px}.card-heading,.card-bottom{padding:20px}.source{padding:20px}footer{flex-direction:column}.theme{font-size:12px}header{gap:10px}}
</style></head><body><main>
<header><div class="eyebrow">MatchXD / Identity studies</div><button class="theme" type="button" aria-pressed="false" id="theme-toggle">View Dark Gallery</button></header>
<section class="intro"><div class="eyebrow">Five ways to carry the connection</div><h1>The same spark.<br><em>A few new signatures.</em></h1><p>Explorations built from the original Connected X. Compare each on light and dark surfaces, then download the editable vector artwork.</p><div class="kit-note"><span>Original mark geometry</span><span>Outlined typography</span><span>Transparent SVG artwork</span><span>No app changes</span></div></section>
<section class="grid" aria-label="Logo variations">''' + ''.join(card_html) + '''</section>
<aside class="source"><div><h2>A connection worth keeping.</h2><p>Start with 01 as the core wordmark and 03 for avatars. Every file has named vector groups and no external font or image dependency. The typography source fonts and their SIL Open Font Licenses are included with the design notes.</p></div><a href="../../public/assets/concepts/MatchXDv1.png">Open Original Concept ↗</a></aside>
<footer><span>MatchXD · Logo exploration kit · September 2026</span><span><a href="README.md">Design & Editing Notes</a> · <a href="manifest.json">Asset Manifest</a></span></footer>
</main><script>const button=document.getElementById('theme-toggle');button.addEventListener('click',()=>{const dark=document.body.dataset.theme!=='dark';document.body.dataset.theme=dark?'dark':'light';button.setAttribute('aria-pressed',String(dark));button.textContent=dark?'View Light Gallery':'View Dark Gallery';});</script></body></html>'''
(HERE / 'index.html').write_text(gallery, encoding='utf-8')
print(json.dumps({'svg_count': len(MANIFEST), 'gallery': str(HERE / 'index.html'), 'assets': str(OUT)}, indent=2))
