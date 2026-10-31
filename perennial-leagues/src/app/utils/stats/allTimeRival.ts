import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow } from "./types";

const allTimeRival: StatModule = {
    name: "allTimeRival",
    recalcDedup: (row: StatRow) => `All Time Rivals:${row.squadra}:${row.statistica}`,

    compute({ match: m, allMatches, league }: StatContext): StatResult | null {
        if (m.outcome !== "s") return null;
        const rivalCount = allMatches.filter(x => x.outcome === "s" && x.detentore === m.detentore && x.sfidante === m.sfidante).length;
        if (rivalCount < 5) return null;
        return { rows: [{ squadra: m.detentore, data: m.data, league, statistica: `All Time Rival vs ${m.sfidante}`, valore: rivalCount, numero: m.numero }] };
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
