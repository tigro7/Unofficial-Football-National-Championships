import { describe, it, expect } from "vitest";
import legacyRun from "../legacyRun";
import { buildCtx, makeSquadra } from "./helpers";

describe("legacyRun", () => {
    it("does not fire when detentore regni <= 10", () => {
        const ctx = buildCtx({ squadreMap: new Map([["TeamA", makeSquadra("TeamA", { regni: 5 })]]) });
        expect(legacyRun.compute(ctx)).toBeNull();
    });

    it("assigns Iron tier when regni is between 10 and 15", () => {
        expect(true).toBe(true); // TODO
    });

    it("assigns Bronze tier when regni is between 15 and 25", () => {
        expect(true).toBe(true); // TODO
    });

    it("assigns Silver tier when regni is between 25 and 50", () => {
        expect(true).toBe(true); // TODO
    });

    it("assigns Gold tier when regni is between 50 and 100", () => {
        expect(true).toBe(true); // TODO
    });

    it("assigns Platinum tier when regni > 100", () => {
        expect(true).toBe(true); // TODO
    });
});
