import { describe, expect, it } from "vitest";
import { speciesMapMark } from "../src/utils/speciesMap";

describe("downloaded map markers", () => {
  const id = "avibase-7AAD57AC";
  const square = { taxa_old: [], taxa_new: [], corr: 0, mask: false };

  it.each([
    [[id], [], "lost"],
    [[id], [id], "kept"],
    [[], [id], "gained"],
    [[], [], "absent"],
  ])("uses the selected taxon's historical and recent records", (taxa_old, taxa_new, category) => {
    expect(speciesMapMark({ ...square, taxa_old, taxa_new }, id).category).toBe(category);
  });

  it("suppresses unobserved squares with poor coverage and fades observed ones", () => {
    expect(speciesMapMark({ ...square, mask: true }, id)).toBeNull();
    expect(speciesMapMark({ ...square, mask: true, taxa_old: [id] }, id)).toMatchObject({ category: "lost", radius: 7000, opacity: 0.4 });
  });
});

it("matches the live map's marker sizes and visibility for Little Bittern", async () => {
  const { circleStyles } = await import("../src/composables/useCircleLayer");
  const { mapData, state } = await import("../src/store");
  state.mode = "Species";
  state.speciesId = "avibase-7AAD57AC";
  state.displayPoorCoverage = true;
  state.displayNeverObserved = true;
  const live = new Map(circleStyles.value.map(({ Sq, style }) => [Sq, style]));
  for (const { properties } of mapData.filter((f) => !(f.properties.cov_old == "0" && f.properties.cov_new == 0))) {
    const mark = speciesMapMark(properties, state.speciesId);
    const style = live.get(properties.Sq);
    expect(Boolean(mark)).toBe(style.visible);
    if (mark) {
      expect(mark.radius).toBeCloseTo(style.radius);
      expect(mark.opacity).toBe(style.fillOpacity);
    }
  }
});
