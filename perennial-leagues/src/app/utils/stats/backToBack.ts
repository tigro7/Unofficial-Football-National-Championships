import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, daysBetween } from "./types";

const backToBack: StatModule = {
    name: "backToBack",

    compute({ match: m, allMatches }: StatContext): StatResult | null {
        if (m.outcome !== "s") return null;
        const idx = allMatches.length - 1;
        for (let j = idx - 1; j >= 0; j--) {
            const t1 = allMatches[j];
            if (t1.outcome === "s" && t1.sfidante === m.detentore) {
                const days = daysBetween(t1.data, m.data);
                if (days < 30) {
                    return { rows: [{ squadra: m.detentore, data: m.data, league: m.league, statistica: "Back to Back", valore: Math.round(days), numero: m.numero }] };
                }
                if (m.numero - t1.numero <= 5) {
                    return { rows: [{ squadra: m.detentore, data: m.data, league: m.league, statistica: "Back to Back", valore: m.numero - t1.numero, numero: m.numero }] };
                }
                return null;
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

export default backToBack;
