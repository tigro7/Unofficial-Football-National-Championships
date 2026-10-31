import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult } from "./types";

const newbie: StatModule = {
    name: "newbie",

    compute({ match: m, allMatches, league }: StatContext): StatResult | null {
        const rows = [];
        const prev = allMatches.slice(0, -1);
        for (const name of [m.detentore, m.sfidante]) {
            const firstEver = !prev.some(x => x.detentore === name || x.sfidante === name);
            if (firstEver) {
                rows.push({ squadra: name, data: m.data, league, statistica: "Newbie", valore: null, numero: m.numero });
            }
        }
        return rows.length > 0 ? { rows } : null;
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        for (const r of rows) {
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, numero)
                             VALUES (${r.squadra}, ${r.data}, ${league}, ${r.statistica}, ${r.numero})`;
        }
    },
};

export default newbie;
