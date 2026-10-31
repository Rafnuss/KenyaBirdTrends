import rawSpBase from "../src/assets/sp_base.json";
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_TAXONOMY, clearSquares, restoreFromUrl, state, toggleSquare } from "../src/store";

beforeEach(() => {
  state.mode = "Intro";
  state.grid = [];
  state.speciesId = null;
});

describe("restoreFromUrl", () => {
  it("reads a valid mode", () => {
    restoreFromUrl("?mode=Grid");
    expect(state.mode).toBe("Grid");
  });

  it("ignores an unknown mode rather than showing a blank screen", () => {
    restoreFromUrl("?mode=Nonsense");
    expect(state.mode).toBe("Intro");
  });

  it("reads a species SEQ", () => {
    restoreFromUrl("?species=42");
    expect(state.speciesId).toBe(rawSpBase.find((s) => s.SEQ === 42).avibase_id);
  });

  it.each(["notanumber", "", "null", "NaN", "-1", "4.2", "999999"])(
    "leaves speciesSeq null for ?species=%s",
    (value) => {
      // A non-numeric or unknown SEQ used to resolve to `undefined`, which is
      // not the same as "nothing selected".
      restoreFromUrl(`?species=${value}`);
      expect(state.speciesId).toBeNull();
    }
  );

  it("reads grid squares", () => {
    restoreFromUrl("?grid=51b,63a");
    expect(state.grid).toEqual(["51b", "63a"]);
  });

  it("drops squares that do not exist", () => {
    restoreFromUrl("?grid=51b,notasquare,63a");
    expect(state.grid).toEqual(["51b", "63a"]);
  });

  it("reads all three together", () => {
    restoreFromUrl("?mode=Species&grid=51b&species=42");
    expect([state.mode, state.grid, state.speciesId]).toEqual([
      "Species",
      ["51b"],
      rawSpBase.find((s) => s.SEQ === 42).avibase_id,
    ]);
  });

  it("leaves state alone for an empty query", () => {
    restoreFromUrl("");
    expect([state.mode, state.grid, state.speciesId]).toEqual(["Intro", [], null]);
  });
});

describe("toggleSquare", () => {
  it("adds then removes", () => {
    toggleSquare("51b");
    expect(state.grid).toEqual(["51b"]);
    toggleSquare("51b");
    expect(state.grid).toEqual([]);
  });

  it("keeps other squares when removing one", () => {
    toggleSquare("51b");
    toggleSquare("63a");
    toggleSquare("51b");
    expect(state.grid).toEqual(["63a"]);
  });
});

describe("clearSquares", () => {
  it("empties the selection", () => {
    toggleSquare("51b");
    clearSquares();
    expect(state.grid).toEqual([]);
  });
});

describe("defaults", () => {
  it("starts on a valid taxonomy", () => {
    expect(state.taxonomySelected).toBe(DEFAULT_TAXONOMY);
  });
});

it("restores an Avibase deep link", () => {
  const id = rawSpBase[0].avibase_id;
  restoreFromUrl(`?mode=Species&species=${id}`);
  expect(state.speciesId).toBe(id);
});

it.each(["498", "avibase-55E9B668"])("resolves merged atlas alias %s to the current barbet", (alias) => {
  restoreFromUrl(`?mode=Species&species=${alias}`);
  expect(state.speciesId).toBe("avibase-1953C1D6");
});
