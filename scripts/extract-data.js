#!/usr/bin/env node
/**
 * Extract structured data from MDX guides into JSON.
 * Reads:
 *   ../website/src/content/blog/gluten-free-magic-kingdom-complete-guide.mdx
 *   ../website/src/content/blog/gluten-free-epcot-dining-guide.mdx
 * Writes:
 *   src/data/restaurants.json
 *   src/data/snacks.json
 *   src/data/contacts.json
 *   src/data/parks.json
 *
 * Heuristic extraction — these guides are well-structured prose with consistent
 * restaurant sections. We parse headings, ratings, dish lists, and tips.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.resolve(ROOT, '../website/src/content/blog');

const LAST_VERIFIED = '2026-02-28';

// --- helpers ------------------------------------------------------------

function readMDX(name) {
  return fs.readFileSync(path.join(SRC, name), 'utf8');
}

/**
 * Strip MDX frontmatter.
 */
function stripFrontmatter(mdx) {
  const m = mdx.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: mdx };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (mm) meta[mm[1]] = mm[2].replace(/^["']|["']$/g, '');
  }
  return { meta, body: m[2] };
}

/**
 * Split body into sections by ## / ### headings.
 */
function splitSections(body) {
  const lines = body.split('\n');
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);
    if (h2) {
      if (cur) sections.push(cur);
      cur = { level: 2, title: h2[1].trim(), lines: [] };
    } else if (h3) {
      if (cur) sections.push(cur);
      cur = { level: 3, title: h3[1].trim(), lines: [] };
    } else if (cur) {
      cur.lines.push(line);
    }
  }
  if (cur) sections.push(cur);
  return sections;
}

/**
 * Extract GF Rating and Overall Rating from a section's header block.
 * Patterns like: **Gluten-Free Rating: 4.5/5** | **Overall Rating: 4.5/5**
 */
function extractRatings(block) {
  const ratings = {};
  const m1 = block.match(/\*?\*?Gluten-Free Rating:\*?\*?\s*([\d.]+)\s*\/\s*5/i);
  if (m1) ratings.glutenFree = parseFloat(m1[1]);
  const m2 = block.match(/\*?\*?Overall Rating:\*?\*?\s*([\d.]+)\s*\/\s*5/i);
  if (m2) ratings.overall = parseFloat(m2[1]);
  return ratings;
}

/**
 * Pull "Land" / "Area" / "Pavilion" location from header. Most lines say
 * "Pecos Bill Tall Tale Inn and Cafe (Frontierland)" or similar.
 */
function extractLocation(title, block) {
  const t = title.match(/\(([^)]+)\)/);
  if (t) return t[1].trim();
  const locMatch = block.match(/^\*\*Location:\*\*\s*(.+)$/m);
  if (locMatch) return locMatch[1].trim();
  return null;
}

/**
 * Pull cost ("Cost: ~$60 per person") and reservation requirement.
 */
function extractCostAndRes(block) {
  const out = {};
  const cost = block.match(/\*\*Cost:\*\*\s*(.+?)(?:\n|$)/);
  if (cost) out.cost = cost[1].trim();
  const res = block.match(/\*\*Reservation Required:\*\*\s*(.+?)(?:\n|$)/);
  if (res) out.reservationRequired = /^yes/i.test(res[1].trim());
  const rating = block.match(/\*\*Rating:\*\*\s*([\d.]+)\s*\/\s*5/i);
  if (rating) out.rating = parseFloat(rating[1]);
  const xc = block.match(/\*\*Cross-?[Cc]ontamination [Rr]isk:\*\*\s*(.+?)(?:\n|$)/);
  if (xc) out.crossContamination = xc[1].trim();
  return out;
}

/**
 * Pull dish names/prices from numbered list items like:
 *   1. **Citrus-Chipotle Chicken Rice Bowl** ($14.99)
 *      - Citrus-chipotle chicken, cilantro-lime rice...
 *      - Quality: Excellent | Cross-contamination risk: Low
 *      - Why it works: ...
 */
