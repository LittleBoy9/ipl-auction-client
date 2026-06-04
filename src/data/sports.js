// ============================================================================
// Sport config registry (client-side DISPLAY logic)
// ----------------------------------------------------------------------------
// Parallels server/sports.js. The server owns authoritative game logic
// (valuation, increments, squad needs); this owns how things are rendered:
// money formatting, star ratings, the stat row, squad-balance labels,
// franchises, budget options. Keep increments/needs in sync with the server.
// ============================================================================

import TEAM_LOGOS from './team-logos.json';

// Prefer the fetched crest URL (scripts/fetch-team-logos.mjs); fall back to any
// local /teams/<code> file, then to the monogram badge in the UI.
const withLogos = (arr) => arr.map(f => ({ ...f, logo: TEAM_LOGOS[f.code] || f.logo || null }));

// ---- Cricket (IPL) ---------------------------------------------------------

const CRICKET_FRANCHISES = [
  { code: 'CSK', name: 'Chennai Super Kings', color: '#f4c430', logo: '/teams/csk.svg' },
  { code: 'MI', name: 'Mumbai Indians', color: '#004ba0', logo: '/teams/mi.svg' },
  { code: 'RCB', name: 'Royal Challengers', color: '#ec1c24', logo: '/teams/rcb.svg' },
  { code: 'KKR', name: 'Kolkata Knight Riders', color: '#3a225d', logo: '/teams/kkr.svg' },
  { code: 'SRH', name: 'Sunrisers Hyderabad', color: '#f26522', logo: '/teams/srh.svg' },
  { code: 'DC', name: 'Delhi Capitals', color: '#0078bc', logo: '/teams/dc.svg' },
  { code: 'PBKS', name: 'Punjab Kings', color: '#d71920', logo: '/teams/pbks.svg' },
  { code: 'RR', name: 'Rajasthan Royals', color: '#254aa5', logo: '/teams/rr.svg' },
  { code: 'LSG', name: 'Lucknow Super Giants', color: '#a5d8f0', logo: '/teams/lsg.svg' },
  { code: 'GT', name: 'Gujarat Titans', color: '#1b2133', logo: '/teams/gt.svg' },
];

const cricket = {
  id: 'cricket',
  label: 'IPL Cricket',
  icon: '🏏',
  unit: 'Cr', // input suffix for auto-bid
  franchises: withLogos(CRICKET_FRANCHISES),
  budgetOptions: [50, 75, 100, 120, 150, 200].map(v => ({ value: v, label: `₹${v} Cr` })),
  defaultBudget: 100,

  money(amount) {
    const a = Number(amount) || 0;
    if (a >= 1) return `₹${Number(a.toFixed(2))}Cr`;
    return `₹${Math.round(a * 100)}L`;
  },
  increment(current) {
    if (current < 0.50) return 0.05;
    if (current < 1.00) return 0.10;
    if (current < 5.00) return 0.25;
    return 0.30;
  },
  incrementLabel(current) {
    const inc = this.increment(current);
    return inc < 1 ? `+₹${Math.round(inc * 100)}L` : `+₹${inc}Cr`;
  },

  starRating(p) {
    let score = 50;
    if (p.battingAvg && p.strikeRate) score = Math.max(score, (p.battingAvg * p.strikeRate) / 100);
    if (p.wickets != null && p.economy) score = Math.max(score, p.wickets * (12 - Math.min(p.economy, 12)) * 3);
    if (p.basePrice >= 10) score += 15;
    else if (p.basePrice >= 5) score += 10;
    else if (p.basePrice >= 2) score += 5;
    if (score >= 90) return 5;
    if (score >= 70) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
  },
  playerScore(p) {
    let batScore = 0, bowlScore = 0;
    if (p.battingAvg && p.strikeRate) batScore = Math.min(100, (p.battingAvg * p.strikeRate) / 200);
    if (p.wickets != null && p.economy) bowlScore = Math.min(100, (p.wickets * (15 - Math.min(p.economy, 15)) / 15) * 8);
    if (p.role === 'Batter' || p.role === 'WK-Batter') return Math.round(batScore);
    if (p.role === 'Bowler') return Math.round(bowlScore);
    if (p.role === 'All-rounder') return Math.round((batScore + bowlScore) / 2);
    return Math.round(batScore || bowlScore || 50);
  },

  squadNeeds(team) {
    const c = { 'WK-Batter': 0, 'Batter': 0, 'Bowler': 0, 'All-rounder': 0 };
    (team || []).forEach(p => { if (c[p.role] !== undefined) c[p.role]++; });
    return [
      { key: 'wk', label: 'Wicket Keeper', short: 'WK', icon: '🧤', need: 1, have: c['WK-Batter'], match: p => p.role === 'WK-Batter' },
      { key: 'bat', label: 'Batters (incl WK)', short: 'Batter', icon: '🏏', need: 3, have: c['Batter'] + c['WK-Batter'], match: p => p.role === 'Batter' || p.role === 'WK-Batter' },
      { key: 'bowl', label: 'Bowlers', short: 'Bowler', icon: '🎯', need: 3, have: c['Bowler'], match: p => p.role === 'Bowler' },
      { key: 'ar', label: 'All-Rounders', short: 'All-rounder', icon: '⚡', need: 1, have: c['All-rounder'], match: p => p.role === 'All-rounder' },
    ];
  },

  statFields(p) {
    return [
      { label: 'M', value: p.matches },
      { label: 'Runs', value: p.runs },
      p.battingAvg ? { label: 'Avg', value: p.battingAvg } : null,
      p.strikeRate ? { label: 'SR', value: p.strikeRate } : null,
      p.wickets != null ? { label: 'Wkts', value: p.wickets } : null,
      p.economy ? { label: 'Econ', value: p.economy } : null,
    ].filter(s => s && s.value != null);
  },

  poolCategories: [
    { key: 'all', label: 'All' },
    { key: 'Batter', label: 'Batters' },
    { key: 'Bowler', label: 'Bowlers' },
    { key: 'All-rounder', label: 'All-Rounders' },
    { key: 'WK-Batter', label: 'WK-Batters' },
  ],
};

