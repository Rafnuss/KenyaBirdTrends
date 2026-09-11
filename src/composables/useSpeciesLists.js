import { computed } from "vue";

import { DEFAULT_TAXONOMY, TAXONOMY_FIELDS, mapData, spBase, state } from "../store";

const RED_LIST_TIERS = {
  "Near Threatened": ["Critically Endangered", "Endangered", "Vulnerable", "Near Threatened"],
  Vulnerable: ["Critically Endangered", "Endangered", "Vulnerable"],
  Endangered: ["Critically Endangered", "Endangered"],
  "Critically Endangered": ["Critically Endangered"],
};

const TRAIT_FIELDS = {
  Endemic: "endemic",
  "Afrotropical migrant": "afrotropical",
  "Palearctic migrant": "palearctic",
  Waterbird: "waterbird",
};

/** Index into nb_lkgd / per_lkgd for each sort option. */
const SORT_INDEX = { Lost: 0, Kept: 1, Gained: 2, Difference: 3 };

/**
 * sp_base.json uses the string "0" as a placeholder for "no value" in a few
 * text columns (29 species have IUCN "0", one has scientific_name "0"). Left
 * alone it renders literally, and exports as a bogus IUCN category.
 */
const blank = (value) => (value === "0" || value === 0 ? null : value);

/** Species renamed into the selected taxonomy. */
export const spTaxo = computed(() => {
  const { sn, cn, s } =
    TAXONOMY_FIELDS[state.taxonomySelected] ?? TAXONOMY_FIELDS[DEFAULT_TAXONOMY];
  return spBase.map((sp) => ({
    scientific_name: blank(sp[sn]),
    common_name: sp[cn],
    sort: sp[s],
    per_lkgd: sp.per_lkgd,
    nb_lkgd: sp.nb_lkgd,
    per_lkgd_gc: sp.per_lkgd_gc,
    nb_lkgd_gc: sp.nb_lkgd_gc,
    kbm: sp.kbm,
    ebird: sp.ebird,
    IUCN: blank(sp.IUCN),
    IUCNID: sp.IUCNID,
    SEQ: sp.SEQ,
    endemic: sp.endemic,
    afrotropical: sp.afrotropical,
    palearctic: sp.palearctic,
    waterbird: sp.waterbird,
    flag: sp.flag,
  }));
});

/** The selected species, resolved in the current taxonomy. */
export const species = computed(() =>
  state.speciesSeq == null ? null : (spTaxo.value.find((sp) => sp.SEQ === state.speciesSeq) ?? null)
);

export const spFiltered = computed(() => {
  let out = spTaxo.value;
  for (const trait of state.traitsSelected) {
    const field = TRAIT_FIELDS[trait];
    if (field) out = out.filter((sp) => sp[field]);
  }
  const tier = RED_LIST_TIERS[state.redListSelected];
  if (tier) out = out.filter((sp) => tier.includes(sp.IUCN));
  return out;
});

export const spSorted = computed(() => {
  const key = state.sortSelected;
  if (key === "Taxonomy") return [...spFiltered.value].sort((a, b) => a.sort - b.sort);

  const field = key.includes("%") ? "per_lkgd" : "nb_lkgd";
  const entry = Object.keys(SORT_INDEX).find((k) => key.includes(k));
  if (!entry) return spFiltered.value;
  const i = SORT_INDEX[entry];
  // Copy first: spFiltered may hand back spTaxo itself when no filter is
  // active, and sorting in place would corrupt that cached computed.
  return [...spFiltered.value].sort((a, b) => b[field][i] - a[field][i]);
});

/** SEQs present in the selected squares, per period. */
export const seqInGrid = computed(() => {
  const selected = mapData.filter((f) => state.grid.includes(f.properties.Sq));
  return {
    new: new Set(selected.flatMap((f) => f.properties.SEQ_new)),
    old: new Set(selected.flatMap((f) => f.properties.SEQ_old)),
  };
});

/** [lost, kept, gained, difference] for the current view. */
export const lkgd = computed(() => {
  if (state.mode === "Grid" && state.grid.length > 0) {
    const { new: nw, old } = seqInGrid.value;
    const kept = [...old].filter((seq) => nw.has(seq)).length;
    return [old.size - kept, kept, nw.size - kept, nw.size - old.size];
  }

  const field = state.displayPoorCoverage ? "nb_lkgd" : "nb_lkgd_gc";
  if (state.mode === "Species" && species.value) return species.value[field];

  return spBase.reduce((acc, sp) => acc.map((v, i) => v + sp[field][i]), [0, 0, 0, 0]);
});

/** Species in the selected squares, tagged lost/kept/gained. */
export const gridList = computed(() => {
  const { new: nw, old } = seqInGrid.value;
  const wanted = { lost: state.showLost, kept: state.showKept, gained: state.showGained };
  return [...spTaxo.value]
    .sort((a, b) => a.sort - b.sort)
    .map((sp) => {
      const n = nw.has(sp.SEQ);
      const o = old.has(sp.SEQ);
      return { ...sp, trend: n && o ? "kept" : n ? "gained" : o ? "lost" : "" };
    })
    .filter((sp) => wanted[sp.trend] ?? false);
});
