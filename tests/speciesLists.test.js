import { beforeEach, describe, expect, it } from "vitest";

import rawMapData from "../src/assets/map_data.json";
import rawSpBase from "../src/assets/sp_base.json";
import { DEFAULT_TAXONOMY, TAXONOMY_FIELDS, TAXONOMY_OPTIONS, state } from "../src/store";
import {
  gridList,
  lkgd,
  seqInGrid,
  spFiltered,
  spSorted,
  spTaxo,
  species,
} from "../src/composables/useSpeciesLists";

const features = rawMapData.features;

/**
 * Expected values recomputed from the raw JSON, independently of the
 * implementation. These were previously worked out by hand on every change;
 * encoding them here is the point of this file.
 */
function oracle(squares) {
  const selected = features.filter((f) => squares.includes(f.properties.Sq));
  const nw = new Set(selected.flatMap((f) => f.properties.SEQ_new));
  const old = new Set(selected.flatMap((f) => f.properties.SEQ_old));
  const kept = [...old].filter((s) => nw.has(s)).length;
  return {
    lkgd: [old.size - kept, kept, nw.size - kept, nw.size - old.size],
    involved: rawSpBase.filter((sp) => nw.has(sp.SEQ) || old.has(sp.SEQ)).length,
    lostOnly: rawSpBase.filter((sp) => old.has(sp.SEQ) && !nw.has(sp.SEQ)).length,
    gainedOnly: rawSpBase.filter((sp) => nw.has(sp.SEQ) && !old.has(sp.SEQ)).length,
  };
}

/** Mirrors the "0" placeholder handling in spTaxo. */
const blank = (v) => (v === "0" || v === 0 ? null : v);

const totals = (field) =>
  rawSpBase.reduce((acc, sp) => acc.map((v, i) => v + sp[field][i]), [0, 0, 0, 0]);

function reset() {
  state.mode = "Species";
  state.grid = [];
  state.speciesSeq = null;
  state.taxonomySelected = DEFAULT_TAXONOMY;
  state.sortSelected = "Taxonomy";
  state.redListSelected = "All";
  state.traitsSelected = [];
  state.showLost = true;
  state.showKept = true;
  state.showGained = true;
  state.displayPoorCoverage = true;
  state.displayNeverObserved = true;
}

beforeEach(reset);

describe("spTaxo", () => {
  it("covers every species once", () => {
    expect(spTaxo.value).toHaveLength(rawSpBase.length);
    expect(new Set(spTaxo.value.map((s) => s.SEQ)).size).toBe(rawSpBase.length);
  });

  it("renames according to the selected taxonomy", () => {
    // Expectations come from the declared mapping, so this keeps testing the
    // renaming logic when the set of taxonomies changes.
    for (const taxonomy of TAXONOMY_OPTIONS) {
      state.taxonomySelected = taxonomy;
      const { sn, cn } = TAXONOMY_FIELDS[taxonomy];
      const raw = rawSpBase.find((s) => s.SEQ === 1);
      const first = spTaxo.value.find((s) => s.SEQ === 1);
      expect(first.scientific_name).toBe(blank(raw[sn]));
      expect(first.common_name).toBe(raw[cn]);
    }
  });

  it("falls back to the default for an unknown taxonomy", () => {
    state.taxonomySelected = "not a taxonomy";
    const { sn } = TAXONOMY_FIELDS[DEFAULT_TAXONOMY];
    const first = spTaxo.value.find((s) => s.SEQ === 1);
    expect(first.scientific_name).toBe(blank(rawSpBase.find((s) => s.SEQ === 1)[sn]));
  });
});

describe("species", () => {
  it("is null when nothing is selected", () => {
    expect(species.value).toBeNull();
  });

  it("resolves the SEQ within the current taxonomy", () => {
    // Same bird throughout; the name must follow the taxonomy rather than go
    // stale, which is why the store holds a SEQ and not a species object.
    const raw = rawSpBase.find((s) => s.SEQ === 42);
    state.speciesSeq = 42;
    for (const taxonomy of TAXONOMY_OPTIONS) {
      state.taxonomySelected = taxonomy;
      expect(species.value.SEQ).toBe(42);
      expect(species.value.common_name).toBe(raw[TAXONOMY_FIELDS[taxonomy].cn]);
    }
  });

  it("is null for a SEQ that does not exist", () => {
    state.speciesSeq = 999999;
    expect(species.value).toBeNull();
  });
});

describe("spFiltered", () => {
  it("is everything by default", () => {
    expect(spFiltered.value).toHaveLength(rawSpBase.length);
  });

  it("narrows by red list tier, cumulatively", () => {
    const count = (tier) => {
      state.redListSelected = tier;
      return spFiltered.value.length;
    };
    const cr = count("Critically Endangered");
    const en = count("Endangered");
    const vu = count("Vulnerable");
    const nt = count("Near Threatened");
    expect(cr).toBeLessThanOrEqual(en);
    expect(en).toBeLessThanOrEqual(vu);
    expect(vu).toBeLessThanOrEqual(nt);
    expect(en).toBe(rawSpBase.filter((s) => ["Critically Endangered", "Endangered"].includes(s.IUCN)).length);
  });

  it("narrows by trait", () => {
    state.traitsSelected = ["Endemic"];
    expect(spFiltered.value).toHaveLength(rawSpBase.filter((s) => s.endemic).length);
    expect(spFiltered.value.every((s) => s.endemic)).toBe(true);
  });

  it("combines traits with the red list", () => {
    state.traitsSelected = ["Endemic"];
    state.redListSelected = "Endangered";
    expect(spFiltered.value.every((s) => s.endemic)).toBe(true);
    expect(
      spFiltered.value.every((s) => ["Critically Endangered", "Endangered"].includes(s.IUCN))
    ).toBe(true);
  });
});

