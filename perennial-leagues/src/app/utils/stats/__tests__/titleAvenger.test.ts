import { describe, it, expect } from "vitest";
import titleAvenger from "../titleAvenger";
import { buildCtx } from "./helpers";

describe("titleAvenger", () => {
    it("does not fire when outcome is not 's'", () => {
        const ctx = buildCtx({ match: { outcome: "v" } });
        expect(titleAvenger.compute(ctx)).toBeNull();
    });

    it("fires when TeamA wins back the title it lost to TeamB with no intermediate win for TeamA", () => {
        expect(true).toBe(true); // TODO
    });

    it("does not fire when TeamA had another title win between the loss and the revenge", () => {
        expect(true).toBe(true); // TODO
    });

    it("records the correct number of title changes between the loss and the revenge", () => {
        expect(true).toBe(true); // TODO
    });
});
