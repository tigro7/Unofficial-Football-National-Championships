import { describe, it, expect } from "vitest";
import { daysToYears, showSpan } from "../commons";

describe("daysToYears", () => {
  it("returns empty string for 0 days", () => {
    expect(daysToYears(0)).toBe("");
  });

  it("returns only days when under 365", () => {
    expect(daysToYears(100)).toBe("100 days");
    expect(daysToYears(364)).toBe("364 days");
  });

  it("returns only years when evenly divisible by 365", () => {
    expect(daysToYears(365)).toBe("1 years");
    expect(daysToYears(730)).toBe("2 years");
  });

  it("returns years and days for values above 365 with a remainder", () => {
    // The template produces two spaces between parts (months placeholder is always empty).
    expect(daysToYears(400)).toBe("1 years  35 days");
    expect(daysToYears(366)).toBe("1 years  1 days");
  });
});

describe("showSpan", () => {
  it("returns full locale dates for cross-year spans", () => {
    const result = showSpan("2023-12-20", "2024-01-10");
    // Both years appear in the output; exact locale format is system-dependent.
    expect(result).toContain("2023");
    expect(result).toContain("2024");
    expect(result).toContain(" - ");
  });

  it("returns DD/MM prefix for same-year different-month spans", () => {
    const result = showSpan("2024-01-15", "2024-03-20");
    // Must start with DD/MM (day and month of start date, zero-padded).
    expect(result).toMatch(/^15\/01 - /);
  });

  it("returns day number only for same-year same-month spans", () => {
    const result = showSpan("2024-03-05", "2024-03-25");
    // Must start with the day of the start date, no padding.
    expect(result).toMatch(/^5 - /);
  });

  it("handles single-day spans (same date)", () => {
    const result = showSpan("2024-06-01", "2024-06-01");
    // same month → day-only format; start day and end locale date share the same day
    expect(result).toMatch(/^1 - /);
  });
});
