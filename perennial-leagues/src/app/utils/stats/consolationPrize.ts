import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow } from "./types";

const consolationPrize: StatModule = {
    name: "consolationPrize",
    recalcDedup: (row: StatRow) => row.statistica,

    compute({ allMatches, squadreMap, league }: StatContext): StatResult | null {
        const noWinners = [...squadreMap.values()]
            .filter(s => s.regni === 0 && (s.sfide ?? 0) > 0)
            .sort((a, b) => (b.sfide ?? 0) - (a.sfide ?? 0))
            .slice(0, 9);
        const rows: StatRow[] = [];
        noWinners.forEach((t, idx) => {
            const lm = [...allMatches].reverse().find(x => x.sfidante === t.squadra);
            if (lm) {
                rows.push({ squadra: t.squadra, data: lm.data, league, statistica: `Consolation Prize ${idx + 1}`, valore: t.sfide, numero: lm.numero });
            }
        });
        return rows.length > 0 ? { rows, deletePattern: "Consolation Prize%" } : null;
    },

    async persist(client: VercelPoolClient, league: string, { rows, deletePattern }: StatResult): Promise<void> {
        if (deletePattern) {
            await client.sql`DELETE FROM stats WHERE league = ${league} AND statistica LIKE ${deletePattern}`;
        }
        for (const r of rows) {
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero)
                             VALUES (${r.squadra}, ${r.data}, ${league}, ${r.statistica}, ${r.valore}, ${r.numero})`;
        }
    },
};

export default consolationPrize;