function extractDishes(block) {
  const dishes = [];
  const lines = block.split('\n');
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^\d+\.\s+\*\*([^*]+)\*\*\s*(?:\(([^)]+)\))?/);
    if (m) {
      const dish = {
        name: m[1].trim(),
        price: m[2] ? m[2].trim() : null,
        notes: [],
      };
      // Collect following indented lines until next numbered or break
      let j = i + 1;
      while (j < lines.length) {
        const l = lines[j];
        if (/^\d+\.\s+\*\*/.test(l) || /^### /.test(l) || /^## /.test(l) || /^\|/.test(l)) break;
        const trimmed = l.trim();
        if (trimmed.startsWith('-') && trimmed.length > 1) {
          dish.notes.push(trimmed.slice(1).trim());
        } else if (trimmed.length > 0 && !trimmed.startsWith('**')) {
          // ignore narrative paragraphs
        }
        j++;
      }
      dishes.push(dish);
      i = j;
    } else {
      i++;
    }
  }
  return dishes;
}

/**
 * Pull "Pro Tips" — lines starting with numbered bullets under **Pro Tips:** / **Pro Tip:**
 */
function extractTips(block) {
  const tips = [];
  const tipSection = block.match(/\*\*(?:Pro Tips?|Pro Tip):\*\*\s*\n([\s\S]*?)(?=\n\*\*|\n##|\n---|\n###|$)/);
  if (!tipSection) return tips;
  for (const line of tipSection[1].split('\n')) {
    const m = line.match(/^\s*\d+\.\s+(.+)$/) || line.match(/^\s*-\s+(.+)$/);
    if (m) tips.push(m[1].trim());
  }
  return tips;
}

/**
 * Pull the snack items with their star ratings. Pattern:
 *   **1. Dole Whip (Aloha Isle, Adventureland)** ⭐⭐⭐⭐⭐
 *   - Price: $7.99
 *   - Rating: 4.9/5
 *   - Why: ...
 */
function extractSnacks() {
  const out = [];
  const mk = readMDX('gluten-free-magic-kingdom-complete-guide.mdx');
  const ep = readMDX('gluten-free-epcot-dining-guide.mdx');

  for (const [src, park] of [[mk, 'magic-kingdom'], [ep, 'epcot']]) {
    const { body } = stripFrontmatter(src);
    // Find snack sections
    const snackStart = body.indexOf("## Can't-Miss");
    if (snackStart < 0) continue;
    const snackBody = body.slice(snackStart);
    // Each snack is **N. Name (Location)** ⭐... then - Price / - Rating / - Why
    const re = /\*\*\d+\.\s+([^*]+?)\*\*\s*(⭐+)/g;
    let m;
    while ((m = re.exec(snackBody)) !== null) {
      const headerLine = m[1].trim();
      const stars = m[2].length;
      const nameLoc = headerLine.match(/^([^()]+)\s*\(([^)]+)\)/);
      const name = nameLoc ? nameLoc[1].trim() : headerLine;
      const location = nameLoc ? nameLoc[2].trim() : null;
      // Look ahead for Price and Why
      const tail = snackBody.slice(m.index + m[0].length, m.index + m[0].length + 500);
      const priceM = tail.match(/Price:\s*(\$[\d.,]+(?:\s*-\s*\$[\d.,]+)?)/);
      const ratingM = tail.match(/Rating:\s*([\d.]+)\s*\/\s*5/);
      const whyM = tail.match(/Why:\s*([^\n]+)/);
      out.push({
        name,
        location,
        park,
        stars,
        price: priceM ? priceM[1] : null,
        rating: ratingM ? parseFloat(ratingM[1]) : stars * 1.0,
        description: whyM ? whyM[1].trim() : null,
        allergens: ['gluten-free'], // default safe
        source: 'guide',
        lastVerified: LAST_VERIFIED,
      });
    }
  }
  return out;
}

// --- main extraction ----------------------------------------------------

function extractMagicKingdom() {
  const raw = readMDX('gluten-free-magic-kingdom-complete-guide.mdx');
  const { body } = stripFrontmatter(raw);
  const sections = splitSections(body);
  const restaurants = [];

  for (const sec of sections) {
    if (sec.level !== 3) continue;
    // Skip non-restaurant sections
    const block = sec.lines.join('\n');
    // Heuristic: a restaurant section usually has a "Gluten-Free Rating:" line
    if (!/Gluten-Free Rating:/i.test(block) && !/Reservation Required:/i.test(block)) {
      // Maybe still a restaurant if titled like "## #1: Pecos Bill..."
      if (!/^#?\d+[:\.]?\s/.test(sec.title)) continue;
    }
    const title = sec.title.replace(/^#?\d+[:\.]?\s*/, '').trim();
    // Strip leading emoji / decoration
    const cleanTitle = title.replace(/^[🏆#\s]+/, '').trim();

    const ratings = extractRatings(block);
    const cost = extractCostAndRes(block);
    const dishes = extractDishes(block);
    const tips = extractTips(block);
    const location = extractLocation(cleanTitle, block);

    // Type detection
    let type = 'unknown';
    if (sec.title.toLowerCase().includes('quick-service') || /Quick-Service/i.test(block)) type = 'quick-service';
    else if (sec.title.toLowerCase().includes('table-service') || /Reservation Required: Yes/i.test(block)) type = 'table-service';

    // Best dish / price from quick stats
    const bestMatch = block.match(/\*\*Best [Dd]ish:\*\*\s*([^\n|]+)/);
    const bestDish = bestMatch ? bestMatch[1].trim() : null;

    restaurants.push({
      name: cleanTitle.split('(')[0].trim().replace(/^#\d+\s*/, ''),
      park: 'magic-kingdom',
      location,
      type: type === 'unknown' ? 'quick-service' : type,
      ratings: Object.keys(ratings).length ? ratings : (cost.rating ? { overall: cost.rating } : {}),
      cost: cost.cost || null,
      reservationRequired: !!cost.reservationRequired,
      crossContaminationRisk: cost.crossContamination || null,
      bestDish,
      dishes,
      tips,
      source: 'guide',
      lastVerified: LAST_VERIFIED,
    });
  }

  // The "Restaurant Cheat Sheet" table is the authoritative list — use it to
  // confirm which 13 restaurants made the cut and what their canonical
  // ratings are.
  const cheat = body.match(/## Restaurant Cheat Sheet\n([\s\S]*?)(?=\n## |\n---)/);
  if (cheat) {
    const rows = cheat[1].split('\n').filter(l => /^\|\s*\*\*/.test(l));
    for (const row of rows) {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length < 6) continue;
      const name = cells[0].replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
      const type = cells[1].toLowerCase().includes('qs') ? 'quick-service' : 'table-service';
      const rating = parseFloat(cells[2]);
      const bestDish = cells[3];
      const price = cells[4];
      const mustBook = /^yes/i.test(cells[5]);
      // Update or insert
      const existing = restaurants.find(r => r.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.ratings = { glutenFree: rating, overall: rating };
        existing.bestDish = bestDish;
        existing.cost = price;
        existing.reservationRequired = mustBook;
        existing.type = type;
      } else {
        restaurants.push({
          name,
          park: 'magic-kingdom',
          type,
          ratings: { glutenFree: rating, overall: rating },
          cost: price,
          reservationRequired: mustBook,
          bestDish,
          dishes: [],
          tips: [],
          source: 'cheat-sheet',
          lastVerified: LAST_VERIFIED,
        });
      }
    }
  }

  return restaurants;
}

function extractEpcot() {
  const raw = readMDX('gluten-free-epcot-dining-guide.mdx');
  const { body } = stripFrontmatter(raw);
  const restaurants = [];

  // EPCOT guide is organized by country pavilion, then by restaurant within.
  // Each restaurant appears as "**Quick-Service: Name**" or "**Table-Service: Name**"
  const re = /\*\*(Quick-Service|Table-Service):\s*([^*]+?)\*\*/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const type = m[1].toLowerCase().includes('quick') ? 'quick-service' : 'table-service';
    const name = m[2].trim();
    // Skip section headings that are actually just labels
    if (name.length > 60) continue;
    restaurants.push({
      name,
      park: 'epcot',
      type,
      ratings: {},
      dishes: [],
      tips: [],
      source: 'guide',
      lastVerified: LAST_VERIFIED,
    });
  }

  // Then the "Best EPCOT Restaurants" list at the end is a top-5 ranking
  const topPicksMatch = body.match(/## Best EPCOT Restaurants[\s\S]*$/);
  if (topPicksMatch) {
    const section = topPicksMatch[0];
    const pickRe = /\*\*\d+\.\s+\*\*([^*]+?)\*\*\s+\(([^)]+)\)\s*-\s*([^\n]+)/g;
    let pm;
    while ((pm = pickRe.exec(section)) !== null) {
      const name = pm[1].trim();
      const pavilion = pm[2].trim();
      const desc = pm[3].trim();
      const existing = restaurants.find(r => r.name === name);
      if (existing) {
        existing.location = pavilion;
        existing.topPick = true;
        existing.description = desc;
      } else {
        restaurants.push({
          name,
          park: 'epcot',
          location: pavilion,
          topPick: true,
          description: desc,
          ratings: {},
          dishes: [],
          tips: [],
          source: 'top-picks',
          lastVerified: LAST_VERIFIED,
        });
      }
    }
  }

  return restaurants;
}

// --- run ----------------------------------------------------------------

const outDir = path.join(ROOT, 'src', 'data');
fs.mkdirSync(outDir, { recursive: true });

const mkRestaurants = extractMagicKingdom();
const epRestaurants = extractEpcot();
const snacks = extractSnacks();

const restaurants = [...mkRestaurants, ...epRestaurants];

// De-dupe by name+park
const seen = new Set();
const dedup = [];
for (const r of restaurants) {
  const key = `${r.park}:${r.name.toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  dedup.push(r);
}

fs.writeFileSync(path.join(outDir, 'restaurants.json'), JSON.stringify(dedup, null, 2));
fs.writeFileSync(path.join(outDir, 'snacks.json'), JSON.stringify(snacks, null, 2));

const contacts = {
  specialDietsEmail: 'specialdiets@disneyworld.com',
  diningPhone: '407-WDW-DINE',
  diningPhoneNumeric: '407-939-3463',
  allergyMenusUrl: 'https://disneyworld.com/dining',
  notes: [
    'Email 1-2 weeks before your trip with dates, parks, and exact restrictions.',
    'For multiple allergies, list severity for each (celiac vs preference vs anaphylaxis).',
    'Cross-contamination is the real risk — ask about dedicated prep areas and shared fryers.',
  ],
};
fs.writeFileSync(path.join(outDir, 'contacts.json'), JSON.stringify(contacts, null, 2));

const parks = [
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    emoji: '🏰',
    description: 'Classic Disney. Castle, characters, comfort food. Strong quick-service GF options; Liberty Tree Tavern is the standout.',
    allergenRatings: { 'gluten-free': 4.7, vegan: 3.8, 'dairy-free': 4.2, 'nut-allergy': 4.6 },
    bestFor: ['gluten-free', 'nut-allergy'],
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    emoji: '🌍',
    description: 'World Showcase = naturally international cuisines. Most GF-friendly park overall. Watch soy sauce in Asian pavilions.',
    allergenRatings: { 'gluten-free': 4.9, vegan: 4.6, 'dairy-free': 4.8, 'nut-allergy': 3.6 },
    bestFor: ['gluten-free', 'vegan', 'dairy-free'],
  },
];
fs.writeFileSync(path.join(outDir, 'parks.json'), JSON.stringify(parks, null, 2));

console.log(`Extracted ${dedup.length} restaurants (${mkRestaurants.length} MK + ${epRestaurants.length} EPCOT)`);
console.log(`Extracted ${snacks.length} snacks`);
console.log(`Wrote: ${path.join(outDir, 'restaurants.json')}`);
console.log(`Wrote: ${path.join(outDir, 'snacks.json')}`);
console.log(`Wrote: ${path.join(outDir, 'contacts.json')}`);
console.log(`Wrote: ${path.join(outDir, 'parks.json')}`);