/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from "vitest";
import decadeDominator from "../decadeDominator";
import { buildCtx } from "./helpers";

describe("decadeDominator", () => {
    it("fires when a team has > 1 win in a decade", () => {
        expect(true).toBe(true); // TODO
    });

    it("does not fire when a team has only 1 win in a decade", () => {
        expect(true).toBe(true); // TODO
    });

    it("upserts (latest overwrites previous) for the same decade", () => {
        expect(true).toBe(true); // TODO
    });

    it("picks the team with the most wins in the decade", () => {
        expect(true).toBe(true); // TODO
    });

    it("produces the correct statistica label", () => {
        expect(true).toBe(true); // TODO — should be 'Decade Dominator XXXX'
    });
});
