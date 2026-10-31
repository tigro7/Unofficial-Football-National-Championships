import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow, computeReigns } from "./types";

const kingSlayer: StatModule = {
    name: "kingSlayer",
    recalcDedup: (row: StatRow) => row.statistica,

    compute({ allMatches, league }: StatContext): StatResult | null {
        const reigns = computeReigns(allMatches);
        const top = [...reigns].sort((a, b) => b.partite - a.partite).slice(0, 10);
        const rows: StatRow[] = [];
        top.forEach(r => {
            const slayer = allMatches.find(x => x.data > r.fineRegno && x.sfidante === r.detentore && x.outcome === "s");
            if (slayer) {
                rows.push({ squadra: slayer.detentore, data: slayer.data, league, statistica: `King Slayer vs ${r.detentore}`, valore: r.maxDurata, numero: slayer.numero });
            }
        });
        return rows.length > 0 ? { rows, deletePattern: "King Slayer%" } : null;
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

export default kingSlayer;
