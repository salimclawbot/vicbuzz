import { readFileSync, writeFileSync } from 'fs';

const SHEETS = {
  melbourne: [
    '1_faiBwqbzt8jznzIDVDKFPAQxZcU-NI-zZyMUSa5jWk',
    '1qbD_5NlIcBN-gLV3XWTaG5v9D44BHmEp_hyHwOVZpVI',
    '1qn4bIwNWT855NujBxwq0NBjWO07sGX0Qa2LKq1rRmnI',
  ],
  east: [
    '14KV-zwaIztI6Xe-iXgA3BhM2YMzyNp-IYo2l-RhsXJQ',
    '1BrICvrkWoL2Ggbd0BTAfX7vcOzzBXqIE0HGSjlkLHr8',
    '1b_XUGdEEMy_Tt_BcWOar0J2I9cggzu2Xbb_yE8vB3uw',
    '1y6EDl-7GCiMuK0dATszHzxkFpySetgljN-FbS6J-Qyk',
    '1U3UIimc35roPxUHvBaHjLAaviUBsY4fEa11RXKbclBA',
  ],
  north: [
    '1VrhhSedToUiqJTir2HhFeMNkZ_g0eV0L17UuIDYsY8g',
    '1haNDy-PvfVQPj8gUOO6KTCkNoX-cJCaQaqQbXnpNQk0',
    '1YgwG535pRN8LFdTE7fwjN3DLcgubiCQNtAo51WKEpG8',
    '1o1Ofo_hdDsG0s3d16ai0hyXRdpsnK78emUV2mL2_bw4',
  ],
  west: [
    '1WARvvm44kqCo42ROWd2ExHcGIjEfNGYA0ocLpy4nVQM',
    '1LabS_JBceZiK0rYYvQ_uFUs-vJq9K-VWTqprmSGo4zo',
    '17XkW542B4yfMF354AqifR4j8ig3ctW7vvGprQjFMrAM',
    '17TYzg3kXIHB_kzJyN_JdSwl8Cz3UsG221l4sCUnBYZA',
    '143MJxmw3cb6HJPdvtWjR15r1dwlEfgmnOhhYDeQ0tKk',
  ],
  south: [
    '1EjI7l1aUw8FvcI7S9_z2U9-N6Jb4FlADdcwA5_R4VRU',
    '1p2YDunbzQ_5qhTsC48ZhqO3EDpALguiGq7AgaL_DpOs',
    '1OL27bqcgByIMfOFWa00tb63QaOjiZ4bI1Mp-axwjzqM',
    '1F7rF7OJr_UVYnUGN2-dDH4EpYQzzEzGR06Zwr8RqC8k',
  ],
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current.trim());
        current = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(current.trim());
        current = '';
        if (row.some(c => c !== '')) rows.push(row);
        row = [];
      } else {
        current += ch;
      }
    }
  }
  row.push(current.trim());
  if (row.some(c => c !== '')) rows.push(row);
  return rows;
}

function extractFirstUrl(str) {
  if (!str) return '';
  const match = str.match(/https?:\/\/[^\s,;"'<>]+/);
  return match ? match[0] : str;
}

async function fetchSheet(sheetId) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function tryParseExisting() {
  try {
    const src = readFileSync('lib/listings.ts', 'utf8');
    const marker = 'export const listings: Listing[] = [';
    const start = src.indexOf(marker);
    if (start === -1) return [];
    const arrStart = start + marker.length - 1;
    let depth = 0, arrEnd = -1;
    for (let i = arrStart; i < src.length; i++) {
      if (src[i] === '[') depth++;
      if (src[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
    }
    if (arrEnd === -1) return [];
    return JSON.parse(src.substring(arrStart, arrEnd + 1));
  } catch { return []; }
}

async function main() {
  const existing = tryParseExisting();
  console.log(`Found ${existing.length} existing listings`);

  const seen = new Set();
  for (const l of existing) {
    seen.add(`${l.title.toLowerCase()}|${(l.suburb || '').toLowerCase()}`);
  }

  const newListings = [];
  let sheetsLoaded = 0;

  for (const [region, ids] of Object.entries(SHEETS)) {
    for (const sheetId of ids) {
      try {
        console.log(`Fetching ${region} sheet ${sheetId.slice(0, 12)}...`);
        const csv = await fetchSheet(sheetId);
        const rows = parseCSV(csv);
        if (rows.length < 2) { console.log('  Empty sheet, skipping'); continue; }

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const title = (row[0] || '').trim();
          if (!title) continue;

          const suburb = (row[2] || '').trim();
          const key = `${title.toLowerCase()}|${suburb.toLowerCase()}`;
          if (seen.has(key)) continue;
          seen.add(key);

          newListings.push({
            id: `${region}-${slugify(title)}`,
            title: title.toLowerCase(),
            region,
            suburb,
            price: (row[1] || '').trim() || 'Free',
            description: (row[3] || '').trim(),
            url: extractFirstUrl(row[4] || ''),
            image: extractFirstUrl(row[5] || ''),
            category: 'kids',
          });
        }
        sheetsLoaded++;
      } catch (err) {
        console.error(`  Failed to load sheet ${sheetId}: ${err.message}`);
      }
    }
  }

  const all = [...existing, ...newListings];

  const file = `// Auto-generated from VicBuzz Google Sheets — ${all.length} listings
export interface Listing {
  id: string; title: string; region: string; suburb: string;
  price: string; description: string; url: string; image: string; category: string;
}
export const listings: Listing[] = ${JSON.stringify(all)};
export const regionLabels: Record<string, string> = {
  melbourne: "Melbourne", east: "Melbourne East", north: "Melbourne North",
  west: "Melbourne West", south: "Melbourne South",
};
export const categoryLabels: Record<string, string> = {
  kids: "Kids & Family", food: "Food & Drink", markets: "Markets",
  music: "Music & Arts", workshops: "Workshops", sports: "Sports & Outdoors", community: "Community",
};
export function getListingsByRegion(r: string) { return listings.filter(l => l.region === r); }
export function getListingsByCategory(c: string) { return listings.filter(l => l.category === c); }
`;

  writeFileSync('lib/listings.ts', file);
  console.log(`Imported ${newListings.length} new listings from ${sheetsLoaded} sheets (total: ${all.length})`);
}

main().catch(err => { console.error(err); process.exit(1); });
