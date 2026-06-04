# Multiplayer Sports Auction Game — Client

> React + Vite frontend for the real-time multiplayer sports-auction game. Pick **Cricket (IPL)** or **Football (EPL + LaLiga)**, create a room, and bid with friends.

Backend (Socket.io server + full project docs) lives at **[ipl-auction-server](https://github.com/LittleBoy9/ipl-auction-server)**.

---

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:5173 (needs the server running on :3001)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

---

## Environment

Create `.env`:

```
VITE_SERVER_URL=http://localhost:3001        # local dev
# VITE_SERVER_URL=https://your-server.com    # production (your server URL)
```

> Vite env vars must be prefixed `VITE_` to reach the client.

---

## Structure

```
src/
├── App.jsx                # sport state, ?sport= URL param, header
├── data/
│   ├── sports.js          # per-sport display config (money, stars, stats, franchises)
│   └── team-logos.json    # cached team crest URLs (TheSportsDB)
├── components/            # StadiumBackground, StadiumScene (SVG), Confetti
├── context/SocketContext.jsx
└── pages/                 # Lobby, AuctionRoom
public/
├── robots.txt · sitemap.xml · og-image.png   # SEO / social
└── teams/                 # local franchise badge fallbacks
scripts/
└── fetch-team-logos.mjs   # one-time: fetch team crests for both sports
generate-og.cjs            # builds public/og-image.png (social share card)
```

- **`?sport=football`** preselects the sport on load (shareable / bookmarkable).
- Team crests & player photos come from the server's cached TheSportsDB URLs, with monogram / initials fallbacks.

---

## Deploy (Vercel)

1. Import this repo in Vercel.
2. **Framework Preset** → Vite · **Root Directory** → `client` (if the repo isn't the client folder itself).
3. Env var: `VITE_SERVER_URL=https://your-server.com`.
4. Deploy. Auto-deploys on every push to `main`.

> After pointing a custom domain, update the placeholder `vercel.app` URLs in `index.html` (canonical/OG) and `public/sitemap.xml`, then re-scrape via the Facebook/LinkedIn debuggers.
