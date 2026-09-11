import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_TAXONOMY, clearSquares, restoreFromUrl, state, toggleSquare } from "../src/store";

beforeEach(() => {
  state.mode = "Intro";
  state.grid = [];
  state.speciesSeq = null;
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
    expect(state.speciesSeq).toBe(42);
  });

  it.each(["notanumber", "", "null", "NaN", "-1", "4.2", "999999"])(
    "leaves speciesSeq null for ?species=%s",
    (value) => {
      // A non-numeric or unknown SEQ used to resolve to `undefined`, which is
      // not the same as "nothing selected".
      restoreFromUrl(`?species=${value}`);
      expect(state.speciesSeq).toBeNull();
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
    expect([state.mode, state.grid, state.speciesSeq]).toEqual(["Species", ["51b"], 42]);
  });

  it("leaves state alone for an empty query", () => {
    restoreFromUrl("");
    expect([state.mode, state.grid, state.speciesSeq]).toEqual(["Intro", [], null]);
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
