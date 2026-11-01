import { describe, it, expect } from "vitest";
import centuryClub from "../centuryClub";
import { buildCtx, makeMatch, makeSquadra } from "./helpers";

describe("centuryClub", () => {
    it("does not fire if match is not yet played", () => {
        const ctx = buildCtx({ match: { outcome: "n" } });
        expect(centuryClub.compute(ctx)).toBeNull();
    });

    it("does not fire when detentore durata <= 365", () => {
        const ctx = buildCtx({ squadreMap: new Map([["TeamA", makeSquadra("TeamA", { durata: 300 })]]) });
        expect(centuryClub.compute(ctx)).toBeNull();
    });

    it("assigns Bronze tier when durata is between 365 and 1826", () => {
        const ctx = buildCtx({ squadreMap: new Map([["TeamA", makeSquadra("TeamA", { durata: 500 })]]) });
        expect(centuryClub.compute(ctx)?.rows[0].statistica).toEqual("Century Club Bronze");
    });

    it("assigns Silver tier when durata is between 1826 and 3650", () => {
        const ctx = buildCtx({ squadreMap: new Map([["TeamA", makeSquadra("TeamA", { durata: 2000 })]]) });
        expect(centuryClub.compute(ctx)?.rows[0].statistica).toEqual("Century Club Silver");
    });

    it("assigns Gold tier when durata > 3650", () => {
        const ctx = buildCtx({ squadreMap: new Map([["TeamA", makeSquadra("TeamA", { durata: 4000 })]]) });
        expect(centuryClub.compute(ctx)?.rows[0].statistica).toEqual("Century Club Gold");
    });

    it.each([
        { durata: 4000, beforeTier: "Gold", afterTier: "Gold" },
        { durata: 3650, beforeTier: "Silver", afterTier: "Gold" },
    ])("recomputes $beforeTier to $afterTier after a win at $durata days", ({ durata, beforeTier, afterTier }) => {
        const previousMatch = makeMatch({ outcome: "v", numero: 1, data: "2010-05-01" });
        const team = makeSquadra("TeamA", { durata });
        const beforeCtx = buildCtx({
            match: previousMatch,
            squadreMap: new Map([["TeamA", team]]),
        });
        const before = centuryClub.compute(beforeCtx);
        expect(before).toEqual({
            rows: [{
                squadra: "TeamA",
                data: previousMatch.data,
                league: beforeCtx.league,
                statistica: `Century Club ${beforeTier}`,
                valore: durata,
                numero: 1,
            }],
        });

        const match = makeMatch({ outcome: "v", numero: 2, data: "2010-05-03" });
        // The pipeline updates squadre totals before calling compute.
        const afterCtx = buildCtx({
            match,
            allMatches: [previousMatch, match],
            squadreMap: new Map([["TeamA", { ...team, durata: durata + 2 }]]),
        });
        const after = centuryClub.compute(afterCtx);
        expect(after).toEqual({
            rows: [{
                squadra: "TeamA",
                data: match.data,
                league: afterCtx.league,
                statistica: `Century Club ${afterTier}`,
                valore: durata + 2,
                numero: 2,
            }],
        });
        expect(before?.rows[0].valore).toBe(durata);
    });
});
