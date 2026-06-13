/*
  Airport search API.
  ───────────────────────────────────────────────────────────
  Data lives in ./airports.json (one entry = { city, name, code, country }).
  To EXPAND coverage later: just add rows to airports.json — no code change.
  To go fully dynamic later: swap `AIRPORTS` for a fetch() to a remote API and
  keep the same searchAirports() signature; callers won't change.
*/
import data from "./airports.json";

export const AIRPORTS = data;

/* Subsequence test: do the chars of `q` appear in order inside `text`?
   Lets "bnglr" still match "bangalore" (fuzzy / typo tolerance). */
function isSubsequence(q, text) {
  let i = 0;
  for (let j = 0; j < text.length && i < q.length; j++) {
    if (text[j] === q[i]) i++;
  }
  return i === q.length;
}

/*
  Intelligent, ranked search over city / code / airport name / country.
  Scoring (higher = better):
    100 exact IATA code           ("blr"  → Bangalore)
     92 city starts with query    ("bang" → Bangalore)
     84 code starts with query
     70 any word in city/name starts with query ("heath" → Heathrow)
     55 city contains query
     42 airport name contains query
     28 country contains / starts
     15 fuzzy subsequence match   ("bnglr" → Bangalore)
*/
export function searchAirports(query, limit = 8) {
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    // No query → show a sensible default (major hubs first, as ordered in JSON)
    return AIRPORTS.slice(0, limit);
  }

  const scored = [];
  for (const a of AIRPORTS) {
    const city = a.city.toLowerCase();
    const code = a.code.toLowerCase();
    const name = a.name.toLowerCase();
    const country = a.country.toLowerCase();

    let score = -1;
    if (code === q) score = 100;
    else if (city.startsWith(q)) score = 92;
    else if (code.startsWith(q)) score = 84;
    else if (`${city} ${name}`.split(/[\s/–-]+/).some((w) => w.startsWith(q))) score = 70;
    else if (city.includes(q)) score = 55;
    else if (name.includes(q)) score = 42;
    else if (country.startsWith(q) || country.includes(q)) score = 28;
    else if (q.length >= 3 && (isSubsequence(q, city) || isSubsequence(q, code))) score = 15;

    if (score >= 0) scored.push({ a, score });
  }

  scored.sort((x, y) => y.score - x.score || x.a.city.localeCompare(y.a.city));
  return scored.slice(0, limit).map((x) => x.a);
}

export const AIRPORT_COUNT = AIRPORTS.length;
