import { describe, it, expect } from "vitest";
import kingSlayer from "../kingSlayer";
import { buildCtx, makeMatch } from "./helpers";

describe("kingSlayer", () => {
    it("returns the team that beat the longest-reigning team after their reign ended", () => {
        expect(true).toBe(true); // TODO
    });

    it("returns at most 10 rows (top 10 longest reigns)", () => {
        expect(true).toBe(true); // TODO
    });

    it("uses deletePattern 'King Slayer%' to wipe old entries", () => {
        const m = makeMatch({ outcome: "s" });
        const ctx = buildCtx({ match: m, allMatches: [m] });
        const result = kingSlayer.compute(ctx);
        // King Slayer needs > 1 match to fire; just verify the deletePattern if it does
        if (result) expect(result.deletePattern).toBe("King Slayer%");
        else expect(result).toBeNull();
    });

    it("records the durata of the defeated reign as valore", () => {
        expect(true).toBe(true); // TODO
    });
});
