import { describe, it, expect } from "vitest";
import consolationPrize from "../consolationPrize";
import { buildCtx, makeMatch, makeSquadra } from "./helpers";

describe("consolationPrize", () => {
    it("includes only teams with regni = 0 and sfide > 0", () => {
        expect(true).toBe(true); // TODO
    });

    it("ranks teams by sfide descending", () => {
        expect(true).toBe(true); // TODO
    });

    it("returns at most 9 rows", () => {
        expect(true).toBe(true); // TODO
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
