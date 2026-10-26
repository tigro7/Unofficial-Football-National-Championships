/**
 * Verifies that every write endpoint on the squadre resources enforces
 * NextAuth session checks and returns 401 when unauthenticated.
 * Covers issues #17 and #20.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mocks are hoisted before any import — modules will load with the stubs.
vi.mock("@vercel/postgres", () => ({
  db: {
    connect: vi.fn().mockResolvedValue({
      sql: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: vi.fn(),
    }),
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { POST, PUT } from "@/app/api/[league]/squadre/route";
import { PUT as PUTColors } from "@/app/api/[league]/squadre/[squadra]/colori/[primario]/[secondario]/route";
import { getServerSession } from "next-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function params(p: Record<string, string>): any {
  return { params: Promise.resolve(p) };
}

beforeEach(() => {
  vi.mocked(getServerSession).mockReset();
});

describe("POST /api/[league]/squadre", () => {
  it("returns 401 when no session exists", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/serie_a/squadre", {
      method: "POST",
      body: JSON.stringify({ squadra: "Juventus", durata: 0 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, params({ league: "serie_a" }));
    expect(res.status).toBe(401);
  });

  it("proceeds past auth when a valid session exists", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { email: "admin@test.com" }, expires: "" });
    const req = new Request("http://localhost/api/serie_a/squadre", {
      method: "POST",
      body: JSON.stringify({ squadra: "Juventus", durata: 0 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, params({ league: "serie_a" }));
    expect(res.status).not.toBe(401);
  });
});

describe("PUT /api/[league]/squadre", () => {
  it("returns 401 when no session exists", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/serie_a/squadre", {
      method: "PUT",
      body: JSON.stringify({ squadra: "Juventus", durata: 10, mb: "m" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, params({ league: "serie_a" }));
    expect(res.status).toBe(401);
  });

  it("proceeds past auth when a valid session exists", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { email: "admin@test.com" }, expires: "" });
    const req = new Request("http://localhost/api/serie_a/squadre", {
      method: "PUT",
      body: JSON.stringify({ squadra: "Juventus", durata: 10, mb: "m" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, params({ league: "serie_a" }));
    expect(res.status).not.toBe(401);
  });
});

describe("PUT /api/[league]/squadre/[squadra]/colori/[primario]/[secondario]", () => {
  it("returns 401 when no session exists", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/serie_a/squadre/juventus/colori/000000/ffffff", {
      method: "PUT",
    });
    const res = await PUTColors(req, params({ league: "serie_a", squadra: "juventus", primario: "000000", secondario: "ffffff" }));
    expect(res.status).toBe(401);
  });
});
