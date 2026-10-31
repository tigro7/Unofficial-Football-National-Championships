/**
 * In-memory stats calculator.
 * - Loads all matches + colors from DB (2 queries)
 * - Computes everything in memory (zero DB calls during compute)
 * - Writes scripts/recalc-snapshot.json
 *
 * Usage: npm run recalc:compute [league]
 * Then review snapshot, then: npm run recalc:apply
 */

import { db } from "@vercel/postgres";
import { writeFileSync } from "fs";
import { resolve } from "path";
import normalizeTeamName from "../src/app/utils/namesMap";
import { ALL_STAT_MODULES, Match, SquadraState, StatContext, StatRow, computeReigns } from "../src/app/utils/stats";
import boomer from "../src/app/utils/stats/boomer";

const league = process.argv[2] || "serie_a";

// ---- helpers ----

function daysBetween(a: string, b: string): number {
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

// ---- squadre update (mirrors statsCalc.tsx squadre logic, fully in-memory) ----

function applySquadraeUpdate(
    m: Match,
    squadreMap: Map<string, SquadraState>,
    colorsMap: Map<string, { primary: string; secondary: string }>,
    seenAsDetentore: Set<string>,
    prevMatch: Match | null,
) {
    const getOrCreate = (name: string): SquadraState => {
        if (!squadreMap.has(name)) {
            const c = colorsMap.get(name);
            squadreMap.set(name, {
                squadra: name, regni: 0, durata: 0, media: 0,
                colore_primario: c?.primary ?? "000000",
                colore_secondario: c?.secondary ?? "FFFFFF",
                league, difese: 0, media_difese: 0, sfide: 0,
            });
        }
        return squadreMap.get(name)!;
    };

    const dayDiff = prevMatch ? daysBetween(prevMatch.data, m.data) : 0;
    const isFirstDetentore = !seenAsDetentore.has(m.detentore);

    if (isFirstDetentore) {
        seenAsDetentore.add(m.detentore);
        const s = getOrCreate(m.detentore);
        s.regni = 1;
    } else {
        const s = getOrCreate(m.detentore);
        const newRegni = m.outcome === "s" ? s.regni + 1 : s.regni;
        const newDurata = m.outcome === "s" ? s.durata : s.durata + dayDiff;
        const newDifese = m.outcome === "s" ? s.difese : s.difese + 1;
        const defAvg = newRegni > 0 ? Math.round((newDifese / newRegni) * 100) / 100 : 0;
        s.regni = newRegni;
        s.durata = newDurata;
        s.media = newRegni > 0 ? Math.floor(newDurata / newRegni) : 0;
        s.difese = newDifese;
        s.media_difese = defAvg;
    }

    if (m.outcome !== "s") {
        const s = getOrCreate(m.sfidante);
        s.sfide = (s.sfide ?? 0) + 1;
    }
}

// ---- recalc accumulator ----

interface Accumulator {
    insert: StatRow[];
    upsert: Map<string, StatRow>;
}

function applyResult(acc: Accumulator, mod: (typeof ALL_STAT_MODULES)[0], ctx: StatContext) {
    const result = mod.compute(ctx);
    if (!result || result.rows.length === 0) return;

    for (const row of result.rows) {
        if (mod.recalcDedup) {
            acc.upsert.set(mod.recalcDedup(row), row);
        } else {
            acc.insert.push(row);
        }
    }
}

// ---- main ----

async function main() {
    console.log(`In-memory recalc for league: ${league}`);

    const client = await db.connect();
    let matches: Match[];
    let existingSquadre: SquadraState[];
    try {
        const mr = await client.sql`SELECT * FROM matches WHERE league = ${league} AND outcome != 'n' ORDER BY numero ASC`;
        matches = mr.rows.map(r => ({
            ...r,
            data: new Date(r.data as string).toISOString().split("T")[0],
            detentore: normalizeTeamName(r.detentore as string),
            sfidante: normalizeTeamName(r.sfidante as string),
        })) as Match[];

        const sr = await client.sql`SELECT * FROM squadre WHERE league = ${league}`;
        existingSquadre = sr.rows as SquadraState[];
    } finally {
        client.release();
    }

    console.log(`Loaded ${matches.length} matches, ${existingSquadre.length} teams`);

    const colorsMap = new Map(existingSquadre.map(s => [s.squadra, { primary: s.colore_primario, secondary: s.colore_secondario }]));
    const squadreMap = new Map<string, SquadraState>();
    const seenAsDetentore = new Set<string>();
    const acc: Accumulator = { insert: [], upsert: new Map() };

    console.log("Computing stats in memory...");

    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const prevMatch = i > 0 ? matches[i - 1] : null;

        applySquadraeUpdate(m, squadreMap, colorsMap, seenAsDetentore, prevMatch);

        const ctx: StatContext = {
            league,
            match: m,
            allMatches: matches.slice(0, i + 1),
            squadreMap: new Map(squadreMap),
        };

        for (const mod of ALL_STAT_MODULES) {
            applyResult(acc, mod, ctx);
        }

        if ((i + 1) % 200 === 0) process.stdout.write(`  ${i + 1}/${matches.length}\r`);
    }

    // Boomer: recalc-only, computed from full history
    if (matches.length > 0) {
        const fullCtx: StatContext = {
            league,
            match: matches[matches.length - 1],
            allMatches: matches,
            squadreMap: new Map(squadreMap),
        };
        applyResult(acc, boomer, fullCtx);
    }

    console.log(`\nDone.`);
    const squadre = [...squadreMap.values()];
    const stats: StatRow[] = [...acc.insert, ...acc.upsert.values()];
    console.log(`  squadre: ${squadre.length} rows`);
    console.log(`  stats:   ${stats.length} rows`);

    const snapshot = {
        league,
        capturedAt: new Date().toISOString(),
        matchesProcessed: matches.length,
        squadre,
        stats,
    };
    const outPath = resolve(__dirname, "recalc-snapshot.json");
    writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
    console.log(`Snapshot → ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
