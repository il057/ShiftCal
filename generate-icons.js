import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background: Deep Industrial Obsidian -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181A1F" />
      <stop offset="100%" stop-color="#0E1012" />
    </linearGradient>

    <!-- ZZZ High-Voltage Electric Yellow -->
    <linearGradient id="zzzYellow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5FF47" />
      <stop offset="100%" stop-color="#E8F624" />
    </linearGradient>

    <!-- Solid Industrial Drop Shadow for tactile punch -->
    <filter id="cassetteShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="20" stdDeviation="0" flood-color="#000000" flood-opacity="1"/>
    </filter>
  </defs>

  <!-- Solid Opaque Background for Apple Touch & PWA Maskable -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- MAIN BOLD ROBOT / CASSETTE BOT (o-o face, flat bottom, zero skull look) -->
  <g filter="url(#cassetteShadow)" transform="translate(0, -2)">
    <!-- Top-Right Red Antenna / REC Tag -->
    <rect x="330" y="100" width="62" height="26" rx="8" fill="#E03030" stroke="#000000" stroke-width="12" stroke-linejoin="round" />

    <!-- Robot Main Body: Clean rounded chassis without bottom protrusion -->
    <rect x="80" y="118" width="352" height="274" rx="46" fill="url(#zzzYellow)" stroke="#000000" stroke-width="14" stroke-linejoin="round" />

    <!-- Top Mechanical Notches / Ears -->
    <rect x="132" y="118" width="48" height="14" rx="4" fill="#111215" stroke="#000000" stroke-width="6" />
    <rect x="232" y="118" width="48" height="14" rx="4" fill="#111215" stroke="#000000" stroke-width="6" />

    <!-- Robot Face Screen (Deep Obsidian Visor) -->
    <rect x="116" y="162" width="280" height="186" rx="30" fill="#111215" stroke="#000000" stroke-width="12" />

    <!-- Cute o-o Eyes Connecting Bridge / Glasses Bridge -->
    <line x1="184" y1="255" x2="328" y2="255" stroke="#000000" stroke-width="14" stroke-linecap="round" />
    <line x1="184" y1="255" x2="328" y2="255" stroke="#E8F624" stroke-width="8" stroke-linecap="round" />

    <!-- Left o-o Robot Eye -->
    <g transform="translate(192, 255)">
      <circle cx="0" cy="0" r="42" fill="#E8F624" stroke="#000000" stroke-width="10" />
      <circle cx="0" cy="0" r="18" fill="#111215" stroke="#000000" stroke-width="6" />
    </g>

    <!-- Right o-o Robot Eye -->
    <g transform="translate(320, 255)">
      <circle cx="0" cy="0" r="42" fill="#E8F624" stroke="#000000" stroke-width="10" />
      <circle cx="0" cy="0" r="18" fill="#111215" stroke="#000000" stroke-width="6" />
    </g>
  </g>
</svg>
`.trim();

// Dedicated crisp Favicon SVG optimized for small displays (16px - 64px)
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Rounded Base for browser tabs -->
  <rect width="64" height="64" rx="16" fill="#111215" />
  
  <!-- Red Antenna Tag -->
  <rect x="40" y="9" width="12" height="6" rx="2" fill="#E03030" stroke="#000000" stroke-width="1.5"/>

  <!-- Robot Head in Electric Yellow (Flat clean bottom) -->
  <rect x="7" y="13" width="50" height="38" rx="10" fill="#E8F624" stroke="#000000" stroke-width="3.5" />
  
  <!-- Face Screen -->
  <rect x="13" y="19" width="38" height="26" rx="6" fill="#111215" stroke="#000000" stroke-width="3"/>
  
  <!-- Cute o-o Eyes -->
  <line x1="22" y1="32" x2="42" y2="32" stroke="#E8F624" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="23" cy="32" r="5.5" fill="#E8F624" stroke="#000000" stroke-width="2"/>
  <circle cx="41" cy="32" r="5.5" fill="#E8F624" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

async function run() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG versions
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), iconSvg);

  const svgBuffer = Buffer.from(iconSvg);
  const faviconBuffer = Buffer.from(faviconSvg);

  // Generate PNGs - with high quality rendering for iOS & PWA
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(faviconBuffer).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated all ZZZ-themed PWA & iOS touch icons in PNG and SVG formats!');
}

run().catch(console.error);
