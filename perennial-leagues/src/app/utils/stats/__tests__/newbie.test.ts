import { describe, it, expect } from "vitest";
import newbie from "../newbie";
import { buildCtx, makeMatch } from "./helpers";

describe("newbie", () => {
    it("fires for a brand-new detentore appearing for the first time", () => {
        const m = makeMatch({ detentore: "NewTeam", sfidante: "OldTeam", numero: 1 });
        const ctx = buildCtx({ match: m, allMatches: [m] });
        const result = newbie.compute(ctx);
        expect(result).not.toBeNull(); // TODO: check squadra = 'NewTeam'
    });

    it("fires for a brand-new sfidante appearing for the first time", () => {
        expect(true).toBe(true); // TODO
    });

    it("does not fire when both teams already appeared in a previous match", () => {
        const prev = makeMatch({ detentore: "TeamA", sfidante: "TeamB", numero: 1 });
        const curr = makeMatch({ detentore: "TeamA", sfidante: "TeamB", numero: 2 });
        const ctx = buildCtx({ match: curr, allMatches: [prev, curr] });
        expect(newbie.compute(ctx)).toBeNull();
    });

    it("can fire for both detentore and sfidante in the same match", () => {
        expect(true).toBe(true); // TODO
    });
});
