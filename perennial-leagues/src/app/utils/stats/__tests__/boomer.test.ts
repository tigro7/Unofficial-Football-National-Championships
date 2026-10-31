import { describe, it, expect } from "vitest";
import boomer from "../boomer";
import { buildCtx, makeMatch } from "./helpers";

describe("boomer", () => {
    it("fires for a team whose last reign ended before 1940", () => {
        expect(true).toBe(true); // TODO
    });

    it("does not fire for a team whose last reign ended in or after 1940", () => {
        expect(true).toBe(true); // TODO
    });

    it("correctly identifies the last reign date when a team has multiple reigns", () => {
        expect(true).toBe(true); // TODO
    });

    it("persist is a no-op (recalc-only module)", async () => {
        const m = makeMatch();
        const ctx = buildCtx({ match: m });
        const result = boomer.compute(ctx);
        // persist should do nothing and not throw
        if (result) {
            await expect(boomer.persist(null as never, "serie_a", result)).resolves.toBeUndefined();
        }
    });
});
