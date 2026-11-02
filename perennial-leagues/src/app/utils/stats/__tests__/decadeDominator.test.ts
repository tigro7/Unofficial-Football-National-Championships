/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from "vitest";
import decadeDominator from "../decadeDominator";
import { buildCtx, makeMatch } from "./helpers";

describe("decadeDominator", () => {
    it("does not fire if match is not yet played", () => {
        const ctx = buildCtx({ match: { outcome: "n" } });
        expect(decadeDominator.compute(ctx)).toBeNull();
    });

    it("picks the team with the most wins in the decade", () => {
        const teamAMatches = Array.from({ length: 5 }, (_, i) => (makeMatch({
            outcome: "s",
            detentore: "TeamA",
            data: `200${i}-01-01`,
            numero: i + 1,
            league: "TestLeague"
        })));
        const teamBMatches = Array.from({ length: 3 }, (_, i) => (makeMatch({
            outcome: "s",
            detentore: "TeamB",
            data: `200${i}-01-01`,
            numero: i + 1,
            league: "TestLeague"
        })));
        const ctx = buildCtx({ match: teamAMatches[0], allMatches: [...teamAMatches, ...teamBMatches] });
        const result = decadeDominator.compute(ctx);
        expect(result).not.toBeNull();
        expect(result?.rows[0].squadra).toBe("TeamA");
        expect(result?.rows[0].statistica).toBe("Decade Dominator 2000");
        expect(result?.rows.length).toBe(1);
    });

    it("a team already has the most reigns in the decade and another team surpasses it, the statistic should reflect the new leader", () => {
        const teamAMatches = Array.from({ length: 5 }, (_, i) => (makeMatch({
            outcome: "s",
            detentore: "TeamA",
            data: `200${i}-01-01`,
            numero: i + 1,
            league: "TestLeague"
        })));
        const teamBMatches = Array.from({ length: 4 }, (_, i) => (makeMatch({
            outcome: "s",
            detentore: "TeamB",
            data: `200${i}-01-01`,
            numero: i + 1,
            league: "TestLeague"
        })));
        const ctx = buildCtx({ match: teamBMatches[0], allMatches: [...teamAMatches, ...teamBMatches] });
        const result = decadeDominator.compute(ctx);
        expect(result).not.toBeNull();
        expect(result?.rows[0].squadra).toBe("TeamA");
        expect(result?.rows[0].statistica).toBe("Decade Dominator 2000");
        const teamBAdditionalMatches = Array.from({ length: 2 }, (_, i) => (makeMatch({
            outcome: "s",
            detentore: "TeamB",
            data: `200${i + 4}-01-01`,
            numero: i + 5,
            league: "TestLeague"
        })));
        const ctxAfterAdditionalMatches = buildCtx({ match: teamBAdditionalMatches[0], allMatches: [...teamAMatches, ...teamBMatches, ...teamBAdditionalMatches] });
        const resultAfterAdditionalMatches = decadeDominator.compute(ctxAfterAdditionalMatches);
        expect(resultAfterAdditionalMatches).not.toBeNull();
        expect(resultAfterAdditionalMatches?.rows[0].squadra).toBe("TeamB");
        expect(resultAfterAdditionalMatches?.rows[0].statistica).toBe("Decade Dominator 2000");
    });
});
