/**
 * Build the Lost & Found asset from a bird-atlas latest_by_qdgc run.
 *
 * Unit of comparison: the site's comparison concept (sp_base `avibase_id`),
 * reached through its eBird member codes. An eBird species that belongs to no
 * concept is its own unit (it can only ever be "new").
 *
 * Per square and unit:
 * - historical: in the old atlas (any period: taxa_old or taxa_old_other) or a
 *               precisely located record before `historical_before`
 * - recent:     in the new atlas (taxa_new) or any record from
 *               `historical_before` to `found_from`
 * - target:     historical and not recent
 * - re-found:   target with a precise record on or after `found_from`
 * - new:        no record of any kind before `found_from` (no atlas period, no
 *               record of any precision), and a precise record since
 * A unit recorded before `historical_before` only on imprecise records is
 * neither a target nor new.
 * Points go to every person on the first found date (finders.csv), each with
 * the location of their record.
 *
 * `country` applies the same rules to Kenya as one area (all cells, also
 * those outside the atlas squares): one row per species, not per square.
 *
 * Pure: no file system access, so it can be tested.
 */
import { buildSquares } from "./squares.js";

const byDate = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/** Prefix for cells outside the atlas squares (kept for the country lists only). */
const OUTSIDE = "~";

/**
 * Where a find was made: [lat, lng] of the eBird checklist start, or
 * [lat, lng, pentad] for a KBM card (the pentad centre). Empty if unknown.
 */
function locationOf(r) {
  const lat = Number(r.lat);
  const lng = Number(r.lng);
  if (!r.lat || !r.lng || !Number.isFinite(lat) || !Number.isFinite(lng)) return [];
  const loc = [Math.round(lat * 1e5) / 1e5, Math.round(lng * 1e5) / 1e5];
  return r.pentad ? [...loc, r.pentad] : loc;
}

/**
 * @param {object} input
 * @param {object} input.grid, input.mapData   site assets
 * @param {object[]} input.spBase              site asset
 * @param {object[]} input.latest, input.finders, input.species  run CSV rows
 * @param {object} input.manifest              run manifest
 * @param {{ebird_code: string, concept_avibase_id: string}[]} [input.extraMembers]
 *   reviewed concept members not yet in sp_base (KenyaAtlasComparison pending)
 */
