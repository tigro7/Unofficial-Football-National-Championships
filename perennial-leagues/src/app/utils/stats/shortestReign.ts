import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult } from "./types";

const shortestReign: StatModule = {
    name: "shortestReign",
    recalcDedup: () => "Shortest Reign",

    compute({ allMatches, squadreMap, league }: StatContext): StatResult | null {
        const allSquadre = [...squadreMap.values()].filter(s => s.durata > 0);
        if (allSquadre.length === 0) return null;
        const shortest = allSquadre.reduce((best, s) => (s.durata < best.durata ? s : best));
        const sm = [...allMatches].reverse().find(x => x.detentore === shortest.squadra);
        if (!sm) return null;
        return { rows: [{ squadra: shortest.squadra, data: sm.data, league, statistica: "Shortest Reign", valore: shortest.durata, numero: sm.numero }] };
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        if (rows.length === 0) return;
        const r = rows[0];
        await client.sql`UPDATE stats SET data = ${r.data}, squadra = ${r.squadra}, league = ${league}, statistica = 'Shortest Reign', valore = ${r.valore}, numero = ${r.numero}
                         WHERE league = ${league} AND statistica = 'Shortest Reign'`;
    },
};

export default shortestReign;
