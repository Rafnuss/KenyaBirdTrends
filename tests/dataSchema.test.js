import { describe, expect, it } from "vitest";

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

  it.each(["SEQ", "IUCN", "nb_lkgd", "per_lkgd", "nb_lkgd_gc", "per_lkgd_gc", "flag", "ebird", "kbm"])(
    "provides %s",
    (field) => {
      expect(fields).toContain(field);
    }
  );

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