export function buildFoundAsset({
  grid,
  mapData,
  spBase,
  latest,
  finders,
  species,
  manifest,
  extraMembers = [],
}) {
  const sqOf = new Map(buildSquares(grid, mapData).map((s) => [s.qdgc, s.Sq]));
  const conceptOfCode = new Map();
  for (const s of spBase) for (const code of s.ebird ?? []) conceptOfCode.set(code, s.avibase_id);
  for (const m of extraMembers)
    if (!conceptOfCode.has(m.ebird_code)) conceptOfCode.set(m.ebird_code, m.concept_avibase_id);
  const concepts = new Set(spBase.map((s) => s.avibase_id));

  // eBird species -> unit; standalone species keep their own eBird concept ID.
  const standalone = {};
  const unitOf = new Map();
  for (const s of species) {
    const concept = conceptOfCode.get(s.species_code);
    if (concept) unitOf.set(s.species_id, concept);
    else {
      if (concepts.has(s.species_id))
        throw new Error(`${s.species_id} is both a concept and a standalone species`);
      unitOf.set(s.species_id, s.species_id);
      standalone[s.species_id] = [s.common_name, s.scientific_name, Number(s.taxon_order)];
    }
  }

  // Aggregate member-species rows to (Sq, unit).
  const cells = new Map();
  const cell = (sq, unit) => {
    const key = `${sq}|${unit}`;
    if (!cells.has(key))
      cells.set(key, { sq, unit, hist: null, recent: false, found: null, first: null });
    return cells.get(key);
  };
  // Cells outside the atlas squares still count for the country lists.
  const outside = new Set();
  const squareOf = (qdgc) => {
    const sq = sqOf.get(qdgc);
    if (sq) return sq;
    outside.add(qdgc);
    return OUTSIDE + qdgc;
  };
  for (const r of latest) {
    const c = cell(squareOf(r.qdgc), unitOf.get(r.species_id));
    if (r.hist_date && (!c.hist || r.hist_date > c.hist[0]))
      c.hist = [r.hist_date, r.hist_source, r.hist_id];
    if (r.mid_date) c.recent = true;
    if (r.found_date && (!c.found || r.found_date < c.found)) c.found = r.found_date;
    if (r.first_date && (!c.first || r.first_date < c.first)) c.first = r.first_date;
  }
  for (const f of mapData.features) {
    const p = f.properties;
    for (const unit of p.taxa_old) cell(p.Sq, unit).atlasOld = true;
    for (const unit of p.taxa_old_other ?? []) cell(p.Sq, unit).atlasOld = true;
    for (const unit of p.taxa_new) cell(p.Sq, unit).recent = true;
  }

  // People and the finders on each cell's first found date.
  const people = [];
  const personIndex = new Map();
  const finderRows = new Map();
  for (const r of finders) {
    const c = cells.get(`${squareOf(r.qdgc)}|${unitOf.get(r.species_id)}`);
    if (!c || r.date !== c.found) continue; // a member species found later than the unit
    if (!personIndex.has(r.person)) {
      personIndex.set(r.person, people.length);
      people.push([r.observer_name || r.observer_id, r.source, r.observer_id]);
    } else if (r.source === "ebird" && people[personIndex.get(r.person)][1] !== "ebird") {
      // A person linked across sources keeps their eBird ID, for the profile link.
      people[personIndex.get(r.person)].splice(1, 2, r.source, r.observer_id);
    }
    const list = finderRows.get(c) ?? [];
    const idx = personIndex.get(r.person);
    if (!list.some((x) => x[0] === idx)) list.push([idx, r.source, r.id, ...locationOf(r)]);
    finderRows.set(c, list);
  }

  const foundFrom = manifest.policies.found_from;
  /** "t", "r", "n", or null (recorded recently, or no usable record). */
  function classify({ atlasOld, hist, recent, found, first }) {
    if (recent) return null;
    if (atlasOld || hist) return found ? "r" : "t";
    return found && !(first && first < foundFrom) ? "n" : null;
  }
  // Rows: last seen before the recent period is [date, source, id], or null = old atlas only.
  function push(list, key, unit, c, who) {
    if (key === "t") list.t.push([unit, c.hist ?? null]);
    else if (key === "r") list.r.push([unit, c.found, who, c.hist ?? null]);
    else list.n.push([unit, c.found, who]);
  }
  const sortFinds = (list) => {
    list.r.sort((a, b) => byDate(b[1], a[1]));
    list.n.sort((a, b) => byDate(b[1], a[1]));
    return list;
  };

  const squares = {};
  const counts = { targets: 0, refound: 0, new: 0 };
  const COUNT = { t: "targets", r: "refound", n: "new" };
  for (const c of cells.values()) {
    const key = classify(c);
    if (!key || c.sq.startsWith(OUTSIDE)) continue;
    push((squares[c.sq] ??= { t: [], r: [], n: [] }), key, c.unit, c, finderRows.get(c) ?? []);
    counts[COUNT[key]]++;
  }
  Object.values(squares).forEach(sortFinds);

  // Kenya as one area: the same rules over all its cells. A species re-found
  // in ten squares is one re-found species here, and "new" means new to Kenya.
  const nation = new Map();
  for (const c of cells.values()) {
    const u = nation.get(c.unit) ?? {
      atlasOld: false,
      hist: null,
      recent: false,
      found: null,
      first: null,
      cells: [],
    };
    u.atlasOld ||= Boolean(c.atlasOld);
    u.recent ||= c.recent;
    if (c.hist && (!u.hist || c.hist[0] > u.hist[0])) u.hist = c.hist;
    if (c.found && (!u.found || c.found < u.found)) u.found = c.found;
    if (c.first && (!u.first || c.first < u.first)) u.first = c.first;
    u.cells.push(c);
    nation.set(c.unit, u);
  }
  const country = { t: [], r: [], n: [] };
  for (const [unit, u] of nation) {
    const key = classify(u);
    if (!key) continue;
    const who = [];
    for (const c of u.cells)
      if (c.found === u.found)
        for (const f of finderRows.get(c) ?? []) if (!who.some((x) => x[0] === f[0])) who.push(f);
    push(country, key, unit, u, who);
    counts.country = counts.country ?? { t: 0, r: 0, n: 0 };
    counts.country[key]++;
  }
  sortFinds(country);

  return {
    asset: {
      meta: {
        created_at: manifest.created_at,
        taxonomy: `eBird ${manifest.taxonomy.version}`,
        historical_before: manifest.policies.historical_before,
        found_from: manifest.policies.found_from,
        date_range: manifest.date_range,
        old_atlas: "1970–1984 comparison; other atlas periods also count as historical",
        rows: {
          t: ["unit", "last_seen [date, source, id] or null (old atlas only)"],
          r: ["unit", "found_date", "finders [person, source, id, lat, lng, pentad?]", "last_seen"],
          n: ["unit", "found_date", "finders [person, source, id, lat, lng, pentad?]"],
          people: ["name", "source", "observer_id"],
          country: "the same t/r/n rows for Kenya as one area",
          standalone: ["common_name", "scientific_name", "taxon_order"],
        },
      },
      people,
      standalone,
      squares,
      country,
    },
    counts,
    outside: [...outside].sort(),
  };
}
