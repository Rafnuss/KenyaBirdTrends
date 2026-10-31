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
 * The pre-AviList sp_base.json used the string "0" as a placeholder for "no
 * value" in a few text columns (29 species had IUCN "0", one had
 * scientific_name "0"). The current pipeline emits null instead, but this
 * stays as a cheap guard: left unhandled a "0" renders literally and exports
 * as a bogus IUCN category.
 */
const blank = (value) => (value === "0" || value === 0 ? null : value);

export function compactSharedName(name) {
  if (!name?.includes(" / ")) return name;
  const parts = name.split(" / ").map((part) => part.split(" "));
  const suffix = [];
  while (parts.every((part) => part.length > 1 && part.at(-1) === parts[0].at(-1))) {
    suffix.unshift(parts[0].at(-1));
    parts.forEach((part) => part.pop());
  }
  return suffix.length ? `${parts.map((part) => part.join(" ")).join(" / ")} ${suffix.join(" ")}` : name;
}

/** Species renamed into the selected taxonomy. */
export const spTaxo = computed(() => {
  const { sn, cn, s } =
    TAXONOMY_FIELDS[state.taxonomySelected] ?? TAXONOMY_FIELDS[DEFAULT_TAXONOMY];
  return spBase.map((sp) => ({
    scientific_name: blank(sp[sn]),
    common_name: compactSharedName(sp[cn]),
    sort: sp[s],
    per_lkgd: sp.per_lkgd,
    nb_lkgd: sp.nb_lkgd,
    per_lkgd_gc: sp.per_lkgd_gc,
    nb_lkgd_gc: sp.nb_lkgd_gc,
    kbm: sp.kbm,
    ebird: sp.ebird,
    avibase_id: sp.avibase_id,
    IUCN: blank(sp.IUCN),
    birdlife_url: sp.birdlife_url,
    SEQ: sp.SEQ,
    original_common_name: sp.common_name,
    original_scientific_name: sp.scientific_name,
    avilist_common_name: compactSharedName(sp.avilist_common_name),
    avilist_scientific_name: sp.avilist_scientific_name,
    avilist_members: sp.avilist_members,
    name_source: sp.name_source,
    atlas_seq: sp.atlas_seq,
    atlas_concepts: sp.atlas_concepts ?? [],
    endemic: sp.endemic,
    afrotropical: sp.afrotropical,
    palearctic: sp.palearctic,
    waterbird: sp.waterbird,
    flag: sp.flag,
  }));
});

/** The selected species, resolved in the current taxonomy. */
export const species = computed(() =>
  state.speciesId == null
    ? null
    : (spTaxo.value.find((sp) => sp.avibase_id === state.speciesId) ?? null)
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

/** Avibase IDs present in the selected squares, per period. */
export const taxaInGrid = computed(() => {
  const selected = mapData.filter((f) => state.grid.includes(f.properties.Sq));
  return {
    new: new Set(selected.flatMap((f) => f.properties.taxa_new)),
    old: new Set(selected.flatMap((f) => f.properties.taxa_old)),
  };
});

/** [lost, kept, gained, difference] for the current view. */
export const lkgd = computed(() => {
  if (state.mode === "Grid" && state.grid.length > 0) {
    const { new: nw, old } = taxaInGrid.value;
    const kept = [...old].filter((seq) => nw.has(seq)).length;
    return [old.size - kept, kept, nw.size - kept, nw.size - old.size];
  }

  const field = state.displayPoorCoverage ? "nb_lkgd" : "nb_lkgd_gc";
  if (state.mode === "Species" && species.value) return species.value[field];

  return spBase.reduce((acc, sp) => acc.map((v, i) => v + sp[field][i]), [0, 0, 0, 0]);
});

/** Species in the selected squares, tagged lost/kept/gained. */
export const gridList = computed(() => {
  const { new: nw, old } = taxaInGrid.value;
  const wanted = { lost: state.showLost, kept: state.showKept, gained: state.showGained };
  return [...spTaxo.value]
    .sort((a, b) => a.sort - b.sort)
    .map((sp) => {
      const n = nw.has(sp.avibase_id);
      const o = old.has(sp.avibase_id);
      return { ...sp, trend: n && o ? "kept" : n ? "gained" : o ? "lost" : "" };
    })
    .filter((sp) => wanted[sp.trend] ?? false);
});
