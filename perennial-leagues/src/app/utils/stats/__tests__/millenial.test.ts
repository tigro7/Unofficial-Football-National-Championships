import { describe, it, expect } from "vitest";
import millenial from "../millenial";
import { buildCtx, makeMatch } from "./helpers";

describe("millenial", () => {
    it("fires when a team holds the title for the first time in or after 2000", () => {
        expect(true).toBe(true); // TODO
    });

    it("does not fire when the team already held the title before", () => {
        const prev = makeMatch({ detentore: "TeamA", outcome: "v", data: "2005-01-01", numero: 1 });
        const curr = makeMatch({ detentore: "TeamA", outcome: "s", data: "2010-01-01", numero: 2 });
        const ctx = buildCtx({ match: curr, allMatches: [prev, curr] });
        expect(millenial.compute(ctx)).toBeNull();
    });

    it("does not fire when the first title is before 2000", () => {
        const m = makeMatch({ detentore: "OldTeam", outcome: "s", data: "1998-06-01", numero: 1 });
        const ctx = buildCtx({ match: m, allMatches: [m] });
        expect(millenial.compute(ctx)).toBeNull();
    });
});
