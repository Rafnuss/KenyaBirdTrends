import { describe, expect, it } from "vitest";

import { buildFoundAsset } from "../src/utils/foundData";

// One square, 51b = E037N00B, with a 0.5° polygon and its map_data point.
const grid = {
  features: [
    {
      id: 1,
      geometry: {
        coordinates: [
          [
            [37.5, 0.5],
            [38, 0.5],
            [38, 1],
            [37.5, 1],
            [37.5, 0.5],
          ],
        ],
      },
    },
  ],
};
const mapData = (taxa_old, taxa_new, taxa_old_other = []) => ({
  features: [{ id: 1, properties: { Sq: "51b", taxa_old, taxa_new, taxa_old_other } }],
});
const spBase = [
  { avibase_id: "C-ostrich", ebird: ["ostric2", "ostric3"] },
  { avibase_id: "C-lark", ebird: ["runlar1"] },
  { avibase_id: "C-greenbul", ebird: ["easmog2"] },
];
const species = [
  {
    species_id: "S-common",
    species_code: "ostric2",
    common_name: "Common Ostrich",
    scientific_name: "",
    taxon_order: "1",
  },
  {
    species_id: "S-somali",
    species_code: "ostric3",
    common_name: "Somali Ostrich",
    scientific_name: "",
    taxon_order: "2",
  },
  {
    species_id: "S-lark",
    species_code: "runlar1",
    common_name: "Rufous-naped Lark",
    scientific_name: "",
    taxon_order: "3",
  },
  {
    species_id: "S-kikuyu",
    species_code: "easmog5",
    common_name: "Kikuyu Mountain Greenbul",
    scientific_name: "",
    taxon_order: "4",
  },
  {
    species_id: "S-vagrant",
    species_code: "grebit1",
    common_name: "Eurasian Bittern",
    scientific_name: "",
    taxon_order: "5",
  },
];
const manifest = {
  created_at: "2026-11-04",
  taxonomy: { version: "2026" },
  policies: { historical_before: "2009-01-01", found_from: "2024-01-01" },
  date_range: {},
};
const row = (species_id, extra) => ({
  qdgc: "E037N00B",
  species_id,
  hist_date: "",
  hist_source: "",
  hist_id: "",
  mid_date: "",
  found_date: "",
  ...extra,
});
const finder = (species_id, date, person, id) => ({
  qdgc: "E037N00B",
  species_id,
  date,
  source: "ebird",
  id,
  observer_id: person,
  observer_name: person.toUpperCase(),
  person: `ebird:${person}`,
  lat: "0.61234567",
  lng: "37.71",
  pentad: "",
});

function build({
  taxaOld = [],
  taxaNew = [],
  taxaOldOther = [],
  latest = [],
  finders = [],
  extraMembers = [],
}) {
  return buildFoundAsset({
    grid,
    mapData: mapData(taxaOld, taxaNew, taxaOldOther),
    spBase,
    latest,
    finders,
    species,
    manifest,
    extraMembers,
  }).asset;
}

