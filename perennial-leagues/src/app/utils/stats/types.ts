import { VercelPoolClient } from "@vercel/postgres";

export interface Match {
    numero: number;
    detentore: string;
    sfidante: string;
    risultato: string;
    data: string;
    durata: number;
    league: string;
    outcome: string;
    home: string;
    away: string;
}

export interface SquadraState {
    squadra: string;
    regni: number;
    durata: number;
    media: number;
    colore_primario: string;
    colore_secondario: string;
    league: string;
    difese: number;
    media_difese: number;
    sfide: number;
}

export interface StatRow {
    squadra: string;
    data: string | null;
    league: string;
    statistica: string;
    valore: number | null;
    numero: number | null;
}

export interface StatContext {
    league: string;
    /** The current match being processed (always the last entry in allMatches). */
    match: Match;
    /** All played matches for the league up to and including the current one, ordered by numero ASC. */
    allMatches: Match[];
    /** Squadre state AFTER processing the current match. */
    squadreMap: Map<string, SquadraState>;
}

export interface StatResult {
    rows: StatRow[];
    /** If set, DELETE WHERE statistica LIKE deletePattern before inserting (live path). */
    deletePattern?: string;
}

export interface StatModule {
    name: string;
    /** Key for dedup in recalc accumulator (upsert semantics: last write wins). Omit for INSERT-only stats. */
    recalcDedup?: (row: StatRow) => string;
    compute(ctx: StatContext): StatResult | null;
    persist(client: VercelPoolClient, league: string, result: StatResult): Promise<void>;
}

// ---- shared helpers ----

export interface Reign {
    detentore: string;
    inizioRegno: string;
    fineRegno: string;
    fineNumero: number;
    partite: number;
    maxDurata: number;
}

export function daysBetween(a: string, b: string): number {
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function computeReigns(matches: Match[]): Reign[] {
    const reigns: Reign[] = [];
    let cur: Reign | null = null;
    for (const m of matches) {
        if (!cur || cur.detentore !== m.detentore) {
            if (cur) reigns.push(cur);
            cur = { detentore: m.detentore, inizioRegno: m.data, fineRegno: m.data, fineNumero: m.numero, partite: 1, maxDurata: m.durata };
        } else {
            cur.fineRegno = m.data;
            cur.fineNumero = m.numero;
            cur.partite++;
            cur.maxDurata = Math.max(cur.maxDurata, m.durata);
        }
    }
    if (cur) reigns.push(cur);
    return reigns;
}
