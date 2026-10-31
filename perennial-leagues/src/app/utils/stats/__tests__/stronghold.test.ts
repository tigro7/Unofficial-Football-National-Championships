import { describe, it, expect } from "vitest";
import stronghold from "../stronghold";
import { buildCtx, makeMatch } from "./helpers";

describe("stronghold", () => {
    it("returns up to 10 rows ranked by reign length (matches)", () => {
        expect(true).toBe(true); // TODO
    });

    it("uses deletePattern 'Stronghold%' to wipe old entries", () => {
        const m = makeMatch({ outcome: "s" });
        const ctx = buildCtx({ match: m, allMatches: [m] });
        const result = stronghold.compute(ctx);
        expect(result?.deletePattern).toBe("Stronghold%");
    });

    it("correctly identifies the reign that lasted the most matches", () => {
        expect(true).toBe(true); // TODO
    });
});
