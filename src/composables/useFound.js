import chroma from "chroma-js";
import { computed } from "vue";

import { state } from "../store";
import { cleanName } from "../utils/names";
import { spTaxo } from "./useSpeciesLists";

const SOURCE_LABEL = { ebird: "eBird", abap: "KBM" };

/**
 * The three categories, in display order. Colours are chosen to stay apart
 * from the Lost/Kept/Gained red-yellow-green of the other pages and to remain
 * distinguishable with the common colour-vision deficiencies.
 */
export const FOUND_CATEGORIES = [
  { key: "r", label: "re-found", title: "Re-found", color: "#15897a" },
  { key: "n", label: "new", title: "New", color: "#7e57c2" },
  { key: "t", label: "still to find", title: "Still to find", color: "#d4691b" },
];
export const FOUND_CATEGORY = Object.fromEntries(FOUND_CATEGORIES.map((c) => [c.key, c]));

/** Map scale for one category: pale for few, the category colour, dark for many. */
const SCALES = Object.fromEntries(
  FOUND_CATEGORIES.map(({ key, color }) => {
    const c = chroma(color);
    return [key, chroma.scale([c.brighten(2.6).desaturate(0.6), c, c.darken(1.6)]).mode("lab")];
  })
);
export const foundScale = (key) => SCALES[key];

/** Link to a record: eBird checklists have pages; KBM cards are shown by ID. */
export function recordUrl(source, id) {
  return source === "ebird" && id ? `https://ebird.org/checklist/${id}` : null;
}

/**
 * eBird public profile: the URL key is the base64 of the observer number
 * (obsr1234567 -> MTIzNDU2Nw). Profiles the observer has not made public
 * open eBird's sign-in page instead.
 */
export function profileUrl(source, observerId) {
  const m = source === "ebird" && /^obsr(\d+)$/.exec(observerId ?? "");
  return m ? `https://ebird.org/profile/${btoa(m[1]).replace(/=+$/, "")}` : null;
}

export function sourceLabel(source) {
  return SOURCE_LABEL[source] ?? source;
}

/** Display name, cleaned of taglines and web addresses; an unresolved eBird ID stays an ID. */
export function personLabel(name) {
  return cleanName(name) || "Unknown observer";
}
export const isUnnamed = (name) => /^obsr\d+$/.test(name ?? "");

/** Unit names in the selected taxonomy; species without a concept use eBird names. */
const unitInfo = computed(() => {
  const info = new Map(spTaxo.value.map((s) => [s.avibase_id, s]));
  for (const [id, [common_name, scientific_name, sort]] of Object.entries(
    state.found?.standalone ?? {}
  )) {
    info.set(id, {
      avibase_id: id,
      common_name,
      scientific_name,
      sort: 1e6 + sort,
      standalone: true,
    });
  }
  return info;
});

export function unitName(id) {
  return (
    unitInfo.value.get(id) ?? { avibase_id: id, common_name: id, scientific_name: "", sort: 1e9 }
  );
}

/** People in the asset, with their profile links. */
const people = computed(() =>
  (state.found?.people ?? []).map(([name, source, observerId], index) => ({
    index,
    name,
    source,
    observerId,
    url: profileUrl(source, observerId),
  }))
);

/**
 * Whether a find falls in the selected period (`state.foundYear`: "all" or a
 * year). Only finds are filtered: "still to find" is always the current list.
 */
export function inPeriod(date) {
  return state.foundYear === "all" || date.startsWith(state.foundYear);
}

/** Per square: { t, r, n } counts, finds within the selected period. */
export const squareCounts = computed(() => {
  const counts = {};
  for (const [sq, s] of Object.entries(state.found?.squares ?? {})) {
    counts[sq] = {
      t: s.t.length,
      r: s.r.filter((row) => inPeriod(row[1])).length,
      n: s.n.filter((row) => inPeriod(row[1])).length,
    };
  }
  return counts;
});

/** Largest count of each category in any square, for the map colour scale. */
export const maxCounts = computed(() => {
  const max = { t: 1, r: 1, n: 1 };
  for (const c of Object.values(squareCounts.value))
    for (const key of Object.keys(max)) max[key] = Math.max(max[key], c[key]);
  return max;
});

