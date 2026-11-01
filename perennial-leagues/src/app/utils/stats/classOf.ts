import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow, computeReigns } from "./types";

const classOf: StatModule = {
    name: "classOf",
    recalcDedup: (row: StatRow) => row.statistica,

    compute({ match: m, allMatches, league }: StatContext): StatResult | null {
        if (m.outcome === "n") return null;
        const currentDecade = Math.floor(new Date(m.data).getUTCFullYear() / 10) * 10;
        const reigns = computeReigns(allMatches);
        const decades = new Map<number, Map<string, StatRow>>();
        for (const r of reigns) {
            const start = new Date(r.inizioRegno).getTime();
            // durata is cumulative within a reign, not an additional duration per match.
            const end = start + r.maxDurata * 86400000;
            const firstDecade = Math.floor(new Date(start).getUTCFullYear() / 10) * 10;
            for (let decade = firstDecade; decade <= currentDecade; decade += 10) {
                const decadeStart = Date.UTC(decade, 0, 1);
                const decadeEnd = Date.UTC(decade + 10, 0, 1);
                if (decadeStart >= end) break;
                const duration = Math.round((Math.min(end, decadeEnd) - Math.max(start, decadeStart)) / 86400000);
                if (duration <= 0) continue;
                let teams = decades.get(decade);
                if (!teams) {
                    teams = new Map<string, StatRow>();
                    decades.set(decade, teams);
                }
                const previous = teams.get(r.detentore);
                teams.set(r.detentore, {
                    squadra: r.detentore,
                    data: r.fineRegno,
                    league,
                    statistica: `Class of ${decade}`,
                    valore: (previous?.valore ?? 0) + duration,
                    numero: r.fineNumero,
                });
            }
        }
        // Refresh earlier decades too: a match after January 1 can complete their totals.
        const rows: StatRow[] = [];
        for (const [, teams] of [...decades].sort(([a], [b]) => a - b)) {
            let best: StatRow | undefined;
            for (const row of teams.values()) {
                if (!best || (row.valore ?? 0) > (best.valore ?? 0)) best = row;
            }
            if (best) rows.push(best);
        }
        return rows.length > 0 ? { rows } : null;
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        for (const r of rows) {
            const exists = await client.sql`SELECT 1 FROM stats WHERE league = ${league} AND statistica = ${r.statistica}`;
            if (exists.rowCount && exists.rowCount > 0) {
                await client.sql`UPDATE stats SET data = ${r.data}, valore = ${r.valore}, squadra = ${r.squadra}, numero = ${r.numero}
                                 WHERE league = ${league} AND statistica = ${r.statistica}`;
            } else {
                await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero)
                                 VALUES (${r.squadra}, ${r.data}, ${league}, ${r.statistica}, ${r.valore}, ${r.numero})`;
            }
        }
    },
};

export default classOf;
