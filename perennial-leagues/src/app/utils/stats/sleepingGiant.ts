import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, daysBetween } from "./types";

const sleepingGiant: StatModule = {
    name: "sleepingGiant",

    compute({ match: m, allMatches, league }: StatContext): StatResult | null {
        if (m.outcome !== "s") return null;
        const idx = allMatches.length - 1;
        for (let j = idx - 1; j >= 0; j--) {
            if (allMatches[j].detentore === m.detentore) {
                const sleep = daysBetween(allMatches[j].data, m.data);
                if (sleep > 3650) {
                    const hadInterim = allMatches.slice(j + 1, idx).some(x => x.detentore === m.detentore);
                    if (!hadInterim) {
                        return { rows: [{ squadra: m.detentore, data: m.data, league, statistica: "Sleeping Giant", valore: Math.round(sleep), numero: m.numero }] };
                    }
                }
                break;
            }
        }
        return null;
    },

    async persist(client: VercelPoolClient, league: string, { rows }: StatResult): Promise<void> {
        for (const r of rows) {
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero)
                             VALUES (${r.squadra}, ${r.data}, ${league}, ${r.statistica}, ${r.valore}, ${r.numero})`;
        }
    },
};

export default sleepingGiant;
