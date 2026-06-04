// One-time: fetch team badges/crests from TheSportsDB for both sports and write
// them to src/data/team-logos.json (code → badge URL). Re-runnable.
//
//   THESPORTSDB_KEY=<key> node scripts/fetch-team-logos.mjs
//
// Badges are hot-linked from TheSportsDB's CDN (same source as player photos).
// They are the clubs' trademarks — fine for a personal/portfolio build.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const KEY = process.env.THESPORTSDB_KEY || '3';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, '..', 'src', 'data', 'team-logos.json');

// code → { sport, query (+ optional alternates) }
const TEAMS = [
  // Football
  ['MCI', 'Soccer', 'Manchester City'],
  ['ARS', 'Soccer', 'Arsenal'],
  ['LIV', 'Soccer', 'Liverpool'],
  ['MUN', 'Soccer', 'Manchester United'],
  ['CHE', 'Soccer', 'Chelsea'],
  ['TOT', 'Soccer', 'Tottenham Hotspur', 'Tottenham'],
  ['NEW', 'Soccer', 'Newcastle United', 'Newcastle'],
  ['AVL', 'Soccer', 'Aston Villa'],
  ['RMA', 'Soccer', 'Real Madrid'],
  ['BAR', 'Soccer', 'Barcelona'],
  ['ATM', 'Soccer', 'Atletico Madrid', 'Atlético Madrid'],
  ['ATH', 'Soccer', 'Athletic Bilbao', 'Athletic Club'],
  ['RSO', 'Soccer', 'Real Sociedad'],
  ['VIL', 'Soccer', 'Villarreal'],
  ['BET', 'Soccer', 'Real Betis', 'Betis'],
  ['SEV', 'Soccer', 'Sevilla'],
  // Cricket (IPL)
  ['CSK', 'Cricket', 'Chennai Super Kings'],
  ['MI', 'Cricket', 'Mumbai Indians'],
  ['RCB', 'Cricket', 'Royal Challengers Bangalore', 'Royal Challengers Bengaluru'],
  ['KKR', 'Cricket', 'Kolkata Knight Riders'],
  ['SRH', 'Cricket', 'Sunrisers Hyderabad'],
  ['DC', 'Cricket', 'Delhi Capitals'],
  ['PBKS', 'Cricket', 'Punjab Kings', 'Kings XI Punjab'],
  ['RR', 'Cricket', 'Rajasthan Royals'],
  ['LSG', 'Cricket', 'Lucknow Super Giants'],
  ['GT', 'Cricket', 'Gujarat Titans'],
];

const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]/g, '').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

let map = {};
if (fs.existsSync(OUT)) { try { map = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { map = {}; } }

async function badge(sport, queries) {
  for (const q of queries) {
    let res;
    try { res = await fetch(`https://www.thesportsdb.com/api/v1/json/${KEY}/searchteams.php?t=${encodeURIComponent(q)}`); }
    catch { await sleep(2000); continue; }
    if (res.status === 429) { await sleep(6000); continue; }
    let teams;
    try { teams = (await res.json()).teams || []; } catch { continue; }
    const cands = teams.filter(t => t.strSport === sport);
    const exact = cands.find(t => norm(t.strTeam) === norm(q)) || cands[0];
    const url = exact && (exact.strBadge || exact.strTeamBadge);
    if (url) return { url, matched: exact.strTeam };
    await sleep(250);
  }
  return null;
}

let done = 0, miss = 0;
for (const [code, sport, ...queries] of TEAMS) {
  if (map[code]) { done++; continue; }
  const r = await badge(sport, queries);
  if (r) { map[code] = r.url; done++; console.log(`✓ ${code}  →  ${r.matched}`); }
  else { miss++; console.log(`✗ ${code}  (no badge)`); }
  fs.writeFileSync(OUT, JSON.stringify(map, null, 2));
  await sleep(400);
}
console.log(`\nDone. badges=${done} missing=${miss} → ${OUT}`);
