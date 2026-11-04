import { describe, expect, it } from "vitest";

import grid from "../src/assets/grid.json";
import mapData from "../src/assets/map_data.json";
import { buildSquares, qdgcLevel1 } from "../src/utils/squares";

const squares = buildSquares(grid, mapData);

describe("qdgcLevel1", () => {
  it.each([
    [0.75, 37.75, "E037N00B"], // Sq 51b
    [-0.25, 37.25, "E037S00A"], // Sq 63a
    [-0.75, -0.25, "W000S00D"], // checked against bird_atlas.grid.latlng2qdgc
    [4.75, 34.25, "E034N04A"],
  ])("(%f, %f) -> %s", (lat, lng, code) => {
    expect(qdgcLevel1(lat, lng)).toBe(code);
  });
});

/**
 * The latest-record import joins bird-atlas output to the site by QDGC code.
 * If KenyaAtlasComparison ever regenerates the grid differently, fail here
 * rather than putting records in the wrong square.
 */
describe("atlas squares are QDGC level-1 cells", () => {
  it("has 228 squares, each with a unique Sq and qdgc", () => {
    expect(squares).toHaveLength(228);
    expect(new Set(squares.map((s) => s.Sq)).size).toBe(228);
    expect(new Set(squares.map((s) => s.qdgc)).size).toBe(228);
  });

  it("uses exact 0.5° cells on the half-degree lattice", () => {
    for (const { bounds } of squares) {
      const [west, south, east, north] = bounds;
      expect(east - west).toBe(0.5);
      expect(north - south).toBe(0.5);
      expect(Number.isInteger(west * 2)).toBe(true);
      expect(Number.isInteger(south * 2)).toBe(true);
    }
  });

  it("gives Sq the QDGC quadrant letter and one degree cell per number", () => {
    const degreeOf = new Map();
    for (const { Sq, qdgc } of squares) {
      const [, number, letter] = Sq.match(/^(\d+)([abcd])$/);
      expect(letter).toBe(qdgc.at(-1).toLowerCase());
      if (!degreeOf.has(number)) degreeOf.set(number, qdgc.slice(0, 7));
      expect(degreeOf.get(number), `Sq ${Sq}`).toBe(qdgc.slice(0, 7));
    }
  });

  it.each([
    ["51b", "E037N00B"],
    ["63a", "E037S00A"],
  ])("maps %s to %s", (Sq, qdgc) => {
    expect(squares.find((s) => s.Sq === Sq).qdgc).toBe(qdgc);
  });
});
