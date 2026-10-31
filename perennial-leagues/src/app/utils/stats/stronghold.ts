import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow, computeReigns } from "./types";

const stronghold: StatModule = {
    name: "stronghold",
    recalcDedup: (row: StatRow) => row.statistica,

    compute({ allMatches, league }: StatContext): StatResult | null {
        const reigns = computeReigns(allMatches);
        const top = [...reigns].sort((a, b) => b.partite - a.partite).slice(0, 10);
        const rows: StatRow[] = [];
        top.forEach((r, idx) => {
            const lm = allMatches.find(x => x.detentore === r.detentore && x.data === r.fineRegno);
            if (lm) {
                rows.push({ squadra: r.detentore, data: r.fineRegno, league, statistica: `Stronghold Record ${idx + 1}`, valore: r.partite, numero: lm.numero });
            }
        });
        return rows.length > 0 ? { rows, deletePattern: "Stronghold%" } : null;
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

export default stronghold;
