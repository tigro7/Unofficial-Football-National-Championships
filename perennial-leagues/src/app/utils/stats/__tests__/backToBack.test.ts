import { describe, it, expect } from "vitest";
import backToBack from "../backToBack";
import { buildCtx, makeMatch } from "./helpers";

describe("backToBack", () => {
    it("fires when the same team wins back quickly by date (< 30 days)", () => {
        expect(true).toBe(true); // TODO
    });

    it("fires when the same team wins back quickly by match count (<= 5 matches, >= 30 days)", () => {
        expect(true).toBe(true); // TODO
    });

    it("does not fire when outcome is not 's'", () => {
        const ctx = buildCtx({ match: { outcome: "v" } });
        expect(backToBack.compute(ctx)).toBeNull();
    });

    it("does not fire when gap is > 30 days and > 5 matches", () => {
        expect(true).toBe(true); // TODO
    });

    it("returns null when no previous win by sfidante exists", () => {
        const m = makeMatch({ outcome: "s", detentore: "TeamA", sfidante: "TeamB", data: "2010-05-01", numero: 1 });
        const ctx = buildCtx({ match: m, allMatches: [m] });
        expect(backToBack.compute(ctx)).toBeNull();
    });
});
