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

  it("provides the species link columns the panels render", () => {
    // IucnBadge builds the IUCN redirect from IUCNID. When the pipeline moves
    // to the AviList schema this fails loudly, which is the point: the app
    // would otherwise render `undefined` for every species in silence.
    expect(fields).toContain("IUCNID");
  });

  it("has a unique SEQ per species", () => {
    expect(new Set(rawSpBase.map((s) => s.SEQ)).size).toBe(rawSpBase.length);
  });
});
