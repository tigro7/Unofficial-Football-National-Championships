import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow } from "./types";

const allTimeRival: StatModule = {
    name: "allTimeRival",
    recalcDedup: (row: StatRow) => `All Time Rivals:${row.squadra}:${row.statistica}`,

    compute({ match: m, allMatches, league }: StatContext): StatResult | null {
        if (m.outcome !== "s" && m.outcome !== "v") return null;
        const winner = m.outcome === "s" ? m.sfidante : m.detentore;
        const loser  = m.outcome === "s" ? m.detentore : m.sfidante;
        const rivalCount = allMatches.filter(x =>
            (x.outcome === "s" && x.sfidante === winner && x.detentore === loser) ||
            (x.outcome === "v" && x.detentore === winner && x.sfidante === loser)
        ).length;
        if (rivalCount < 5) return null;
        return { rows: [{ squadra: winner, data: m.data, league, statistica: `All Time Rival vs ${loser}`, valore: rivalCount, numero: m.numero }] };
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        for (const r of rows) {
            const exists = await client.sql`SELECT 1 FROM stats WHERE league = ${league} AND statistica = ${r.statistica} AND squadra = ${r.squadra}`;
            if (exists.rowCount && exists.rowCount > 0) {
                await client.sql`UPDATE stats SET data = ${r.data}, valore = ${r.valore}, numero = ${r.numero}
                                 WHERE league = ${league} AND statistica = ${r.statistica} AND squadra = ${r.squadra}`;
            } else {
                await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero)
                                 VALUES (${r.squadra}, ${r.data}, ${league}, ${r.statistica}, ${r.valore}, ${r.numero})`;
            }
        }
    },
};

export default allTimeRival;
