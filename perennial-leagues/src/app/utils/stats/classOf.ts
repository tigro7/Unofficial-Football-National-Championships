import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow, computeReigns } from "./types";

const classOf: StatModule = {
    name: "classOf",
    recalcDedup: (row: StatRow) => row.statistica,

    compute({ match: m, allMatches, league }: StatContext): StatResult | null {
        const decade = Math.floor(new Date(m.data).getFullYear() / 10) * 10;
        const reigns = computeReigns(allMatches);
        const dm = new Map<string, { totalDurata: number; lastData: string; lastNumero: number }>();
        for (const r of reigns) {
            const dec = Math.floor(new Date(r.inizioRegno).getFullYear() / 10) * 10;
            if (dec !== decade) continue;
            const ex = dm.get(r.detentore);
            dm.set(r.detentore, {
                totalDurata: (ex?.totalDurata ?? 0) + r.maxDurata,
                lastData: r.fineRegno,
                lastNumero: r.fineNumero,
            });
        }
        let best = { team: "", totalDurata: 0, lastData: "", lastNumero: 0 };
        for (const [team, d] of dm) {
            if (d.totalDurata > best.totalDurata) best = { team, ...d };
        }
        if (!best.team) return null;
        const lm = allMatches.find(x => x.detentore === best.team && x.data === best.lastData);
        if (!lm) return null;
        const statistica = `Class of ${decade}`;
        return { rows: [{ squadra: best.team, data: best.lastData, league, statistica, valore: best.totalDurata, numero: lm.numero }] };
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
