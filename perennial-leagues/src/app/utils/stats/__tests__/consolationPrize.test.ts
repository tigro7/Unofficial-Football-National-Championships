import { describe, it, expect } from "vitest";
import consolationPrize from "../consolationPrize";
import { buildCtx, makeMatch, makeSquadra } from "./helpers";

describe("consolationPrize", () => {
    it("does not fire if match is not yet played", () => {
        const ctx = buildCtx({ match: { outcome: "n" } });
        expect(consolationPrize.compute(ctx)).toBeNull();
    });

    it("includes only teams with regni = 0 and sfide > 0", () => {
        const m = makeMatch({ outcome: "v", sfidante: "Loser" });
        const noWinner = makeSquadra("Loser", { regni: 0, sfide: 3 });
        const winner = makeSquadra("Winner", { regni: 1, sfide: 3 });
        const ctx = buildCtx({
            match: m,
            allMatches: [m],
            squadreMap: new Map([["Winner", winner], ["Loser", noWinner]]),
        });
        const result = consolationPrize.compute(ctx);
        expect(result?.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ squadra: "Loser" }),
            ])
        );
        expect(result?.rows).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ squadra: "Winner" }),
            ])
        );
    });

    it("ranks teams by sfide descending", () => {
        const matches = [
            makeMatch({ outcome: "v", sfidante: "TeamA" }),
            makeMatch({ outcome: "v", sfidante: "TeamB" }),
        ];
        const teamA = makeSquadra("TeamA", { regni: 0, sfide: 2 });
        const teamB = makeSquadra("TeamB", { regni: 0, sfide: 3 });
        const ctx = buildCtx({
            match: matches[0],
            allMatches: matches,
            squadreMap: new Map([["TeamA", teamA], ["TeamB", teamB]]),
        });
        const result = consolationPrize.compute(ctx);
        console.log(result?.rows);
        expect(result?.rows?.[0]?.valore).toBeGreaterThanOrEqual(result?.rows?.[1]?.valore);
    });

    it("returns 10 rows if there are more than 10 eligible teams", () => {
        const matches = Array.from({ length: 12 }, (_, i) => makeMatch({ outcome: "v", sfidante: `Team${i}` }));
        const teams = Array.from({ length: 12 }, (_, i) =>
            makeSquadra(`Team${i}`, { regni: 0, sfide: i + 1 })
        );
        const ctx = buildCtx({
            match: matches[0],
            allMatches: matches,
            squadreMap: new Map(teams.map(t => [t.squadra, t])),
        });
        const result = consolationPrize.compute(ctx);
        expect(result?.rows?.length).toBe(10);
    });

    it("uses deletePattern 'Consolation Prize%' to wipe old entries", () => {
        const m = makeMatch({ outcome: "v", sfidante: "Loser" });
        const noWinner = makeSquadra("Loser", { regni: 0, sfide: 3 });
        const ctx = buildCtx({
            match: m,
            allMatches: [m],
            squadreMap: new Map([["TeamA", makeSquadra("TeamA")], ["Loser", noWinner]]),
        });
        const result = consolationPrize.compute(ctx);
        expect(result?.deletePattern).toBe("Consolation Prize%");
    });
});
