import { describe, expect, it } from "vitest";

import { toCsv } from "../src/utils/csv";

describe("toCsv", () => {
  it("returns an empty string for no rows", () => {
    expect(toCsv([])).toBe("");
  });

  it("drops the ids, ratios and per-source link columns", () => {
    const csv = toCsv([
      {
        common_name: "Bateleur",
        IUCN: "Endangered",
        SEQ: 1,
        IUCNID: 2,
        per_lkgd: [1],
        per_lkgd_gc: [1],
        nb_lkgd: [1],
        nb_lkgd_gc: [1],
        sort: 3,
        kbm: [4],
        ebird: ["x"],
      },
    ]);
    expect(csv.split("\n")[0]).toBe("common_name,IUCN");
  });

  it("quotes values containing a comma", () => {
    // 26 species carry a comma inside `flag`; unquoted, they shift every
    // later column.
    const csv = toCsv([{ name: "River Prinia", flag: "Not recorded, but present" }]);
    expect(csv).toContain('"Not recorded, but present"');
    expect(csv.trim().split("\n")).toHaveLength(2);
  });

  it("doubles embedded quotes", () => {
    const csv = toCsv([{ flag: 'He said "no"' }]);
    expect(csv).toContain('"He said ""no"""');
  });

  it("quotes values containing newlines", () => {
    expect(toCsv([{ flag: "a\nb" }])).toContain('"a\nb"');
  });

  it("renders null and undefined as empty", () => {
    const csv = toCsv([{ a: null, b: undefined, c: 0 }]);
    expect(csv.trim().split("\n")[1]).toBe(",,0");
  });

  it("leaves ordinary values unquoted", () => {
    expect(toCsv([{ a: "plain" }]).trim().split("\n")[1]).toBe("plain");
  });
});
