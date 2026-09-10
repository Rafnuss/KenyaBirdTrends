import { markRaw, reactive, watch } from "vue";

import map_data from "./assets/map_data.json";
import sp_base from "./assets/sp_base.json";
import grid_geojson from "./assets/grid.json";

// Field names in sp_base.json for each selectable taxonomy.
export const TAXONOMY_FIELDS = {
  "Clements/eBird": {
    sn: "clements_scientific_name",
    cn: "clements_common_name",
    s: "clements_sort",
  },
  "Checklist of the Birds of Kenya (2019)": {
    sn: "checklist_scientific_name",
    cn: "checklist_common_name",
    s: "checklist_sort",
  },
  "A Bird Atlas of Kenya (1989)": {
    sn: "scientific_name",
    cn: "common_name",
    s: "SEQ",
  },
};
export const TAXONOMY_OPTIONS = Object.keys(TAXONOMY_FIELDS);
export const DEFAULT_TAXONOMY = "Checklist of the Birds of Kenya (2019)";

export const SORT_OPTIONS = [
  "Taxonomy",
  "# Lost",
  "# Gained",
  "# Kept",
  "# Difference",
  "% Lost",
  "% Gained",
  "% Kept",
  "% Difference",
];

export const RED_LIST_OPTIONS = [
  "All",
  "Near Threatened",
  "Vulnerable",
  "Endangered",
  "Critically Endangered",
];

export const TRAIT_OPTIONS = ["Endemic", "Afrotropical migrant", "Palearctic migrant", "Waterbird"];

export const MODES = ["Intro", "Grid", "Species"];

// [[north, east], [south, west]]
export const KENYA_BOUNDS = [
  [5.615985, 43.50585],
  [-5.353521, 32.958984],
];

const EMPTY_GEOJSON = { type: "FeatureCollection", features: [] };

// Static imported JSON: kept out of the reactive graph so Vue does not proxy
// hundreds of nested features, which also keeps Leaflet interop predictable.
export const mapData = markRaw(map_data.features);
export const spBase = markRaw(sp_base);
export const gridGeojson = markRaw(grid_geojson);

// --- view state -------------------------------------------------------------

/**
 * All mutable app state in one reactive object.
 *
 * Deliberately a single `reactive` rather than a module of `ref`s: `<script
 * setup>` exposes imported bindings to the template as getters only, so
 * `@click="someImportedRef = x"` and `v-model="someImportedRef"` silently fail
 * to write. Property assignment on a reactive object has no such trap.
 */
export const state = reactive({
  mode: "Intro",
  sidebar: true,
  legend: true,
  settingsOpen: false,

  /** Selected grid squares, e.g. ["51b", "63a"]. */
  grid: [],

  /**
   * The selected species is stored as a SEQ rather than an object: the species
   * objects are rebuilt whenever the taxonomy changes, so holding one would go
   * stale. It also means a deep-linked ?species= and a click through the list
   * resolve to exactly the same record.
   */
  speciesSeq: null,

  displayPoorCoverage: true,
  displayNeverObserved: true,

  gridGeojsonVisible: false,
  countyGeojsonVisible: false,
  /** Loaded on demand (~7 MB) the first time the overlay is switched on. */
  countyGeojson: EMPTY_GEOJSON,

  showLost: true,
  showKept: true,
  showGained: true,

  sortSelected: "Taxonomy",
  redListSelected: "All",
  traitsSelected: [],

  taxonomySelected: readStoredTaxonomy(),
});

function readStoredTaxonomy() {
  try {
    const raw = localStorage.getItem("taxonomy_selected");
    if (raw != null) {
      const parsed = JSON.parse(raw);
      if (TAXONOMY_OPTIONS.includes(parsed)) return parsed;
    }
  } catch {
    // Unreadable or malformed: keep the default.
  }
  return DEFAULT_TAXONOMY;
}

watch(
  () => state.taxonomySelected,
  (value) => {
    try {
      localStorage.setItem("taxonomy_selected", JSON.stringify(value));
    } catch {
      // Not persistable here; the app still works for this session.
    }
  }
);

// --- URL <-> state ----------------------------------------------------------

/** Read ?mode / ?grid / ?species once at startup. */
export function restoreFromUrl(search = window.location.search) {
  const qp = new URLSearchParams(search);

  const urlMode = qp.get("mode");
  if (MODES.includes(urlMode)) state.mode = urlMode;

  const urlGrid = qp.get("grid");
  if (urlGrid) {
    const squares = new Set(mapData.map((f) => f.properties.Sq));
    state.grid = urlGrid.split(",").filter((sq) => squares.has(sq));
  }

  const urlSpecies = qp.get("species");
  if (urlSpecies && /^\d+$/.test(urlSpecies)) {
    const seq = Number(urlSpecies);
    if (spBase.some((s) => s.SEQ === seq)) state.speciesSeq = seq;
  }
}

/**
 * Mirror state into the query string. One watcher replaces the scattered
 * update_url() calls that used to live in click handlers and, in one case,
 * inside a computed property.
 */
export function syncUrl() {
  watch(
    () => [state.mode, state.grid.join(","), state.speciesSeq],
    () => {
      const qp = new URLSearchParams();
      if (state.mode) qp.set("mode", state.mode);
      if (state.grid.length) qp.set("grid", state.grid.join(","));
      if (state.speciesSeq != null) qp.set("species", String(state.speciesSeq));
      history.replaceState(null, "", "?" + qp.toString());
    },
    { immediate: true }
  );
}

// --- actions ----------------------------------------------------------------

export function toggleSquare(Sq) {
  const i = state.grid.indexOf(Sq);
  if (i === -1) state.grid.push(Sq);
  else state.grid.splice(i, 1);
}

export function clearSquares() {
  state.grid = [];
}

export async function loadCountyGeojson() {
  if (state.countyGeojson.features.length) return;
  const { default: county } = await import("./assets/county.json");
  state.countyGeojson = markRaw(county);
}
