const sharp = require('sharp');

const width = 1200;
const height = 630;

// Create SVG for the OG image
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
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="300" fill="url(#glow)"/>
  <circle cx="1100" cy="530" r="250" fill="url(#glow)"/>
  
  <!-- Cricket ball decoration -->
  <circle cx="1050" cy="150" r="60" fill="#e94560" opacity="0.15"/>
  <circle cx="1050" cy="150" r="40" fill="#e94560" opacity="0.1"/>
  
  <!-- Main Title -->
  <text x="80" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="#ffffff">🏏 IPL 2026</text>
  <text x="80" y="290" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="#e94560">Auction Game</text>
  
  <!-- Subtitle -->
  <text x="80" y="360" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.7)">Bid on real players. Build your dream squad.</text>
  <text x="80" y="400" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.7)">Play with friends in real-time!</text>
  
  <!-- Features -->
  <text x="80" y="490" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.5)">⚡ Real-time Bidding  •  🤖 AI Bots  •  🏆 Live Leaderboard</text>
  
  <!-- Author -->
  <text x="80" y="570" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.4)">Built by Sounak Das</text>
  
  <!-- Right side team colors strip -->
  <rect x="1100" y="0" width="20" height="${height}" fill="#f4c430"/>
  <rect x="1120" y="0" width="20" height="${height}" fill="#004ba0"/>
  <rect x="1140" y="0" width="20" height="${height}" fill="#ec1c24"/>
  <rect x="1160" y="0" width="20" height="${height}" fill="#3a225d"/>
  <rect x="1180" y="0" width="20" height="${height}" fill="#f26522"/>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/og-image.png')
  .then(() => console.log('✅ OG image generated: public/og-image.png'))
  .catch(err => console.error('❌ Error:', err));
