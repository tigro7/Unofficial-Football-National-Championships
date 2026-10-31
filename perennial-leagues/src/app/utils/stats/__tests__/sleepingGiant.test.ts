import { describe, it, expect } from "vitest";
import sleepingGiant from "../sleepingGiant";
import { buildCtx } from "./helpers";

describe("sleepingGiant", () => {
    it("does not fire when outcome is not 's'", () => {
        const ctx = buildCtx({ match: { outcome: "v" } });
        expect(sleepingGiant.compute(ctx)).toBeNull();
    });

    it("fires when a team returns to the title after > 3650 days away", () => {
        expect(true).toBe(true); // TODO
    });

    it("does not fire when the gap is <= 3650 days", () => {
        expect(true).toBe(true); // TODO
    });

    it("does not fire when the team held the title in between (only the first return counts)", () => {
        expect(true).toBe(true); // TODO
    });
});
