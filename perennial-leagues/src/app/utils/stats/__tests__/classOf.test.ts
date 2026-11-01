import { describe, it, expect } from "vitest";
import classOf from "../classOf";
import { buildCtx, makeMatch } from "./helpers";

describe("classOf", () => {
    it("does not fire if match is not yet played", () => {
        const ctx = buildCtx({ match: { outcome: "n", durata: 100 } });
        expect(classOf.compute(ctx)).toBeNull();
    });

    it("adds separate reigns but counts cumulative duration only once within each reign", () => {
        const matches = [
            makeMatch({ numero: 1, detentore: "TeamA", data: "2010-01-01", durata: 20 }),
            makeMatch({ numero: 2, detentore: "TeamA", data: "2010-01-31", durata: 30, outcome: "v" }),
            makeMatch({ numero: 3, detentore: "TeamB", data: "2010-02-01", durata: 80 }),
            makeMatch({ numero: 4, detentore: "TeamA", data: "2010-05-01", durata: 60 }),
        ];
        const ctx = buildCtx({ match: matches[3], allMatches: matches });
        expect(classOf.compute(ctx)).toEqual({
            rows: [{
                squadra: "TeamA",
                data: "2010-05-01",
                league: "serie_a",
                statistica: "Class of 2010",
                valore: 90,
                numero: 4,
            }],
        });
    });

    it.each([
        { durata: 40, expectedTeam: "TeamA", expectedDuration: 50, expectedNumero: 1 },
        { durata: 60, expectedTeam: "TeamB", expectedDuration: 60, expectedNumero: 3 },
    ])("keeps or replaces the leader after TeamB reaches $durata days", ({ durata, expectedTeam, expectedDuration, expectedNumero }) => {
        const previousMatches = [
            makeMatch({ numero: 1, detentore: "TeamA", data: "2010-01-01", durata: 50 }),
            makeMatch({ numero: 2, detentore: "TeamB", data: "2010-03-01", durata: 30 }),
        ];
        const before = classOf.compute(buildCtx({ match: previousMatches[1], allMatches: previousMatches }));
        expect(before?.rows[0]).toMatchObject({ squadra: "TeamA", valore: 50, numero: 1 });

        const match = makeMatch({
            numero: 3, detentore: "TeamB", data: "2010-04-30", durata, outcome: "v",
        });
        const after = classOf.compute(buildCtx({ match, allMatches: [...previousMatches, match] }));
        expect(after?.rows[0]).toMatchObject({
            squadra: expectedTeam, valore: expectedDuration, numero: expectedNumero,
            data: expectedNumero === 1 ? "2010-01-01" : match.data,
        });
        expect(before?.rows[0]).toMatchObject({ squadra: "TeamA", valore: 50, numero: 1 });
        expect(before?.rows).toHaveLength(1);
        expect(after?.rows).toHaveLength(1);
        expect(before).not.toBeNull();
        expect(after).not.toBeNull();
        expect(classOf.recalcDedup).toBeTypeOf("function");
        if (!before || !after || !classOf.recalcDedup) throw new Error("Expected results and a dedup key");
        const beforeRow = before.rows[0];
        const afterRow = after.rows[0];
        expect(classOf.recalcDedup(beforeRow)).toBe(classOf.recalcDedup(afterRow));
        const accumulated = new Map([
            [classOf.recalcDedup(beforeRow), beforeRow],
            [classOf.recalcDedup(afterRow), afterRow],
        ]);
        expect([...accumulated.values()]).toEqual([afterRow]);
    });

    it("updates the duration and match metadata when the same leader defends again", () => {
        const previousMatch = makeMatch({ numero: 1, data: "2010-01-01", durata: 30 });
        const before = classOf.compute(buildCtx({ match: previousMatch }));
        expect(before?.rows[0]).toMatchObject({ squadra: "TeamA", valore: 30, numero: 1 });
        const match = makeMatch({ numero: 2, data: "2010-03-02", durata: 60, outcome: "v" });
        const after = classOf.compute(buildCtx({ match, allMatches: [previousMatch, match] }));
        expect(after?.rows[0]).toMatchObject({
            squadra: "TeamA", valore: 60, numero: 2, data: match.data, statistica: "Class of 2010",
        });
    });


    it.each([
        { data: "2009-12-31", decade: 2000 },
        { data: "2010-01-01", decade: 2010 },
        { data: "2019-12-31", decade: 2010 },
        { data: "2020-01-01", decade: 2020 },
    ])("labels a reign starting on $data as Class of $decade", ({ data, decade }) => {
        const ctx = buildCtx({ match: { data, durata: 1 } });
        expect(classOf.compute(ctx)).toEqual({
            rows: [{
                squadra: "TeamA", data, league: ctx.league,
                statistica: `Class of ${decade}`, valore: 1, numero: 1,
            }],
        });
    });

    it("does not let a longer reign from another decade win the current decade", () => {
        const matches = [
            makeMatch({ numero: 1, detentore: "TeamA", data: "2000-01-01", durata: 1000 }),
            makeMatch({ numero: 2, detentore: "TeamB", data: "2010-01-01", durata: 20 }),
        ];
        const result = classOf.compute(buildCtx({ match: matches[1], allMatches: matches }));
        expect(result?.rows.find(row => row.statistica === "Class of 2010")).toMatchObject({
            squadra: "TeamB", valore: 20, numero: 2,
        });
    });

    it("splits a cross-decade reign and refreshes the previous decade's total", () => {
        const previousMatch = makeMatch({ numero: 1, data: "2009-12-20", durata: 5 });
        const before = classOf.compute(buildCtx({ match: previousMatch }));
        expect(before?.rows[0]).toMatchObject({ statistica: "Class of 2000", valore: 5 });

        const match = makeMatch({ numero: 2, data: "2010-01-09", durata: 20, outcome: "v" });
        const result = classOf.compute(buildCtx({ match, allMatches: [previousMatch, match] }));
        expect(result).toEqual({
            rows: [
                { squadra: "TeamA", data: match.data, league: "serie_a", statistica: "Class of 2000", valore: 12, numero: 2 },
                { squadra: "TeamA", data: match.data, league: "serie_a", statistica: "Class of 2010", valore: 8, numero: 2 },
            ],
        });
    });

    it("splits a reign spanning three decades, including leap days", () => {
        const matches = [
            makeMatch({ numero: 1, data: "2009-12-31" }),
            makeMatch({ numero: 2, data: "2020-01-02", durata: 3654, outcome: "v" }),
        ];
        const result = classOf.compute(buildCtx({ match: matches[1], allMatches: matches }));
        expect(result?.rows.map(({ statistica, valore }) => ({ statistica, valore }))).toEqual([
            { statistica: "Class of 2000", valore: 1 },
            { statistica: "Class of 2010", valore: 3652 },
            { statistica: "Class of 2020", valore: 1 },
        ]);
    });

    it("chooses each decade's winner using only the days held within that decade", () => {
        const matches = [
            makeMatch({ numero: 1, detentore: "TeamA", data: "2009-12-20", durata: 20 }),
            makeMatch({ numero: 2, detentore: "TeamB", data: "2010-01-09", durata: 10 }),
            makeMatch({ numero: 3, detentore: "TeamB", data: "2010-01-19", durata: 10, outcome: "v" }),
        ];
        const result = classOf.compute(buildCtx({ match: matches[2], allMatches: matches }));
        expect(result?.rows.map(({ squadra, statistica, valore }) => ({ squadra, statistica, valore }))).toEqual([
            { squadra: "TeamA", statistica: "Class of 2000", valore: 12 },
            { squadra: "TeamB", statistica: "Class of 2010", valore: 10 },
        ]);
    });

    it("counts no days in the new decade when a reign ends exactly on January 1", () => {
        const matches = [
            makeMatch({ numero: 1, data: "2009-12-20", durata: 12 }),
            makeMatch({ numero: 2, detentore: "TeamB", data: "2010-01-01", durata: 0 }),
        ];
        const result = classOf.compute(buildCtx({ match: matches[1], allMatches: matches }));
        expect(result?.rows).toHaveLength(1);
        expect(result?.rows[0]).toMatchObject({ statistica: "Class of 2000", valore: 12 });
    });
});
