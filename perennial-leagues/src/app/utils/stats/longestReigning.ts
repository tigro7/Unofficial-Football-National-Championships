import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult } from "./types";

const longestReigning: StatModule = {
    name: "longestReigning",
    recalcDedup: () => "Longest Reigning",

    compute({ allMatches, squadreMap, league }: StatContext): StatResult | null {
        const allSquadre = [...squadreMap.values()].filter(s => s.durata > 0);
        if (allSquadre.length === 0) return null;
        const longest = allSquadre.reduce((best, s) => (s.durata > best.durata ? s : best));
        const lm = [...allMatches].reverse().find(x => x.detentore === longest.squadra);
        if (!lm) return null;
        return { rows: [{ squadra: longest.squadra, data: lm.data, league, statistica: "Longest Reigning", valore: longest.durata, numero: lm.numero }] };
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        if (rows.length === 0) return;
        const r = rows[0];
        await client.sql`UPDATE stats SET data = ${r.data}, squadra = ${r.squadra}, league = ${league}, statistica = 'Longest Reigning', valore = ${r.valore}, numero = ${r.numero}
                         WHERE league = ${league} AND statistica IN ('Longest Reigning', 'Longest Combined Reign')`;
    },
};

export default longestReigning;
