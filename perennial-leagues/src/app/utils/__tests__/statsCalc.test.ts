import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { VercelPoolClient } from "@vercel/postgres";
import updateStats from "../statsCalc";

type Row = Record<string, unknown>;
type Result = { rows: Row[]; rowCount: number };
type Call = { text: string; values: unknown[] };

const result = (rows: Row[] = []): Result => ({ rows, rowCount: rows.length });

// Minimal in-memory stand-in for the Vercel Postgres client. `sql` is a tagged
// template: each call is recorded and answered by the first matching responder
// (matched against the query text), falling back to an empty result.
function createFakeClient(responders: [RegExp, Row[] | Row[][]][] = [], queued = false) {
  const calls: Call[] = [];

  // These stats queries are dereferenced as `rows[0]` without a guard, so they
  // need at least one row for updateStats to run to completion.
  const defaults: [RegExp, Row[]][] = [
    [/SELECT DISTINCT ON \(decade\)/, [{ data: "2020-01-01", detentore: "Juventus", regni: 3, numero: 1 }]],
    [/ORDER BY long\.durata DESC/, [{ data: "2020-01-01", detentore: "Juventus", durata: 10, numero: 1 }]],
    [/ORDER BY short\.durata ASC/, [{ data: "2020-01-01", detentore: "Juventus", durata: 10, numero: 1 }]],
  ];

  const sql = async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.join("?");
    calls.push({ text, values });
    const hit = [...responders, ...defaults].find(([re]) => re.test(text));
    if (queued && hit && responders.includes(hit as [RegExp, Row[] | Row[][]])) {
      return result((hit[1] as Row[][]).shift());
    }
    return result(hit?.[1] as Row[] | undefined);
  };

  return {
    client: { sql } as unknown as VercelPoolClient,
    calls,
    find: (re: RegExp) => calls.filter((c) => re.test(c.text)),
  };
}

const LEAGUE = "serie_a";
const DATA = "2024-05-10";

// Positional wrapper around the 13-argument updateStats signature.
function run(
  client: VercelPoolClient,
  o: {
    outcome: string;
    holder?: string;
    challenger?: string;
    previousDuration?: number;
    updatedPreviousDuration?: number;
    durata?: number;
  }
) {
  const holder = o.holder ?? "Juventus";
  const challenger = o.challenger ?? "Milan";
  return updateStats(
    client, LEAGUE, holder, challenger, holder, challenger, "1-0", o.outcome,
    o.previousDuration ?? 0, o.updatedPreviousDuration ?? 0, o.durata ?? 0, DATA, 100
  );
}

