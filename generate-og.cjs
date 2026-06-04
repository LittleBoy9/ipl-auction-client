const sharp = require('sharp');

const width = 1200;
const height = 630;

// Multi-sport social share image (cricket + football). Ball icons are drawn as
// vector shapes (not emoji) so they render reliably via librsvg/sharp.
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="50%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e94560;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#533483;stop-opacity:0.1"/>
    </linearGradient>
    <radialGradient id="cball" cx="38%" cy="34%" r="70%">
      <stop offset="0%" style="stop-color:#e35d6a"/>
      <stop offset="100%" style="stop-color:#a4161a"/>
    </radialGradient>
    <radialGradient id="fball" cx="38%" cy="34%" r="70%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#c9ced6"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <circle cx="100" cy="100" r="300" fill="url(#glow)"/>
  <circle cx="1100" cy="530" r="250" fill="url(#glow)"/>

  <!-- Cricket ball (top-right) -->
  <circle cx="1015" cy="150" r="58" fill="url(#cball)"/>
  <path d="M 962 138 Q 1015 128 1068 138" stroke="#ffe8b0" stroke-width="3" fill="none" opacity="0.85"/>
  <path d="M 962 162 Q 1015 172 1068 162" stroke="#ffe8b0" stroke-width="3" fill="none" opacity="0.85"/>

  <!-- Football (lower-right) -->
  <circle cx="1085" cy="455" r="58" fill="url(#fball)"/>
  <polygon points="1085,430 1107,446 1099,472 1071,472 1063,446" fill="#1a1a2e"/>
  <path d="M 1085 388 L 1085 430 M 1133 444 L 1107 460 M 1115 503 L 1099 477 M 1055 503 L 1071 477 M 1037 444 L 1063 460"
        stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.85"/>

  <!-- Main Title -->
  <text x="80" y="205" font-family="Arial, sans-serif" font-size="78" font-weight="900" fill="#ffffff">SPORTS</text>
  <text x="80" y="298" font-family="Arial, sans-serif" font-size="78" font-weight="900" fill="#e94560">AUCTION GAME</text>

  <!-- Subtitle -->
  <text x="82" y="362" font-family="Arial, sans-serif" font-size="27" fill="rgba(255,255,255,0.75)">Bid on cricket (IPL) &amp; football (EPL · LaLiga) stars.</text>
  <text x="82" y="402" font-family="Arial, sans-serif" font-size="27" fill="rgba(255,255,255,0.75)">Build your dream squad with friends — live!</text>

  <!-- Features -->
  <text x="82" y="492" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.5)">⚡ Real-time Bidding   •   AI Bots   •   Live Leaderboard</text>

  <!-- Author -->
  <text x="82" y="572" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.4)">Built by Sounak Das</text>

  <!-- Right colour strip: cricket + football clubs -->
  <rect x="1100" y="0" width="16" height="${height}" fill="#f4c430"/>
  <rect x="1116" y="0" width="16" height="${height}" fill="#004ba0"/>
  <rect x="1132" y="0" width="16" height="${height}" fill="#c8102e"/>
  <rect x="1148" y="0" width="16" height="${height}" fill="#6caddf"/>
  <rect x="1164" y="0" width="16" height="${height}" fill="#a50044"/>
  <rect x="1180" y="0" width="20" height="${height}" fill="#febe10"/>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/og-image.png')
  .then(() => console.log('✅ OG image generated: public/og-image.png'))
  .catch(err => console.error('❌ Error:', err));
