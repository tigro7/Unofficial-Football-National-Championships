import { describe, it, expect } from "vitest";
import allTimeRival from "../allTimeRival";
import { buildCtx, makeMatch } from "./helpers";

describe("allTimeRival", () => {
    it("does not fire on draws", () => {
        const ctx = buildCtx({ match: { outcome: "d" } });
        expect(allTimeRival.compute(ctx)).toBeNull();
    });

    it("does not fire on unplayed matches", () => {
        const ctx = buildCtx({ match: { outcome: "n" } });
        expect(allTimeRival.compute(ctx)).toBeNull();
    });

    it("does not fire when the pair has fewer than 5 wins", () => {
        const matches = Array.from({ length: 4 }, (_, i) =>
            makeMatch({ numero: i + 1, detentore: "TeamB", sfidante: "TeamA", outcome: "s" })
        );
        const ctx = buildCtx({ match: matches[3], allMatches: matches });
        expect(allTimeRival.compute(ctx)).toBeNull();
    });

    it("fires when TeamA (as detentore) has beaten TeamB exactly 5 times", () => {
        const matches = Array.from({ length: 5 }, (_, i) =>
            makeMatch({ numero: i + 1, detentore: "TeamB", sfidante: "TeamA", outcome: "s" })
        );
        const ctx = buildCtx({ match: matches[4], allMatches: matches });
        const result = allTimeRival.compute(ctx);
        expect(result).not.toBeNull();
        expect(result!.rows[0].squadra).toBe("TeamB");
        expect(result!.rows[0].valore).toBe(5);
        expect(result!.rows[0].statistica).toBe("All Time Rival vs TeamA");
    });

    it("doesn't count wins across both roles (mix of 's' and 'v')", () => {
        // TeamA wins: 3x as sfidante stealing from TeamB, 2x as detentore defending vs TeamB
        const matches = [
            makeMatch({ numero: 1, detentore: "TeamB", sfidante: "TeamA", outcome: "s" }),
            makeMatch({ numero: 2, detentore: "TeamA", sfidante: "TeamB", outcome: "v" }),
            makeMatch({ numero: 3, detentore: "TeamB", sfidante: "TeamA", outcome: "s" }),
            makeMatch({ numero: 4, detentore: "TeamA", sfidante: "TeamB", outcome: "v" }),
            makeMatch({ numero: 5, detentore: "TeamB", sfidante: "TeamA", outcome: "s" }),
        ];
        const ctx = buildCtx({ match: matches[4], allMatches: matches });
        const result = allTimeRival.compute(ctx);
        expect(result).toBeNull();
    });

    it("upserts — valore increases with each additional win beyond 5", () => {
        const matches = Array.from({ length: 6 }, (_, i) =>
            makeMatch({ numero: i + 1, detentore: "TeamB", sfidante: "TeamA", outcome: "s" })
        );
        const ctx = buildCtx({ match: matches[5], allMatches: matches });
        const result = allTimeRival.compute(ctx);
        expect(result).not.toBeNull();
        expect(result!.rows[0].valore).toBe(6);
    });
});
