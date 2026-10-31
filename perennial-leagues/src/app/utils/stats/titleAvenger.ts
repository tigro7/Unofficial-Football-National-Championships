import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult } from "./types";

const titleAvenger: StatModule = {
    name: "titleAvenger",

    compute({ match: m, allMatches, league }: StatContext): StatResult | null {
        if (m.outcome !== "s") return null;
        const idx = allMatches.length - 1;
        for (let j = idx - 1; j >= 0; j--) {
            const t1 = allMatches[j];
            if (t1.outcome === "s" && t1.detentore === m.sfidante && t1.sfidante === m.detentore) {
                const hadWin = allMatches.slice(j + 1, idx).some(x => x.outcome === "s" && x.detentore === m.detentore);
                if (!hadWin) {
                    const recordCount = allMatches.slice(j + 1, idx).filter(x => x.outcome === "s").length;
                    return { rows: [{ squadra: m.detentore, data: m.data, league, statistica: `Title Avenger vs ${m.sfidante}`, valore: recordCount, numero: m.numero }] };
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

export default titleAvenger;