function lastSeenOf(lastSeen) {
  return (
    lastSeen && {
      date: lastSeen[0],
      source: lastSeen[1],
      url: recordUrl(lastSeen[1], lastSeen[2]),
    }
  );
}

/**
 * The record that put a unit on the list: its date, checklist and first
 * observer. Co-observers on the same date share the point but are folded
 * into `others` to keep one line per species.
 */
function firstRecord(date, who) {
  const [first, ...rest] = who.map(([person, source, id, lat, lng, pentad]) => ({
    ...people.value[person],
    source,
    checklist: recordUrl(source, id),
    id,
    lat,
    lng,
    pentad,
  }));
  return { date, observer: first, others: rest };
}

/**
 * Lists for the selected square, or for Kenya as one area when none is
 * selected: targets by taxonomy, finds in the period newest first.
 */
export const foundLists = computed(() => {
  const lists = { t: [], r: [], n: [] };
  const areas = state.grid.length
    ? state.grid.map((sq) => [sq, state.found?.squares?.[sq]])
    : [["Kenya", state.found?.country]];
  for (const [sq, s] of areas) {
    if (!s) continue;
    for (const [unit, lastSeen] of s.t) {
      lists.t.push({ sq, unit: unitName(unit), lastSeen: lastSeenOf(lastSeen) });
    }
    for (const [unit, date, who, lastSeen] of s.r) {
      if (!inPeriod(date)) continue;
      lists.r.push({
        sq,
        unit: unitName(unit),
        ...firstRecord(date, who),
        lastSeen: lastSeenOf(lastSeen),
      });
    }
    for (const [unit, date, who] of s.n) {
      if (!inPeriod(date)) continue;
      lists.n.push({ sq, unit: unitName(unit), ...firstRecord(date, who) });
    }
  }
  lists.t.sort((a, b) => a.unit.sort - b.unit.sort);
  lists.r.sort((a, b) => (a.date < b.date ? 1 : -1));
  lists.n.sort((a, b) => (a.date < b.date ? 1 : -1));
  return lists;
});

/** The numbers on the category buttons: the lists above, so never a sum over squares. */
export const foundTotals = computed(() => ({
  t: foundLists.value.t.length,
  r: foundLists.value.r.length,
  n: foundLists.value.n.length,
}));

/**
 * Finds of the current category in the selected square (or Kenya), grouped by where
 * they were made (one eBird checklist start, or one KBM pentad).
 */
export const foundPlaces = computed(() => {
  const key = state.foundView;
  if (key === "t") return [];
  const places = new Map();
  for (const item of foundLists.value[key]) {
    const o = item.observer;
    if (o?.lat == null) continue;
    const id = o.pentad ? `p:${o.pentad}` : `e:${o.lat},${o.lng}`;
    if (!places.has(id))
      places.set(id, { id, lat: o.lat, lng: o.lng, pentad: o.pentad ?? null, items: [] });
    places.get(id).items.push(item);
  }
  return [...places.values()];
});

/** Years that have finds, newest first. */
export const foundYears = computed(() => {
  const years = new Set();
  for (const s of Object.values(state.found?.squares ?? {}))
    for (const rows of [s.r, s.n]) for (const [, date] of rows) years.add(date.slice(0, 4));
  return [...years].sort().reverse();
});

/**
 * One point per re-found or new species-square, to every person on its first
 * date, counted in the year of that date (see `inPeriod`), over the selected
 * squares or all of them. Ties share the point rather than splitting it.
 */
export const leaderboard = computed(() => {
  const score = new Map();
  const squares = state.found?.squares ?? {};
  const selected = state.grid.length ? state.grid.map((sq) => squares[sq]).filter(Boolean) : null;
  for (const s of selected ?? Object.values(squares)) {
    for (const [key, rows] of [
      ["r", s.r],
      ["n", s.n],
    ]) {
      for (const [, date, who] of rows) {
        if (!inPeriod(date)) continue;
        for (const [person] of who) {
          const entry = score.get(person) ?? { person, r: 0, n: 0 };
          entry[key]++;
          score.set(person, entry);
        }
      }
    }
  }
  return [...score.values()]
    .map((e) => ({ ...e, ...people.value[e.person], points: e.r + e.n }))
    .sort((a, b) => b.points - a.points || b.r - a.r || a.name.localeCompare(b.name));
});
