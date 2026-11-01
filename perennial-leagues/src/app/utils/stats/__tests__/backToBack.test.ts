import { describe, it, expect } from "vitest";
import backToBack from "../backToBack";
import { buildCtx, makeMatch } from "./helpers";

describe("backToBack", () => {
    it.each(["v", "d", "n"])("does not fire if outcome is not s", (outcome) => {
        const ctx = buildCtx({ match: { outcome } });
        expect(backToBack.compute(ctx)).toBeNull();
    });

    it("fires when the same team wins back quickly by date (< 30 days)", () => {
        const matches = [
            makeMatch({ outcome: "s", detentore: "TeamB", sfidante: "TeamA", data: "2010-05-01", numero: 1 }),
            makeMatch({ outcome: "s", detentore: "TeamC", sfidante: "TeamB", data: "2010-05-10", numero: 2 }),
            makeMatch({ outcome: "v", detentore: "TeamC", sfidante: "TeamD", data: "2010-05-12", numero: 3 }),
            makeMatch({ outcome: "v", detentore: "TeamC", sfidante: "TeamE", data: "2010-05-14", numero: 4 }),
            makeMatch({ outcome: "v", detentore: "TeamC", sfidante: "TeamF", data: "2010-05-15", numero: 5 }),
            makeMatch({ outcome: "v", detentore: "TeamC", sfidante: "TeamG", data: "2010-05-16", numero: 6 }),
            makeMatch({ outcome: "s", detentore: "TeamA", sfidante: "TeamC", data: "2010-05-17", numero: 7 }),
        ];
        const ctx = buildCtx({ match: matches[6], allMatches: matches });
        const result = backToBack.compute(ctx);
        expect(result).not.toBeNull();
    });

    it("fires when the same team wins back quickly by match count (<= 5 matches, >= 30 days)", () => {
        const matches = [
            makeMatch({ outcome: "s", detentore: "TeamB", sfidante: "TeamA", data: "2010-05-01", numero: 1 }),
            makeMatch({ outcome: "s", detentore: "TeamC", sfidante: "TeamB", data: "2010-05-15", numero: 2 }),
            makeMatch({ outcome: "s", detentore: "TeamA", sfidante: "TeamC", data: "2010-06-03", numero: 3 }),
        ];
        const ctx = buildCtx({ match: matches[2], allMatches: matches });
        const result = backToBack.compute(ctx);
        expect(result).not.toBeNull();
    });

    it("does not fire when gap is > 30 days and > 5 matches", () => {
        const matches = [
            makeMatch({ outcome: "s", detentore: "TeamB", sfidante: "TeamA", data: "2010-05-01", numero: 1 }),
            makeMatch({ outcome: "s", detentore: "TeamC", sfidante: "TeamB", data: "2010-05-10", numero: 2 }),
            makeMatch({ outcome: "v", detentore: "TeamC", sfidante: "TeamD", data: "2010-05-12", numero: 3 }),
            makeMatch({ outcome: "v", detentore: "TeamC", sfidante: "TeamE", data: "2010-05-14", numero: 4 }),
            makeMatch({ outcome: "v", detentore: "TeamC", sfidante: "TeamF", data: "2010-05-15", numero: 5 }),
            makeMatch({ outcome: "v", detentore: "TeamC", sfidante: "TeamG", data: "2010-05-16", numero: 6 }),
            makeMatch({ outcome: "s", detentore: "TeamA", sfidante: "TeamC", data: "2010-06-03", numero: 7 }),
        ];
        const ctx = buildCtx({ match: matches[1], allMatches: matches });
        const result = backToBack.compute(ctx);
        expect(result).toBeNull();
    });

    it("returns null when no previous win by sfidante exists", () => {
        const m = makeMatch({ outcome: "s", detentore: "TeamA", sfidante: "TeamB", data: "2010-05-01", numero: 1 });
        const ctx = buildCtx({ match: m, allMatches: [m] });
        expect(backToBack.compute(ctx)).toBeNull();
    });
});
