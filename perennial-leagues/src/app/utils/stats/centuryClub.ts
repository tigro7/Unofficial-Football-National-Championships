import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow } from "./types";

function tier(durata: number): string {
    if (durata > 3650) return "Gold";
    if (durata > 1826) return "Silver";
    return "Bronze";
}

const centuryClub: StatModule = {
    name: "centuryClub",
    recalcDedup: (row: StatRow) => `Century Club:${row.squadra}`,

    compute({ match: m, squadreMap, league }: StatContext): StatResult | null {
        const state = squadreMap.get(m.detentore);
        if (!state || state.durata <= 365) return null;
        const statistica = `Century Club ${tier(state.durata)}`;
        return { rows: [{ squadra: m.detentore, data: m.data, league, statistica, valore: state.durata, numero: m.numero }] };
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        for (const r of rows) {
            const exists = await client.sql`SELECT 1 FROM stats WHERE league = ${league} AND statistica LIKE 'Century Club%' AND squadra = ${r.squadra}`;
            if (exists.rowCount && exists.rowCount > 0) {
                await client.sql`UPDATE stats SET data = ${r.data}, statistica = ${r.statistica}, valore = ${r.valore}, numero = ${r.numero}
                                 WHERE league = ${league} AND statistica LIKE 'Century Club%' AND squadra = ${r.squadra}`;
            } else {
                await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero)
                                 VALUES (${r.squadra}, ${r.data}, ${league}, ${r.statistica}, ${r.valore}, ${r.numero})`;
            }
        }
    },
};

export default centuryClub;
