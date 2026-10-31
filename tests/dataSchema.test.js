import { describe, expect, it } from "vitest";

import rawMapData from "../src/assets/map_data.json";
import rawSpBase from "../src/assets/sp_base.json";
import { TAXONOMY_FIELDS, TAXONOMY_OPTIONS } from "../src/store";

const fields = Object.keys(rawSpBase[0]);

/**
 * The UI declares which columns of sp_base.json it reads. When the data
 * pipeline and the app disagree, every species silently renders `undefined`
 * rather than failing loudly, so assert the contract directly.
 */
describe("sp_base.json matches what the app expects", () => {
  it.each(TAXONOMY_OPTIONS)("provides the columns for the %s taxonomy", (taxonomy) => {
    const { sn, cn, s } = TAXONOMY_FIELDS[taxonomy];
    expect(fields, `sp_base.json is missing columns for "${taxonomy}"`).toEqual(
      expect.arrayContaining([sn, cn, s])
    );
  });

  it.each([
    "SEQ",
    "IUCN",
    "nb_lkgd",
    "per_lkgd",
    "nb_lkgd_gc",
    "per_lkgd_gc",
    "flag",
    "ebird",
    "kbm",
  ])("provides %s", (field) => {
    expect(fields).toContain(field);
  });

  it.each(["avibase_id", "birdlife_url"])("provides the %s link column", (field) => {
    // The panels build the Avibase and BirdLife links straight from these.
    // They replaced IUCNID when the pipeline moved to AviList (2026-09).
    expect(fields).toContain(field);
  });

  it.each(["endemic", "afrotropical", "palearctic", "waterbird"])(
    "provides the %s trait filter column",
    (field) => {
      expect(fields).toContain(field);
    }
  );

  it("has a unique SEQ per species", () => {
    expect(new Set(rawSpBase.map((s) => s.SEQ)).size).toBe(rawSpBase.length);
  });

  it("gives every species an Avibase id", () => {
    // The point of the 2026 taxonomy pass: every concept resolves to a stable
    // Avibase id, lumps included - and no binomial can name a lump.
    const missing = rawSpBase.filter((s) => !/^avibase-[0-9A-F]{8}$/i.test(s.avibase_id ?? ""));
    expect(missing.map((s) => s.SEQ)).toEqual([]);
  });

  it("lists eBird codes as a flat array of species codes", () => {
    // Slash/spuh codes (y00820, ficedu1) have no eBird species page and used
    // to render as dead links; nesting also varied per row. Both fixed
    // upstream, so the panel can render one working link per entry.
    for (const sp of rawSpBase) {
      expect(Array.isArray(sp.ebird)).toBe(true);
      for (const code of sp.ebird) expect(typeof code).toBe("string");
    }
  });

  it("spells a missing value as null, not a placeholder", () => {
    // The pre-AviList export used the string "0", which rendered literally
    // and exported as a bogus IUCN category.
    const placeholders = rawSpBase.filter((s) => s.IUCN === "0" || s.scientific_name === "0");
    expect(placeholders.map((s) => s.SEQ)).toEqual([]);
  });
});

it("uses unique Avibase IDs and resolves every map membership", () => {
  const ids = new Set(rawSpBase.map((s) => s.avibase_id));
  expect(ids.size).toBe(rawSpBase.length);
  for (const { properties: p } of rawMapData.features) {
    for (const field of ["taxa_old", "taxa_new"]) {
      expect(Array.isArray(p[field])).toBe(true);
      for (const id of p[field]) expect(ids.has(id)).toBe(true);
    }
  }
});

it("reports difference as gained minus lost in both coverage views", () => {
  for (const sp of rawSpBase) {
    for (const field of ["nb_lkgd", "nb_lkgd_gc"]) {
      expect(sp[field][3], `${sp.avibase_id} ${field}`).toBe(sp[field][2] - sp[field][0]);
    }
  }
});

it("matches species counts to the map squares in both coverage views", () => {
  for (const [field, goodCoverage] of [
    ["nb_lkgd", false],
    ["nb_lkgd_gc", true],
  ]) {
    const counts = new Map(rawSpBase.map((sp) => [sp.avibase_id, [0, 0, 0, 0]]));
    for (const { properties: p } of rawMapData.features) {
      if (goodCoverage && p.mask) continue;
      const old = new Set(p.taxa_old);
      const modern = new Set(p.taxa_new);
      for (const id of new Set([...old, ...modern])) {
        const n = modern.has(id);
        const o = old.has(id);
        const row = counts.get(id);
        row[o && n ? 1 : o ? 0 : 2] += 1;
        row[3] += Number(n) - Number(o);
      }
    }
    for (const sp of rawSpBase)
      expect(sp[field], `${sp.avibase_id} ${field}`).toEqual(counts.get(sp.avibase_id));
  }
});

it("retains both original atlas concepts for the merged barbet and supplies eBird links", () => {
  const barbet = rawSpBase.find((sp) => sp.SEQ === 497);
  expect(barbet.atlas_concepts.map((taxon) => taxon.avibase_id)).toEqual([
    "avibase-1953C1D6",
    "avibase-55E9B668",
  ]);
  expect(rawSpBase.some((sp) => sp.SEQ === 498)).toBe(false);
  expect(rawSpBase.every((sp) => sp.ebird.length > 0)).toBe(true);
});

it("exports curated public warnings without internal review notes", () => {
  const ostrich = rawSpBase.find((sp) => sp.SEQ === 1);
  expect(ostrich.flag).toContain("Atlas p. 41");
  expect(rawSpBase.every((sp) => !("taxonomy_notes" in sp))).toBe(true);
});
