import { describe, expect, it } from "vitest";

import { formatNumber } from "../src/utils/format";

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(13530)).toBe("13,530");
    expect(formatNumber(999)).toBe("999");
  });

  it("treats a missing value as zero", () => {
    expect(formatNumber(undefined)).toBe("0");
    expect(formatNumber(null)).toBe("0");
  });
});
