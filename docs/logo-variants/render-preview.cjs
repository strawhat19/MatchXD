const fs = require(`node:fs`);
const path = require(`node:path`);
const sharp = require(process.env.MATCHXD_SHARP_PATH || `sharp`);

const output = __dirname;
const assets = path.resolve(output, `../../assets/brand/variants`);
const rows = [
  [`01  CONNECTED WORDMARK`, `01-connected-wordmark-light.svg`, `01-connected-wordmark-dark.svg`],
  [`02  INK + BLUSH`, `02-ink-mark.svg`, `02-ink-icon.svg`],
  [`03  IN THE ROUND`, `03-circle-icon.svg`, `03-circle-mark.svg`],
  [`04  FORWARD SIGNATURE`, `04-forward-wordmark-light.svg`, `04-forward-wordmark-dark.svg`],
  [`05  SIGNED, XOXO`, `05-xoxo-signature-light.svg`, `05-xoxo-signature-dark.svg`],
];

(async () => {
  const overlays = [];
  for (let row = 0; row < rows.length; row++) {
    for (let side = 0; side < 2; side++) {
      const filename = rows[row][side + 1];
      const width = filename.includes(`wordmark`) || filename.includes(`signature`) ? 600 : 176;
      const buffer = await sharp(fs.readFileSync(path.join(assets, filename))).resize({ width, height: 202, fit: `inside` }).png().toBuffer();
      const dimensions = await sharp(buffer).metadata();
      const left = side * 700 + Math.round((700 - dimensions.width) / 2);
      const top = row * 280 + 65 + Math.round((202 - dimensions.height) / 2);
      overlays.push({ input: buffer, left, top });
    }
  }
  const background = `<svg width="1400" height="1400" xmlns="http://www.w3.org/2000/svg"><rect width="1400" height="1400" fill="#FFFFFF"/><rect x="700" width="700" height="1400" fill="#17191F"/>${rows.map((row, index) => `<text x="32" y="${index * 280 + 35}" fill="#626977" font-family="Arial" font-size="14" letter-spacing="2">${row[0]}</text><text x="732" y="${index * 280 + 35}" fill="#A3A8B7" font-family="Arial" font-size="14" letter-spacing="2">${row[0]}</text><path d="M0 ${index * 280}H1400" stroke="#9299A0" stroke-opacity=".18"/>`).join(``)}</svg>`;
  await sharp(Buffer.from(background)).composite(overlays).png().toFile(path.join(output, `logo-variants-preview.png`));
  console.log(`Rendered Ten Standalone SVG Previews`);
})().catch(error => { console.error(error); process.exitCode = 1; });
