/*
  Hotel location search API.
  ───────────────────────────────────────────────────────────
  Data lives in ./locations.json (one entry = { city, region, country }).
  Expand later by adding rows to the JSON — no code change needed.
  Users may also type a free-form area / hotel name; the field accepts that
  too (LocationSelect lets the typed text be used directly).
*/
import data from "./locations.json";

export const LOCATIONS = data;

function isSubsequence(q, text) {
  let i = 0;
  for (let j = 0; j < text.length && i < q.length; j++) {
    if (text[j] === q[i]) i++;
  }
  return i === q.length;
}

/*
  Ranked search over city / region / country with fuzzy fallback.
    90 city starts with query   ("bang" → Bangalore)
    72 region/country word starts with query
    58 city contains query
    40 region contains query
    28 country contains query
    14 fuzzy subsequence         ("bnglr" → Bangalore)
*/
export function searchLocations(query, limit = 8) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return LOCATIONS.slice(0, limit);

  const scored = [];
  for (const l of LOCATIONS) {
    const city = l.city.toLowerCase();
    const region = (l.region || "").toLowerCase();
    const country = l.country.toLowerCase();

    let score = -1;
    if (city.startsWith(q)) score = 90;
    else if (`${region} ${country}`.split(/[\s,]+/).some((w) => w.startsWith(q))) score = 72;
    else if (city.includes(q)) score = 58;
    else if (region.includes(q)) score = 40;
    else if (country.includes(q)) score = 28;
    else if (q.length >= 3 && isSubsequence(q, city)) score = 14;

    if (score >= 0) scored.push({ l, score });
  }

  scored.sort((x, y) => y.score - x.score || x.l.city.localeCompare(y.l.city));
  return scored.slice(0, limit).map((x) => x.l);
}

export const LOCATION_COUNT = LOCATIONS.length;