// ---- Football (EPL + LaLiga) ----------------------------------------------

// logo points at /teams/<code>.svg|png — drop a real crest file there to use it;
// the picker falls back to a coloured monogram badge if the file is missing.
const FOOTBALL_FRANCHISES = [
  { code: 'MCI', name: 'Manchester City', color: '#6caddf', logo: '/teams/mci.svg' },
  { code: 'ARS', name: 'Arsenal', color: '#ef0107', logo: '/teams/ars.svg' },
  { code: 'LIV', name: 'Liverpool', color: '#c8102e', logo: '/teams/liv.svg' },
  { code: 'MUN', name: 'Manchester United', color: '#da291c', logo: '/teams/mun.svg' },
  { code: 'CHE', name: 'Chelsea', color: '#034694', logo: '/teams/che.svg' },
  { code: 'TOT', name: 'Tottenham Hotspur', color: '#132257', logo: '/teams/tot.svg' },
  { code: 'NEW', name: 'Newcastle United', color: '#241f20', logo: '/teams/new.svg' },
  { code: 'AVL', name: 'Aston Villa', color: '#95bfe5', logo: '/teams/avl.svg' },
  { code: 'RMA', name: 'Real Madrid', color: '#cba135', logo: '/teams/rma.svg' },
  { code: 'BAR', name: 'FC Barcelona', color: '#a50044', logo: '/teams/bar.svg' },
  { code: 'ATM', name: 'Atlético Madrid', color: '#cb3524', logo: '/teams/atm.svg' },
  { code: 'ATH', name: 'Athletic Bilbao', color: '#ee2523', logo: '/teams/ath.svg' },
  { code: 'RSO', name: 'Real Sociedad', color: '#143c8b', logo: '/teams/rso.svg' },
  { code: 'VIL', name: 'Villarreal', color: '#d4a700', logo: '/teams/vil.svg' },
  { code: 'BET', name: 'Real Betis', color: '#00954c', logo: '/teams/bet.svg' },
  { code: 'SEV', name: 'Sevilla', color: '#d2122e', logo: '/teams/sev.svg' },
];

const football = {
  id: 'football',
  label: 'Football (EPL + LaLiga)',
  icon: '⚽',
  unit: 'M',
  franchises: withLogos(FOOTBALL_FRANCHISES),
  budgetOptions: [200, 300, 400, 500].map(v => ({ value: v, label: `€${v}M` })),
  defaultBudget: 300,

  money(amount) {
    const a = Number(amount) || 0;
    return `€${Number(a.toFixed(1))}M`;
  },
  increment(current) {
    if (current < 5) return 0.5;
    if (current < 20) return 1;
    if (current < 50) return 2.5;
    return 5;
  },
  incrementLabel(current) {
    return `+€${this.increment(current)}M`;
  },

  starRating(p) {
    let score = (p.rating ? (p.rating - 6) * 22 : 0);
    score += (p.goals || 0) * 0.8 + (p.assists || 0) * 0.5;
    if (p.basePrice >= 45) score += 20;
    else if (p.basePrice >= 25) score += 12;
    else if (p.basePrice >= 12) score += 6;
    if (score >= 90) return 5;
    if (score >= 70) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
  },
  playerScore(p) {
    const score = (p.rating ? (p.rating - 6) * 30 : 0) + (p.goals || 0) * 1 + (p.assists || 0) * 0.8;
    return Math.round(Math.min(100, Math.max(0, score)));
  },

  squadNeeds(team) {
    const c = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    (team || []).forEach(p => { if (c[p.role] !== undefined) c[p.role]++; });
    return [
      { key: 'gk', label: 'Goalkeeper', short: 'GK', icon: '🧤', need: 1, have: c.GK, match: p => p.role === 'GK' },
      { key: 'def', label: 'Defenders', short: 'Defender', icon: '🛡️', need: 4, have: c.DEF, match: p => p.role === 'DEF' },
      { key: 'mid', label: 'Midfielders', short: 'Midfielder', icon: '🎽', need: 3, have: c.MID, match: p => p.role === 'MID' },
      { key: 'fwd', label: 'Forwards', short: 'Forward', icon: '⚽', need: 2, have: c.FWD, match: p => p.role === 'FWD' },
    ];
  },

  statFields(p) {
    return [
      { label: 'Apps', value: p.appearances },
      { label: 'Goals', value: p.goals },
      { label: 'Assists', value: p.assists },
      { label: 'Rating', value: p.rating },
      { label: 'Age', value: p.age },
    ].filter(s => s.value != null);
  },

  poolCategories: [
    { key: 'all', label: 'All' },
    { key: 'GK', label: 'Goalkeepers' },
    { key: 'DEF', label: 'Defenders' },
    { key: 'MID', label: 'Midfielders' },
    { key: 'FWD', label: 'Forwards' },
  ],
};

// ---- Registry --------------------------------------------------------------

export const SPORTS = { cricket, football };

export function getSport(id) {
  return SPORTS[id] || cricket;
}

// First unmet squad requirement that this player would fill (for the smart
// "Need X!" highlight on the auction card). Returns a label or null.
export function smartNeedLabel(sport, player, team) {
  const row = sport.squadNeeds(team).find(n => n.match(player) && n.have < n.need);
  return row ? `${row.icon} Need ${row.short}!` : null;
}