describe("spSorted", () => {
  it("does not mutate its upstream", () => {
    // spFiltered can hand back spTaxo itself; sorting in place corrupted it.
    const before = spTaxo.value.map((s) => s.SEQ);
    state.sortSelected = "# Lost";
    void spSorted.value;
    state.sortSelected = "Taxonomy";
    expect(spTaxo.value.map((s) => s.SEQ)).toEqual(before);
  });

  it("orders by taxonomy by default", () => {
    const sorts = spSorted.value.map((s) => s.sort);
    expect([...sorts].sort((a, b) => a - b)).toEqual(sorts);
  });

  it.each([
    ["# Lost", "nb_lkgd", 0],
    ["# Kept", "nb_lkgd", 1],
    ["# Gained", "nb_lkgd", 2],
    ["# Difference", "nb_lkgd", 3],
    ["% Lost", "per_lkgd", 0],
    ["% Gained", "per_lkgd", 2],
  ])("orders by %s descending", (option, field, index) => {
    state.sortSelected = option;
    const values = spSorted.value.map((s) => s[field][index]);
    expect([...values].sort((a, b) => b - a)).toEqual(values);
  });

  it("keeps every species when sorting", () => {
    state.sortSelected = "# Lost";
    expect(spSorted.value).toHaveLength(rawSpBase.length);
  });
});

describe("lkgd", () => {
  it("totals all species when nothing is selected", () => {
    expect(lkgd.value).toEqual(totals("nb_lkgd"));
  });

  it("uses the good-coverage totals when poor coverage is hidden", () => {
    state.displayPoorCoverage = false;
    expect(lkgd.value).toEqual(totals("nb_lkgd_gc"));
  });

  it("uses the selected species' own figures", () => {
    state.speciesSeq = 42;
    expect(lkgd.value).toEqual(rawSpBase.find((s) => s.SEQ === 42).nb_lkgd);
  });

  it("counts lost/kept/gained across the selected squares in grid mode", () => {
    state.mode = "Grid";
    state.grid = ["51b", "63a"];
    expect(lkgd.value).toEqual(oracle(["51b", "63a"]).lkgd);
    // Regression anchor from a hand-checked run.
    expect(lkgd.value).toEqual([21, 528, 101, 80]);
  });

  it("falls back to totals in grid mode with nothing selected", () => {
    state.mode = "Grid";
    expect(lkgd.value).toEqual(totals("nb_lkgd"));
  });
});

describe("seqInGrid", () => {
  it("is empty with no selection", () => {
    expect(seqInGrid.value.new.size).toBe(0);
    expect(seqInGrid.value.old.size).toBe(0);
  });

  it("unions the squares", () => {
    state.grid = ["51b", "63a"];
    const selected = features.filter((f) => ["51b", "63a"].includes(f.properties.Sq));
    expect(seqInGrid.value.new).toEqual(new Set(selected.flatMap((f) => f.properties.SEQ_new)));
  });
});

describe("gridList", () => {
  beforeEach(() => {
    state.mode = "Grid";
    state.grid = ["51b", "63a"];
  });

  it("lists every species present in either period", () => {
    const expected = oracle(["51b", "63a"]);
    expect(gridList.value).toHaveLength(expected.involved);
    expect(gridList.value).toHaveLength(650); // regression anchor
  });

  it("tags each species with a trend", () => {
    expect(new Set(gridList.value.map((s) => s.trend))).toEqual(
      new Set(["lost", "kept", "gained"])
    );
  });

  it("respects the trend filters", () => {
    const expected = oracle(["51b", "63a"]);

    state.showKept = false;
    expect(gridList.value).toHaveLength(expected.lostOnly + expected.gainedOnly);
    expect(gridList.value).toHaveLength(122); // regression anchor

    state.showGained = false;
    expect(gridList.value).toHaveLength(expected.lostOnly);
    expect(gridList.value).toHaveLength(21); // regression anchor

    state.showLost = false;
    expect(gridList.value).toHaveLength(0);
  });

  it("excludes species absent from both periods", () => {
    expect(gridList.value.every((s) => s.trend !== "")).toBe(true);
  });

  it("is ordered by taxonomy", () => {
    const sorts = gridList.value.map((s) => s.sort);
    expect([...sorts].sort((a, b) => a - b)).toEqual(sorts);
  });
});

describe("eBird codes in sp_base.json", () => {
  it("are reachable by flattening, whichever shape a species uses", () => {
    // 1025 species nest their codes ([["golher1"]]); 40 list them flat.
    const shapes = new Set(
      rawSpBase.map((sp) => (sp.ebird ?? []).some((e) => Array.isArray(e)) ? "nested" : "flat")
    );
    expect(shapes.size).toBeGreaterThan(1);
    for (const sp of rawSpBase) {
      const codes = (sp.ebird ?? []).flat(Infinity).filter(Boolean);
      expect(codes.every((c) => typeof c === "string" && c.length > 1)).toBe(true);
    }
  });
});

describe("placeholder values in sp_base.json", () => {
  it('treats the string "0" as no value', () => {
    // 29 species carry IUCN "0" and one a scientific_name of "0"; these used
    // to render literally and export as a bogus IUCN category.
    expect(rawSpBase.some((sp) => sp.IUCN === "0")).toBe(true);
    expect(spTaxo.value.some((sp) => sp.IUCN === "0")).toBe(false);
    expect(spTaxo.value.some((sp) => sp.scientific_name === "0")).toBe(false);
  });

  it("keeps real categories intact", () => {
    const real = spTaxo.value.filter((sp) => sp.IUCN).map((sp) => sp.IUCN);
    expect(real).toContain("Least Concern");
    expect(real.length).toBeGreaterThan(900);
  });
});