const UPDATE_HOLDER = /UPDATE squadre SET regni/;
const UPDATE_SFIDE = /UPDATE squadre SET sfide/;
const INSERT_SQUADRA = /INSERT INTO squadre/;

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("updateStats", () => {
  it("does nothing when the match has not been played (outcome 'n')", async () => {
    const { client, calls } = createFakeClient();
    await run(client, { outcome: "n" });
    expect(calls).toHaveLength(0);
  });

  it("title stolen ('s'): new holder gains a reign and the reign duration is added", async () => {
    const { client, find } = createFakeClient([
      [/SELECT \* FROM squadre WHERE squadra/, [{ regni: 4, durata: 100, difese: 7, sfide: 0 }]],
    ]);
    await run(client, { outcome: "s", durata: 30 });

    const [update] = find(UPDATE_HOLDER);
    // regni, durata, media, difese, media_difese, squadra, league
    expect(update.values).toEqual([5, 130, 26, 7, 1.4, "Juventus", LEAGUE]);
  });

  it("title stolen ('s'): challenger's sfide is not touched", async () => {
    const { client, find } = createFakeClient([
      [/SELECT \* FROM squadre WHERE squadra/, [{ regni: 4, durata: 100, difese: 7 }]],
    ]);
    await run(client, { outcome: "s", durata: 30 });
    expect(find(UPDATE_SFIDE)).toHaveLength(0);
  });

  it("title defended ('v'): holder keeps reigns, gains a defence and the extended duration", async () => {
    const { client, find } = createFakeClient([
      [/SELECT \* FROM squadre WHERE squadra = \?/, [{ regni: 4, durata: 100, difese: 7, sfide: 2 }]],
    ]);
    await run(client, { outcome: "v", previousDuration: 10, updatedPreviousDuration: 25 });

    const [update] = find(UPDATE_HOLDER);
    // durata 100 + (25 - 10) = 115, difese 7 + 1 = 8, media_difese 8 / 4 = 2
    expect(update.values).toEqual([4, 115, 28, 8, 2, "Juventus", LEAGUE]);
  });

  it("title defended ('v'): challenger's sfide is incremented", async () => {
    const { client, find } = createFakeClient([
      [/SELECT \* FROM squadre WHERE squadra = \?/, [{ regni: 4, durata: 100, difese: 7, sfide: 2 }]],
    ]);
    await run(client, { outcome: "v" });

    const [update] = find(UPDATE_SFIDE);
    expect(update.values).toEqual([3, "Milan", LEAGUE]);
  });

  it("draw ('d'): title stays with the holder (no extra reign) and counts as a defence", async () => {
    const { client, find } = createFakeClient([
      [/SELECT \* FROM squadre WHERE squadra = \?/, [{ regni: 2, durata: 60, difese: 1, sfide: 0 }]],
    ]);
    await run(client, { outcome: "d" });

    const [update] = find(UPDATE_HOLDER);
    expect(update.values.slice(0, 2)).toEqual([2, 60]); // regni, durata unchanged
    expect(update.values[3]).toBe(2); // difese
  });

  it("inserts an unknown holder with a first reign and default colours", async () => {
    const { client, find } = createFakeClient(); // SELECT * FROM squadre -> no rows
    await run(client, { outcome: "s", holder: "Parma" });

    const [insert] = find(INSERT_SQUADRA);
    expect(insert.text).toContain("'#000000', '#FFFFFF'");
    expect(insert.values).toEqual(["Parma", LEAGUE]);
    expect(find(UPDATE_HOLDER)).toHaveLength(0);
  });

  it("inserts an unknown challenger with 0 reigns and 1 challenge on a non-steal", async () => {
    // First holder lookup finds a row, the challenger lookup finds none.
    const { client, find } = createFakeClient(
      [[/SELECT \* FROM squadre WHERE squadra/, [[{ regni: 1, durata: 10, difese: 0 }], []]]],
      true
    );
    await run(client, { outcome: "v", challenger: "Parma" });

    const [insert] = find(INSERT_SQUADRA);
    expect(insert.text).toContain("0, 0, 0");
    expect(insert.values).toEqual(["Parma", LEAGUE]);
  });

  it("records a 'Millenial' stat for a holder who had no previous reigns", async () => {
    const { client, find } = createFakeClient([
      [/SELECT \* FROM squadre WHERE squadra = \?/, [{ regni: 0, durata: 0, difese: 0, sfide: 3 }]],
    ]);
    await run(client, { outcome: "s", durata: 5 });

    const millenial = find(/INSERT INTO stats[^]*'Millenial'/);
    expect(millenial).toHaveLength(1);
    // the 'Boomer' stat is always cleared for the new holder
    expect(find(/DELETE FROM stats[^]*'Boomer'/)).toHaveLength(1);
  });

  describe("regressions", () => {
    const HOLDER_ROW: [RegExp, Row[]] = [/SELECT \* FROM squadre WHERE squadra = \?/, [{ regni: 2, durata: 40, difese: null, sfide: null }]];

    it("treats NULL difese/sfide as 0 instead of producing NaN/NULL", async () => {
      const { client, find } = createFakeClient([HOLDER_ROW]);
      await run(client, { outcome: "v" });
      expect(find(UPDATE_HOLDER)[0].values).toEqual([2, 40, 20, 1, 0.5, "Juventus", LEAGUE]);
      expect(find(UPDATE_SFIDE)[0].values[0]).toBe(1);

      const steal = createFakeClient([HOLDER_ROW]);
      await run(steal.client, { outcome: "s", durata: 10 });
      expect(steal.find(UPDATE_HOLDER)[0].values[3]).toBe(0);
      expect(Number.isNaN(steal.find(UPDATE_HOLDER)[0].values[4])).toBe(false);
    });

    it("does not divide by zero for a holder with no reigns on a defence", async () => {
      const { client, find } = createFakeClient([[/SELECT \* FROM squadre WHERE squadra = \?/, [{ regni: 0, durata: 0, difese: 0 }]]]);
      await run(client, { outcome: "v" });
      const [update] = find(UPDATE_HOLDER);
      expect(update.values.slice(0, 5)).toEqual([0, 0, 0, 1, 0]);
    });

    it("does not crash when the decade / longest / shortest queries return no rows", async () => {
      const { client, find } = createFakeClient([
        [/SELECT DISTINCT ON \(decade\)/, []],
        [/ORDER BY long\.durata DESC/, []],
        [/ORDER BY short\.durata ASC/, []],
      ]);
      await expect(run(client, { outcome: "s" })).resolves.toBeUndefined();
      expect(find(/UPDATE stats SET data = \?, squadra = \?, valore/)).toHaveLength(0);
      expect(
        find(/INSERT INTO stats/).filter((c) => c.values.some((v) => String(v).startsWith("Decade Dominator")))
      ).toHaveLength(0);
      expect(find(/statistica = 'Shortest Reign'/)).toHaveLength(0);
    });

    it("updates the 'Longest Reigning' stat (also matching the legacy name)", async () => {
      const { client, find } = createFakeClient();
      await run(client, { outcome: "s" });
      const [update] = find(/statistica = 'Longest Reigning'/);
      expect(update.text).toMatch(/statistica IN \('Longest Reigning', 'Longest Combined Reign'\)/);
    });

    it("inserts (rather than always updating) Century Club / Legacy Run / All Time Rival stats when absent", async () => {
      const { client, find } = createFakeClient([
        [/Century Club%/, []],
        [/AS tier FROM squadre WHERE durata > 365/, [{ detentore: "Juventus", data: DATA, numero: 1, durata: 400, tier: "Bronze" }]],
        [/AS tier FROM squadre WHERE regni > 10/, [{ detentore: "Juventus", data: DATA, numero: 1, regni: 12, tier: "Iron" }]],
        [/all_time/, [{ detentore: "Juventus", data: DATA, numero: 1, tot: 6 }]],
      ]);
      await run(client, { outcome: "s" });
      expect(find(/INSERT INTO stats/).filter((c) => c.values.includes("Century Club Bronze"))).toHaveLength(1);
      expect(find(/INSERT INTO stats/).filter((c) => c.values.includes("Legacy Run Iron"))).toHaveLength(1);
      expect(find(/INSERT INTO stats/).filter((c) => c.values.includes("All Time Rival vs Milan"))).toHaveLength(1);
      expect(find(/UPDATE stats SET data = \?, statistica = \?/)).toHaveLength(0);
    });

    it("updates existing Century Club stat when one already exists", async () => {
      const { client, find } = createFakeClient([
        [/Century Club%/, [{ squadra: "Juventus" }]],
        [/AS tier FROM squadre WHERE durata > 365/, [{ detentore: "Juventus", data: DATA, numero: 1, durata: 400, tier: "Silver" }]],
      ]);
      await run(client, { outcome: "s" });
      expect(find(/UPDATE stats SET data = \?, statistica = \?/).some((c) => c.values.includes("Century Club Silver"))).toBe(true);
    });

    it("stores the match gap (wait_matches) for the second Back to Back query", async () => {
      const { client, find } = createFakeClient([
        [/MIN\(t2\.numero - t1\.numero\) AS wait_matches/, [{ wait_matches: 3, numero: 77 }]],
      ]);
      await run(client, { outcome: "s" });
      const b2b = find(/INSERT INTO stats[^]*'Back to Back'/);
      expect(b2b).toHaveLength(1);
      expect(b2b[0].values).toEqual(["Juventus", DATA, LEAGUE, 3, 77]);
    });
  });
});
