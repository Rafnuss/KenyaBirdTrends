import { beforeEach, describe, expect, it } from "vitest";

import rawMapData from "../src/assets/map_data.json";
import { state } from "../src/store";
import { circleStyles } from "../src/composables/useCircleLayer";

const features = rawMapData.features;
const covered = features.filter(
  (f) => !(f.properties.cov_old == "0" && f.properties.cov_new == 0)
);
const styleFor = (Sq) => circleStyles.value.find((c) => c.Sq === Sq)?.style;

beforeEach(() => {
  state.mode = "Species";
  state.grid = [];
  state.speciesSeq = null;
  state.displayPoorCoverage = true;
  state.displayNeverObserved = true;
});

describe("circleStyles", () => {
  it("covers the squares that have coverage in either period", () => {
    expect(circleStyles.value).toHaveLength(covered.length);
    expect(circleStyles.value).toHaveLength(215); // regression anchor
  });

  it("does not write back onto mapData", () => {
    // The old version assigned `style` onto its own reactive dependency,
    // which makes a Vue 3 computed invalidate itself.
    void circleStyles.value;
    expect(features.every((f) => !("style" in f))).toBe(true);
  });

  it("gives every square a usable radius", () => {
    expect(circleStyles.value.every((c) => Number.isFinite(c.style.radius))).toBe(true);
    expect(circleStyles.value.every((c) => c.style.radius > 0)).toBe(true);
  });

  it("colours by lost/kept/gained in species mode", () => {
    state.speciesSeq = 42;
    const colours = new Set(circleStyles.value.map((c) => c.style.fillColor));
    // amber kept, red lost, green gained, black never-observed
    expect([...colours].sort()).toEqual(
      ["#000000", "#45aa59", "#d73027", "#fee08b"].filter((c) => colours.has(c)).sort()
    );
  });

  it("hides never-observed squares when that toggle is off", () => {
    state.speciesSeq = 42;
    const before = circleStyles.value.filter((c) => c.style.visible).length;
    state.displayNeverObserved = false;
    const after = circleStyles.value.filter((c) => c.style.visible).length;
    expect(after).toBeLessThan(before);
  });

  it("hides poorly covered squares when that toggle is off", () => {
    state.speciesSeq = 42;
    const before = circleStyles.value.filter((c) => c.style.visible).length;
    state.displayPoorCoverage = false;
    expect(circleStyles.value.filter((c) => c.style.visible).length).toBeLessThan(before);
  });

  it("uses the diverging scale in grid mode", () => {
    state.mode = "Grid";
    const style = styleFor("51b");
    expect(style.fillColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(style.fillOpacity).toBe(0.9);
  });

  it("emphasises selected squares and dims the rest", () => {
    state.mode = "Grid";
    state.grid = ["51b"];
    expect(styleFor("51b").fillOpacity).toBe(1);
    const other = circleStyles.value.find((c) => c.Sq !== "51b");
    expect(other.style.fillOpacity).toBe(0.4);
  });

  it("keeps opacity and fillOpacity in step", () => {
    expect(circleStyles.value.every((c) => c.style.opacity === c.style.fillOpacity)).toBe(true);
  });

  it("gives masked squares the fixed small radius", () => {
    const masked = covered.find((f) => f.properties.mask);
    if (!masked) return;
    expect(styleFor(masked.properties.Sq).radius).toBe(7000);
  });
});
