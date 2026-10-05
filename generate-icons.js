import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Industrial Obsidian Dark -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181A1F" />
      <stop offset="100%" stop-color="#0E1013" />
    </linearGradient>

    <!-- ZZZ Electric Yellow Gradient -->
    <linearGradient id="zzzYellow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5FF47" />
      <stop offset="100%" stop-color="#E8F624" />
    </linearGradient>

    <!-- Hazard Stripe Pattern for ZZZ Street Tech -->
    <pattern id="hazardStripe" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="10" height="20" fill="#E8F624"/>
      <rect x="10" width="10" height="20" fill="#000000"/>
    </pattern>

    <!-- Drop Shadow for cassette shell -->
    <filter id="chassisShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="0" flood-color="#000000" flood-opacity="1"/>
    </filter>
  </defs>

  <!-- Solid Opaque Background for iOS & PWA Maskable -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- Outer Industrial Frame Plate -->
  <rect x="28" y="28" width="456" height="456" rx="64" fill="#14161A" stroke="#000000" stroke-width="6" />

  <!-- Corner Rivets / Screws -->
  <g fill="#2A2E35" stroke="#000000" stroke-width="3">
    <!-- Top-Left -->
    <circle cx="68" cy="68" r="10" />
    <path d="M63 68h10M68 63v10" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Top-Right -->
    <circle cx="444" cy="68" r="10" />
    <path d="M439 68h10M444 63v10" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Bottom-Left -->
    <circle cx="68" cy="444" r="10" />
    <path d="M63 444h10M68 439v10" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Bottom-Right -->
    <circle cx="444" cy="444" r="10" />
    <path d="M439 444h10M444 439v10" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- Top Tech Badge: "CAL // DECK" and "● REC" -->
  <g transform="translate(68, 60)">
    <rect x="0" y="0" width="134" height="20" rx="4" fill="#0C0D10" stroke="#000000" stroke-width="2"/>
    <text x="10" y="14" font-family="'JetBrains Mono', 'SF Mono', monospace" font-size="11" font-weight="900" fill="#E8F624" letter-spacing="1">CAL // DECK</text>
  </g>
  <g transform="translate(356, 60)">
    <rect x="0" y="0" width="88" height="20" rx="4" fill="#E03030" stroke="#000000" stroke-width="2"/>
    <text x="13" y="14" font-family="'JetBrains Mono', 'SF Mono', monospace" font-size="11" font-weight="900" fill="#FFFFFF" letter-spacing="1">● REC</text>
  </g>

  <!-- MAIN CASSETTE CHASSIS -->
  <g filter="url(#chassisShadow)">
    <!-- Cassette Base Body: High-voltage ZZZ Yellow -->
    <path d="
      M 96,128 
      L 416,128 
      A 28,28 0 0 1 444,156 
      L 444,324 
      A 28,28 0 0 1 416,352 
      L 364,352 
      L 348,396 
      L 164,396 
      L 148,352 
      L 96,352 
      A 28,28 0 0 1 68,324 
      L 68,156 
      A 28,28 0 0 1 96,128 
      Z
    " fill="url(#zzzYellow)" stroke="#000000" stroke-width="12" stroke-linejoin="round" />

    <!-- Top Notches on Cassette -->
    <rect x="108" y="128" width="44" height="12" fill="#181A1F" stroke="#000000" stroke-width="5" />
    <rect x="360" y="128" width="44" height="12" fill="#181A1F" stroke="#000000" stroke-width="5" />

    <!-- Cassette Label Inset (Deep matte panel) -->
    <rect x="96" y="156" width="320" height="172" rx="16" fill="#15171C" stroke="#000000" stroke-width="8" />

    <!-- Inset Label Decorative Accents: Left Hazard Stripe -->
    <rect x="106" y="166" width="16" height="152" rx="4" fill="url(#hazardStripe)" stroke="#000000" stroke-width="2"/>

    <!-- Inset Label Header Text -->
    <text x="134" y="188" font-family="'JetBrains Mono', 'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" letter-spacing="1">SHIFT<tspan fill="#E8F624">CAL</tspan></text>
    <text x="350" y="188" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="800" fill="#E8F624" letter-spacing="0.5">PRO-90</text>
    <line x1="134" y1="196" x2="406" y2="196" stroke="#2A2E35" stroke-width="3" />

    <!-- Cassette Center Tape Window (Recessed Slot) -->
    <g transform="translate(132, 206)">
      <!-- Window Frame -->
      <rect x="0" y="0" width="248" height="96" rx="14" fill="#0C0D10" stroke="#000000" stroke-width="6" />

      <!-- Calendar / Shift Grid Marks in background of window -->
      <g stroke="#262930" stroke-width="1.5">
        <line x1="124" y1="12" x2="124" y2="84" stroke-dasharray="3 3"/>
        <line x1="20" y1="48" x2="228" y2="48" stroke-dasharray="4 4"/>
      </g>

      <!-- Tape Spool Connecting Bridge -->
      <path d="M 52,48 L 196,48" stroke="#E8F624" stroke-width="8" stroke-opacity="0.3" />
      <path d="M 52,48 L 196,48" stroke="#000000" stroke-width="3" />

      <!-- Left Wheel Spool -->
      <g transform="translate(52, 48)">
        <!-- Wheel Outer Ring -->
        <circle cx="0" cy="0" r="28" fill="#E8F624" stroke="#000000" stroke-width="5" />
        <!-- Wheel Inner Core -->
        <circle cx="0" cy="0" r="14" fill="#0C0D10" stroke="#000000" stroke-width="4" />
        <!-- Gear Spokes (cross) -->
        <rect x="-3" y="-12" width="6" height="24" fill="#E8F624" />
        <rect x="-12" y="-3" width="24" height="6" fill="#E8F624" />
      </g>

      <!-- Right Wheel Spool -->
      <g transform="translate(196, 48)">
        <!-- Wheel Outer Ring -->
        <circle cx="0" cy="0" r="28" fill="#E8F624" stroke="#000000" stroke-width="5" />
        <!-- Wheel Inner Core -->
        <circle cx="0" cy="0" r="14" fill="#0C0D10" stroke="#000000" stroke-width="4" />
        <!-- Gear Spokes (cross) -->
        <rect x="-3" y="-12" width="6" height="24" fill="#E8F624" />
        <rect x="-12" y="-3" width="24" height="6" fill="#E8F624" />
      </g>
    </g>

    <!-- Trapezoid Base Details (Bottom of Cassette) -->
    <!-- Two Guide Holes in Bottom Trapezoid -->
    <circle cx="212" cy="374" r="8" fill="#15171C" stroke="#000000" stroke-width="4" />
    <circle cx="300" cy="374" r="8" fill="#15171C" stroke="#000000" stroke-width="4" />
    <!-- Tape Head Center Notch -->
    <rect x="238" y="364" width="36" height="24" rx="4" fill="#E03030" stroke="#000000" stroke-width="4" />
  </g>
</svg>
`.trim();

// Dedicated crisp Favicon SVG optimized for small displays (16px - 64px)
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Rounded Base -->
  <rect width="64" height="64" rx="14" fill="#111215" stroke="#000000" stroke-width="2"/>
  
  <!-- Outer Cassette Frame in Electric Yellow -->
  <rect x="6" y="12" width="52" height="40" rx="8" fill="#E8F624" stroke="#000000" stroke-width="3"/>
  
  <!-- Cassette Tape Window -->
  <rect x="14" y="20" width="36" height="24" rx="4" fill="#111215" stroke="#000000" stroke-width="2.5"/>
  
  <!-- Two Yellow Spools -->
  <circle cx="24" cy="32" r="5" fill="#E8F624" stroke="#000000" stroke-width="1.5"/>
  <circle cx="40" cy="32" r="5" fill="#E8F624" stroke="#000000" stroke-width="1.5"/>
  <line x1="24" y1="32" x2="40" y2="32" stroke="#E8F624" stroke-width="1.5"/>
  
  <!-- Red Recording Dot on Top Right -->
  <circle cx="50" cy="18" r="2.5" fill="#E03030" stroke="#000000" stroke-width="1"/>
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
