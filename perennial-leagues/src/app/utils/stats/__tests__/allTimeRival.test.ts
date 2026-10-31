import { describe, it, expect } from "vitest";
import allTimeRival from "../allTimeRival";
import { buildCtx } from "./helpers";

describe("allTimeRival", () => {
    it("does not fire when outcome is not 's'", () => {
        const ctx = buildCtx({ match: { outcome: "v" } });
        expect(allTimeRival.compute(ctx)).toBeNull();
    });

    it("does not fire when the pair has fewer than 5 wins", () => {
        expect(true).toBe(true); // TODO
    });

    it("fires when TeamA has beaten TeamB exactly 5 times (outcome='s')", () => {
        expect(true).toBe(true); // TODO
    });

    it("upserts — count increases with each additional win", () => {
        expect(true).toBe(true); // TODO
    });
});
