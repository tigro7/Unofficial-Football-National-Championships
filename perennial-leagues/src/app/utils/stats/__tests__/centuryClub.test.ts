import { describe, it, expect } from "vitest";
import centuryClub from "../centuryClub";
import { buildCtx, makeSquadra } from "./helpers";

describe("centuryClub", () => {
    it("does not fire when detentore durata <= 365", () => {
        const ctx = buildCtx({ squadreMap: new Map([["TeamA", makeSquadra("TeamA", { durata: 300 })]]) });
        expect(centuryClub.compute(ctx)).toBeNull();
    });

    it("assigns Bronze tier when durata is between 365 and 1826", () => {
        expect(true).toBe(true); // TODO
    });

    it("assigns Silver tier when durata is between 1826 and 3650", () => {
        expect(true).toBe(true); // TODO
    });

    it("assigns Gold tier when durata > 3650", () => {
        expect(true).toBe(true); // TODO
    });

    it("upserts — updates tier when durata crosses a threshold", () => {
        expect(true).toBe(true); // TODO
    });
});
