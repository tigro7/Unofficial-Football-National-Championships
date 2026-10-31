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

  const defaults: [RegExp, Row[]][] = [
    // StatContext: allMatches query — empty by default so modules don't fire unless test provides data
    [/SELECT \* FROM matches WHERE league = \? AND outcome != 'n'/, []],
    // StatContext: full-table squadre query — empty by default
    [/FROM squadre WHERE league/, []],
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

// The "current" match: used by most stat tests via MATCHES([CURR_MATCH]).
// numero=100 must match the `numero` argument passed to run().
const CURR_MATCH: Row = {
  numero: 100, detentore: "Juventus", sfidante: "Milan",
  outcome: "s", data: DATA, durata: 0, league: LEAGUE,
  home: "Juventus", away: "Milan", risultato: "1-0",
};

// Build a squadra row for use in SQUADRE_MAP responders.
const mkSquadraRow = (squadra: string, overrides: Partial<Row> = {}): Row => ({
  squadra, regni: 1, durata: 0, media: 0,
  colore_primario: "#000000", colore_secondario: "#FFFFFF",
  league: LEAGUE, difese: 0, media_difese: 0, sfide: 0,
  ...overrides,
});

// Shorthand responders for the two StatContext queries.
const MATCHES = (rows: Row[]): [RegExp, Row[]] =>
  [/SELECT \* FROM matches WHERE league = \? AND outcome != 'n'/, rows];
const SQUADRE_MAP = (rows: Row[]): [RegExp, Row[]] =>
  [/FROM squadre WHERE league/, rows];

// Positional wrapper around the updateStats signature.
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
  vi.spyOn(console, "warn").mockImplementation(() => {});
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

  it("records a 'Millenial' stat for a holder whose first title appears in allMatches (year ≥ 2000)", async () => {
    const { client, find } = createFakeClient([
      [/SELECT \* FROM squadre WHERE squadra = \?/, [{ regni: 0, durata: 0, difese: 0, sfide: 3 }]],
      MATCHES([CURR_MATCH]),
    ]);
    await run(client, { outcome: "s", durata: 5 });

    expect(find(/INSERT INTO stats/).filter((c) => c.values.includes("Millenial"))).toHaveLength(1);
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

    it("does not crash when allMatches is empty (modules skip gracefully)", async () => {
      const { client, find } = createFakeClient();
      await expect(run(client, { outcome: "s" })).resolves.toBeUndefined();
      expect(find(/UPDATE stats SET data = \?, squadra = \?, valore/)).toHaveLength(0);
      expect(
        find(/INSERT INTO stats/).filter((c) => c.values.some((v) => String(v).startsWith("Decade Dominator")))
      ).toHaveLength(0);
      expect(find(/statistica = 'Shortest Reign'/)).toHaveLength(0);
    });

    it("updates the 'Longest Reigning' stat (also matching the legacy name)", async () => {
      const { client, find } = createFakeClient([
        MATCHES([CURR_MATCH]),
        SQUADRE_MAP([mkSquadraRow("Juventus", { durata: 100 })]),
      ]);
      await run(client, { outcome: "s" });
      const [update] = find(/statistica = 'Longest Reigning'/);
      expect(update.text).toMatch(/statistica IN \('Longest Reigning', 'Longest Combined Reign'\)/);
    });

    it("inserts (rather than always updating) Century Club / Legacy Run / All Time Rival stats when absent", async () => {
      // 5 previous steals Juventus→Milan + CURR_MATCH = 6 total (≥5 for AllTimeRival)
      const rivalMatches: Row[] = Array.from({ length: 5 }, (_, i) => ({
        numero: i + 1, detentore: "Juventus", sfidante: "Milan",
        outcome: "s", data: `2020-0${i + 1}-01`, durata: 0,
        league: LEAGUE, home: "Juventus", away: "Milan", risultato: "0-1",
      }));
      rivalMatches.push(CURR_MATCH);
      const { client, find } = createFakeClient([
        MATCHES(rivalMatches),
        // durata=400 → Bronze; regni=12 → Iron
        SQUADRE_MAP([mkSquadraRow("Juventus", { regni: 12, durata: 400 })]),
      ]);
      await run(client, { outcome: "s" });
      const inserts = find(/INSERT INTO stats/);
      expect(inserts.some((c) => c.values.includes("Century Club Bronze"))).toBe(true);
      expect(inserts.some((c) => c.values.includes("Legacy Run Iron"))).toBe(true);
      expect(inserts.some((c) => c.values.includes("All Time Rival vs Milan"))).toBe(true);
      expect(find(/UPDATE stats SET data = \?, statistica = \?/)).toHaveLength(0);
    });

    it("updates existing Century Club stat when one already exists", async () => {
      const { client, find } = createFakeClient([
        MATCHES([CURR_MATCH]),
        SQUADRE_MAP([mkSquadraRow("Juventus", { durata: 2000 })]),  // 2000 > 1826 → Silver
        [/statistica LIKE 'Century Club%'/, [{ squadra: "Juventus" }]],
      ]);
      await run(client, { outcome: "s" });
      expect(find(/UPDATE stats SET data = \?, statistica = \?/).some((c) => c.values.includes("Century Club Silver"))).toBe(true);
    });

    it("stores the match gap (wait_matches) for the second Back to Back query", async () => {
      // prevMatch: Juventus steals from Roma at numero=97 (gap=3 matches, >30 days apart)
      const prevMatch: Row = {
        numero: 97, detentore: "Roma", sfidante: "Juventus", outcome: "s",
        data: "2024-01-01", durata: 0, league: LEAGUE, home: "Roma", away: "Juventus", risultato: "0-1",
      };
      const { client, find } = createFakeClient([MATCHES([prevMatch, CURR_MATCH])]);
      await run(client, { outcome: "s" });
      const b2b = find(/INSERT INTO stats/).filter((c) => c.values.includes("Back to Back"));
      expect(b2b).toHaveLength(1);
      expect(b2b[0].values).toEqual(["Juventus", DATA, LEAGUE, "Back to Back", 3, 100]);
    });

    it("records 'Back to Back' when team reclaims the title within 30 days (days variant)", async () => {
      // prevMatch: Juventus steals from Roma 20 days before CURR_MATCH
      const prevMatch: Row = {
        numero: 97, detentore: "Roma", sfidante: "Juventus", outcome: "s",
        data: "2024-04-20", durata: 0, league: LEAGUE, home: "Roma", away: "Juventus", risultato: "0-1",
      };
      const { client, find } = createFakeClient([MATCHES([prevMatch, CURR_MATCH])]);
      await run(client, { outcome: "s" });
      const b2b = find(/INSERT INTO stats/).filter((c) => c.values.includes("Back to Back"));
      expect(b2b).toHaveLength(1);
      expect(b2b[0].values).toEqual(["Juventus", DATA, LEAGUE, "Back to Back", 20, 100]);
    });

    it("updates an existing Decade Dominator record rather than inserting", async () => {
      // Juventus loses the title twice in 2020s → count=2 > 1 → fires
      const match95: Row = {
        numero: 95, detentore: "Juventus", sfidante: "Roma", outcome: "s",
        data: "2022-01-01", durata: 0, league: LEAGUE, home: "Juventus", away: "Roma", risultato: "0-1",
      };
      const match98: Row = {
        numero: 98, detentore: "Roma", sfidante: "Juventus", outcome: "s",
        data: "2023-01-01", durata: 0, league: LEAGUE, home: "Roma", away: "Juventus", risultato: "0-1",
      };
      const { client, find } = createFakeClient([
        MATCHES([match95, match98, CURR_MATCH]),
        [/SELECT 1 FROM stats WHERE league = \? AND statistica = \?/, [{ 1: 1 }]],
      ]);
      await run(client, { outcome: "s" });
      const updates = find(/UPDATE stats SET data = \?, squadra = \?, valore = \?, numero = \?/);
      expect(updates.some((c) => c.values.some((v) => String(v).startsWith("Decade Dominator")))).toBe(true);
      expect(find(/INSERT INTO stats/).filter((c) => c.values.some((v) => String(v).startsWith("Decade Dominator")))).toHaveLength(0);
    });

    it("records a 'Title Avenger' stat when the team wins back the title it previously lost", async () => {
      // t1: Milan was detentore, Juventus stole. Then Milan steals back (CURR_MATCH).
      const t1Match: Row = {
        numero: 90, detentore: "Milan", sfidante: "Juventus", outcome: "s",
        data: "2024-01-01", durata: 0, league: LEAGUE, home: "Milan", away: "Juventus", risultato: "0-1",
      };
      const { client, find } = createFakeClient([MATCHES([t1Match, CURR_MATCH])]);
      await run(client, { outcome: "s" });
      const avenger = find(/INSERT INTO stats/).filter((c) => c.values.some((v) => String(v).startsWith("Title Avenger")));
      expect(avenger).toHaveLength(1);
      // valore=0 steals between t1 and current; numero=100 (current match)
      expect(avenger[0].values).toEqual(["Juventus", DATA, LEAGUE, "Title Avenger vs Milan", 0, 100]);
    });

    it("records a 'Sleeping Giant' stat when a team wins after a 10-year absence", async () => {
      const oldMatch: Row = {
        numero: 5, detentore: "Juventus", sfidante: "Roma", outcome: "s",
        data: "2014-01-01", durata: 0, league: LEAGUE, home: "Juventus", away: "Roma", risultato: "0-1",
      };
      const midMatch: Row = {
        numero: 50, detentore: "Roma", sfidante: "Milan", outcome: "v",
        data: "2015-01-01", durata: 0, league: LEAGUE, home: "Roma", away: "Milan", risultato: "1-0",
      };
      const { client, find } = createFakeClient([MATCHES([oldMatch, midMatch, CURR_MATCH])]);
      await run(client, { outcome: "s" });
      const sg = find(/INSERT INTO stats/).filter((c) => c.values.includes("Sleeping Giant"));
      expect(sg).toHaveLength(1);
      expect(sg[0].values[0]).toBe("Juventus");
      expect(Number(sg[0].values[4])).toBeGreaterThan(3650); // ~10 years in days
    });

    it("records a 'Newbie' stat on a team's very first match appearance", async () => {
      const { client, find } = createFakeClient([MATCHES([CURR_MATCH])]);
      await run(client, { outcome: "s" });
      const newbies = find(/INSERT INTO stats/).filter((c) => c.values.includes("Newbie"));
      // Both detentore (Juventus) and sfidante (Milan) are first-timers
      expect(newbies.length).toBeGreaterThanOrEqual(1);
      expect(newbies.some((c) => c.values[0] === "Juventus")).toBe(true);
    });

    it("always deletes and re-inserts Stronghold, Consolation Prize, and King Slayer stats", async () => {
      // Set up matches so all three fire:
      // - Juventus 3-match reign (matches 2-4) → Stronghold
      // - Roma never won (regni=0, sfide=3) → ConsolationPrize
      // - After Juventus reign, Juventus comes back as sfidante and wins (match6) → KingSlayer
      const rankMatches: Row[] = [
        { numero: 1, detentore: "Roma", sfidante: "Juventus", outcome: "s", data: "2015-01-01", durata: 0, league: LEAGUE, home: "Roma", away: "Juventus", risultato: "0-1" },
        { numero: 2, detentore: "Juventus", sfidante: "Roma", outcome: "v", data: "2015-06-01", durata: 0, league: LEAGUE, home: "Juventus", away: "Roma", risultato: "1-0" },
        { numero: 3, detentore: "Juventus", sfidante: "Roma", outcome: "v", data: "2016-01-01", durata: 0, league: LEAGUE, home: "Juventus", away: "Roma", risultato: "1-0" },
        { numero: 4, detentore: "Juventus", sfidante: "Milan", outcome: "s", data: "2020-01-01", durata: 0, league: LEAGUE, home: "Juventus", away: "Milan", risultato: "0-1" },
        { numero: 5, detentore: "Milan", sfidante: "Juventus", outcome: "v", data: "2021-01-01", durata: 0, league: LEAGUE, home: "Milan", away: "Juventus", risultato: "1-0" },
        { numero: 6, detentore: "Milan", sfidante: "Juventus", outcome: "s", data: "2022-01-01", durata: 0, league: LEAGUE, home: "Milan", away: "Juventus", risultato: "0-1" },
        CURR_MATCH,
      ];
      const { client, find } = createFakeClient([
        MATCHES(rankMatches),
        SQUADRE_MAP([
          mkSquadraRow("Juventus"),
          mkSquadraRow("Roma", { regni: 0, sfide: 3 }),
          mkSquadraRow("Milan", { regni: 1, durata: 30 }),
        ]),
      ]);
      await run(client, { outcome: "s" });
      const deletes = find(/statistica LIKE \?/);
      expect(deletes.some((c) => c.values.includes("Stronghold%"))).toBe(true);
      expect(deletes.some((c) => c.values.includes("Consolation Prize%"))).toBe(true);
      expect(deletes.some((c) => c.values.includes("King Slayer%"))).toBe(true);
    });

    it("updates an existing Legacy Run record rather than inserting", async () => {
      const { client, find } = createFakeClient([
        MATCHES([CURR_MATCH]),
        SQUADRE_MAP([mkSquadraRow("Juventus", { regni: 12 })]),  // 10 < 12 ≤ 15 → Iron
        [/statistica LIKE 'Legacy Run%'/, [{ squadra: "Juventus" }]],
      ]);
      await run(client, { outcome: "s" });
      expect(find(/UPDATE stats SET data = \?, statistica = \?/).some((c) => c.values.includes("Legacy Run Iron"))).toBe(true);
      expect(find(/INSERT INTO stats/).filter((c) => c.values.includes("Legacy Run Iron"))).toHaveLength(0);
    });

    it("inserts a Dynasty Builder 'Class of' stat when no record exists for the decade", async () => {
      // durata > 0 is required for classOf to produce a non-zero totalDurata and pick a best team
      const classMatch: Row = { ...CURR_MATCH, durata: 100 };
      const { client, find } = createFakeClient([MATCHES([classMatch])]);
      await run(client, { outcome: "s", durata: 100 });
      const dynasty = find(/INSERT INTO stats/).filter((c) => c.values.some((v) => String(v).startsWith("Class of")));
      expect(dynasty).toHaveLength(1);
    });

    it("brand-new team (first time in DB) also receives the 'Millenial' stat on first steal", async () => {
      const atalantaMatch: Row = { ...CURR_MATCH, detentore: "Atalanta", home: "Atalanta" };
      const { client, find } = createFakeClient([MATCHES([atalantaMatch])]);
      await run(client, { outcome: "s", holder: "Atalanta" });
      expect(find(/INSERT INTO stats/).filter((c) => c.values.includes("Millenial"))).toHaveLength(1);
    });

    it("updates the 'Shortest Reign' stat after every match", async () => {
      const { client, find } = createFakeClient([
        MATCHES([CURR_MATCH]),
        SQUADRE_MAP([mkSquadraRow("Juventus", { durata: 50 })]),
      ]);
      await run(client, { outcome: "s" });
      const [update] = find(/statistica = 'Shortest Reign'/);
      expect(update.text).toMatch(/UPDATE stats SET/);
      // 'Shortest Reign' is a string literal in SQL, not a bound param.
      // Bound params: data, squadra, league, valore, numero, league
      expect(update.values[1]).toBe("Juventus"); // squadra
      expect(update.values[2]).toBe(LEAGUE);     // league
    });

    it("updates an existing All-Time Rivals record when the pair has ≥5 steals", async () => {
      const rivalMatches: Row[] = Array.from({ length: 5 }, (_, i) => ({
        numero: i + 1, detentore: "Juventus", sfidante: "Milan",
        outcome: "s", data: `2020-0${i + 1}-01`, durata: 0,
        league: LEAGUE, home: "Juventus", away: "Milan", risultato: "0-1",
      }));
      rivalMatches.push(CURR_MATCH);
      const { client, find } = createFakeClient([
        MATCHES(rivalMatches),
        [/statistica = \? AND squadra = \?/, [{ squadra: "Juventus" }]],
      ]);
      await run(client, { outcome: "s" });
      const updates = find(/UPDATE stats SET data = \?, valore = \?, numero = \?/);
      expect(updates.some((c) => c.values.includes("All Time Rival vs Milan"))).toBe(true);
      expect(find(/INSERT INTO stats/).filter((c) => c.values.includes("All Time Rival vs Milan"))).toHaveLength(0);
    });

    it("does not emit All-Time Rivals when the pair has fewer than 5 steals", async () => {
      // 3 previous + CURR_MATCH = 4 total; rivalCount < 5 → no stat
      const rivalMatches: Row[] = Array.from({ length: 3 }, (_, i) => ({
        numero: i + 1, detentore: "Juventus", sfidante: "Milan",
        outcome: "s", data: `2020-0${i + 1}-01`, durata: 0,
        league: LEAGUE, home: "Juventus", away: "Milan", risultato: "0-1",
      }));
      rivalMatches.push(CURR_MATCH);
      const { client, find } = createFakeClient([MATCHES(rivalMatches)]);
      await run(client, { outcome: "s" });
      expect(find(/INSERT INTO stats/).filter((c) => c.values.includes("All Time Rival vs Milan"))).toHaveLength(0);
      expect(find(/UPDATE stats/).filter((c) => c.values.includes("All Time Rival vs Milan"))).toHaveLength(0);
    });
  });
});
