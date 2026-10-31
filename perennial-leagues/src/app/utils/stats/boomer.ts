import { VercelPoolClient } from "@vercel/postgres";
import { StatContext, StatModule, StatResult, StatRow } from "./types";

/**
 * Recalc-only module: teams whose last title reign ended before 1940.
 * The live path never adds this stat — it only deletes it when Millenial fires.
 * Do NOT include in ALL_STAT_MODULES; call explicitly from recalc only.
 */
const boomer: StatModule = {
    name: "boomer",
    recalcDedup: (row: StatRow) => `Boomer:${row.squadra}`,

    compute({ allMatches, league }: StatContext): StatResult | null {
        const lastReign = new Map<string, { lastDate: string; lastNumero: number }>();
        for (const m of allMatches) {
            const ex = lastReign.get(m.detentore);
            if (!ex || m.data > ex.lastDate) {
                lastReign.set(m.detentore, { lastDate: m.data, lastNumero: m.numero });
            }
        }
        const rows: StatRow[] = [];
        for (const [team, { lastDate, lastNumero }] of lastReign) {
            if (new Date(lastDate).getFullYear() < 1940) {
                rows.push({ squadra: team, data: lastDate, league, statistica: "Boomer", valore: null, numero: lastNumero });
            }
        }
        return rows.length > 0 ? { rows } : null;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async persist(_client: VercelPoolClient, _league: string, _result: StatResult): Promise<void> {
        // Boomer is recalc-only; the live path never calls persist for this module
    },
};

export default boomer;