describe("buildFoundAsset", () => {
  it("keeps an old-atlas concept unseen since as a target with no last-seen record", () => {
    const sq = build({ taxaOld: ["C-lark"] }).squares["51b"];
    expect(sq.t).toEqual([["C-lark", null]]);
  });

  it("drops a concept recorded in 2009–2023 (new atlas or mid-period record)", () => {
    expect(build({ taxaOld: ["C-lark"], taxaNew: ["C-lark"] }).squares["51b"]).toBeUndefined();
    const latest = [row("S-lark", { hist_date: "1990-01-01", mid_date: "2015-01-01" })];
    expect(build({ latest }).squares["51b"]).toBeUndefined();
  });

  it("makes an eBird pre-2009 record a target, and credits every first-day finder", () => {
    const latest = [
      row("S-lark", {
        hist_date: "1995-05-05",
        hist_source: "ebird",
        hist_id: "S1",
        found_date: "2025-02-02",
      }),
    ];
    const finders = [
      finder("S-lark", "2025-02-02", "obsr1", "S9"),
      finder("S-lark", "2025-02-02", "obsr2", "S8"),
    ];
    const asset = build({ latest, finders });
    const [unit, date, who, lastSeen] = asset.squares["51b"].r[0];
    expect([unit, date, lastSeen]).toEqual(["C-lark", "2025-02-02", ["1995-05-05", "ebird", "S1"]]);
    expect(who.map(([p]) => asset.people[p][0])).toEqual(["OBSR1", "OBSR2"]);
    expect(who[0].slice(1)).toEqual(["ebird", "S9", 0.61235, 37.71]);
  });

  it("shows a person linked across KBM and eBird once, with the eBird ID", () => {
    const latest = [row("S-vagrant", { found_date: "2026-01-01", first_date: "2026-01-01" })];
    const kbm = {
      ...finder("S-vagrant", "2026-01-01", "40842", "C1"),
      source: "abap",
      observer_name: "James Omenya",
      person: "James Omenya",
    };
    const eb = {
      ...finder("S-vagrant", "2026-01-01", "obsr1445870", "S7"),
      person: "James Omenya",
    };
    const asset = build({ latest, finders: [kbm, eb] });
    expect(asset.people).toEqual([["James Omenya", "ebird", "obsr1445870"]]);
    expect(asset.squares["51b"].n[0][2]).toHaveLength(1);
  });

  describe("Kenya as one area", () => {
    // E040N01A is outside the test grid: it counts for the country only.
    const elsewhere = (species_id, extra) => ({ ...row(species_id, extra), qdgc: "E040N01A" });

    it("counts a species re-found in several cells once", () => {
      const latest = [
        row("S-lark", { hist_date: "1990-01-01", found_date: "2025-05-01" }),
        elsewhere("S-lark", { hist_date: "1995-01-01", found_date: "2024-02-01" }),
      ];
      const { country } = build({ latest });
      expect(country.r.map((r) => [r[0], r[1]])).toEqual([["C-lark", "2024-02-01"]]);
    });

    it("is not new to Kenya when recorded before 2024 in another cell", () => {
      const latest = [
        row("S-vagrant", { found_date: "2025-01-01", first_date: "2025-01-01" }),
        elsewhere("S-vagrant", { first_date: "2015-01-01", mid_date: "2015-01-01" }),
      ];
      const asset = build({ latest });
      expect(asset.squares["51b"].n[0][0]).toBe("S-vagrant");
      expect(asset.country.n).toEqual([]);
      expect(asset.country.r).toEqual([]);
    });

    it("is not a Kenya target when recorded in 2009–2023 anywhere", () => {
      const latest = [elsewhere("S-lark", { mid_date: "2012-01-01", first_date: "2012-01-01" })];
      const asset = build({ taxaOld: ["C-lark"], latest });
      expect(asset.squares["51b"].t[0][0]).toBe("C-lark");
      expect(asset.country.t).toEqual([]);
    });
  });

  it("keeps the pentad of a KBM find", () => {
    const latest = [row("S-vagrant", { found_date: "2026-01-01", first_date: "2026-01-01" })];
    const kbm = {
      ...finder("S-vagrant", "2026-01-01", "k", "C1"),
      source: "abap",
      lat: "0.70833",
      lng: "37.625",
      pentad: "c0040_3735",
    };
    const [, , who] = build({ latest, finders: [kbm] }).squares["51b"].n[0];
    expect(who[0].slice(1)).toEqual(["abap", "C1", 0.70833, 37.625, "c0040_3735"]);
  });

  it("rolls member species up to their concept: any member re-finds the group", () => {
    const latest = [
      row("S-common", { found_date: "2025-06-01" }),
      row("S-somali", { found_date: "2024-03-01" }),
    ];
    const finders = [
      finder("S-common", "2025-06-01", "a", "S1"),
      finder("S-somali", "2024-03-01", "b", "S2"),
    ];
    const asset = build({ taxaOld: ["C-ostrich"], latest, finders });
    const [unit, date, who] = asset.squares["51b"].r[0];
    expect([unit, date]).toEqual(["C-ostrich", "2024-03-01"]);
    expect(who.map(([p]) => asset.people[p][0])).toEqual(["B"]);
  });

  it("counts a species never recorded before as new, standalone if it has no concept", () => {
    const latest = [row("S-vagrant", { found_date: "2026-01-01" })];
    const asset = build({ latest, finders: [finder("S-vagrant", "2026-01-01", "x", "S5")] });
    expect(asset.squares["51b"].n[0][0]).toBe("S-vagrant");
    expect(asset.standalone["S-vagrant"][0]).toBe("Eurasian Bittern");
  });

  it("applies reviewed extra concept members", () => {
    const latest = [row("S-kikuyu", { found_date: "2025-01-01" })];
    const extraMembers = [{ ebird_code: "easmog5", concept_avibase_id: "C-greenbul" }];
    const asset = build({ taxaOld: ["C-greenbul"], latest, extraMembers });
    expect(asset.squares["51b"].r[0][0]).toBe("C-greenbul");
    expect(asset.standalone["S-kikuyu"]).toBeUndefined();
  });

  it("counts an atlas record from any period (pre-1970, post-1984) as historical", () => {
    expect(build({ taxaOldOther: ["C-lark"] }).squares["51b"].t[0][0]).toBe("C-lark");
    const latest = [row("S-lark", { found_date: "2025-01-01", first_date: "2025-01-01" })];
    const sq = build({ taxaOldOther: ["C-lark"], latest }).squares["51b"];
    expect(sq.n).toEqual([]);
    expect(sq.r[0][0]).toBe("C-lark");
  });

  it("is never new if recorded before 2024, even only on an imprecise checklist", () => {
    // first_date 1999 from a long travelling list: no precise hist, so not a target either.
    const latest = [row("S-lark", { found_date: "2025-01-01", first_date: "1999-01-01" })];
    expect(build({ latest }).squares["51b"]).toBeUndefined();
  });
});
