import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult } from "./types";

const millenial: StatModule = {
    name: "millenial",

    compute({ match: m, allMatches, league }: StatContext): StatResult | null {
        // Fires when a team holds the title for the first time and it's in or after 2000.
        const isFirstTitle = !allMatches.slice(0, -1).some(x => x.detentore === m.detentore);
        if (!isFirstTitle) return null;
        if (new Date(m.data).getFullYear() < 2000) return null;
        return { rows: [{ squadra: m.detentore, data: m.data, league, statistica: "Millenial", valore: null, numero: m.numero }] };
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        for (const r of rows) {
            // Remove any Boomer tag this team had — can't be both
            await client.sql`DELETE FROM stats WHERE league = ${league} AND squadra = ${r.squadra} AND statistica = 'Boomer'`;
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, numero)
                             VALUES (${r.squadra}, ${r.data}, ${league}, ${r.statistica}, ${r.numero})`;
        }
    },
};

export default millenial;
