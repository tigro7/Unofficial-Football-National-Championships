import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow } from "./types";

const decadeDominator: StatModule = {
    name: "decadeDominator",
    recalcDedup: (row: StatRow) => row.statistica,

    compute({ match: m, allMatches }: StatContext): StatResult | null {
        const decade = Math.floor(new Date(m.data).getFullYear() / 10) * 10;
        const wins = new Map<string, { count: number; lastData: string; lastNumero: number }>();
        for (const dm of allMatches) {
            if (dm.outcome === "s" && Math.floor(new Date(dm.data).getFullYear() / 10) * 10 === decade) {
                const ex = wins.get(dm.detentore);
                wins.set(dm.detentore, { count: (ex?.count ?? 0) + 1, lastData: dm.data, lastNumero: dm.numero });
            }
        }
        let best = { team: "", count: 0, lastData: "", lastNumero: 0 };
        for (const [team, d] of wins) {
            if (d.count > best.count || (d.count === best.count && d.lastData > best.lastData)) {
                best = { team, ...d };
            }
        }
        if (!best.team || best.count <= 1) return null;
        const statistica = `Decade Dominator ${decade}`;
        return { rows: [{ squadra: best.team, data: best.lastData, league: m.league, statistica, valore: best.count, numero: best.lastNumero }] };
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        for (const r of rows) {
            const exists = await client.sql`SELECT 1 FROM stats WHERE league = ${league} AND statistica = ${r.statistica}`;
            if (exists.rowCount && exists.rowCount > 0) {
                await client.sql`UPDATE stats SET data = ${r.data}, squadra = ${r.squadra}, valore = ${r.valore}, numero = ${r.numero}
                                 WHERE league = ${league} AND statistica = ${r.statistica}`;
            } else {
                await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero)
                                 VALUES (${r.squadra}, ${r.data}, ${league}, ${r.statistica}, ${r.valore}, ${r.numero})`;
            }
        }
    },
};

export default decadeDominator;
