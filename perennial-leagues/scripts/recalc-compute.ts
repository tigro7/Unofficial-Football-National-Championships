/**
 * In-memory stats calculator.
 * - Loads all matches + colors from DB (2 queries)
 * - Computes everything in memory (zero DB calls)
 * - Writes scripts/recalc-snapshot.json
 *
 * Usage: npm run recalc:compute [league]
 * Then review snapshot, then: npm run recalc:apply
 */

import { db } from '@vercel/postgres';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import normalizeTeamName from '../src/app/utils/namesMap';

const league = process.argv[1] || 'serie_a';

// ---- types ----

interface Match {
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

interface SquadraState {
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

interface StatRow {
    squadra: string;
    data: string | null;
    league: string;
    statistica: string;
    valore: number | null;
    numero: number | null;
}

interface Reign {
    detentore: string;
    inizioRegno: string;
    fineRegno: string;
    fineNumero: number;
    partite: number;
    maxDurata: number;
}

// ---- helpers ----

function daysBetween(a: string, b: string): number {
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

// Groups consecutive stretches where the same team is detentore.
function computeReigns(matches: Match[]): Reign[] {
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

// ---- core calculation ----

function computeStats(matches: Match[], colorsMap: Map<string, { primary: string; secondary: string }>) {
    const squadreMap = new Map<string, SquadraState>();
    // INSERT-only stats (no dedup) — stored in order
    const insertStats: StatRow[] = [];
    // UPSERT stats — keyed by a unique string
    const upsertStats = new Map<string, StatRow>();

    const ins = (row: StatRow) => insertStats.push(row);
    const ups = (key: string, row: StatRow) => upsertStats.set(key, row);

    const getOrCreate = (name: string): SquadraState => {
        if (!squadreMap.has(name)) {
            const c = colorsMap.get(name);
            squadreMap.set(name, {
                squadra: name, regni: 0, durata: 0, media: 0,
                colore_primario: c?.primary ?? '000000',
                colore_secondario: c?.secondary ?? 'FFFFFF',
                league, difese: 0, media_difese: 0, sfide: 0,
            });
        }
        return squadreMap.get(name)!;
    };

    // Track first time each team appears as detentore (= INSERT path in original)
    const seenAsDetentore = new Set<string>();
    // Track first appearance (detentore or sfidante) for Newbie stat
    const firstAppearance = new Map<string, { data: string; numero: number }>();

    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const prev = i > 0 ? matches[i - 1] : null;

        // Use actual days between matches (ignoring stored matches.durata which may be corrupted).
        // After a title change the previous match had durata=0, so a new reign always starts fresh.
        const dayDiff = prev ? daysBetween(prev.data, m.data) : 0;

        // ---- track first appearances for Newbie ----
        for (const name of [m.detentore, m.sfidante]) {
            if (!firstAppearance.has(name)) firstAppearance.set(name, { data: m.data, numero: m.numero });
        }

        // ---- squadre: detentore ----
        const isFirstDetentore = !seenAsDetentore.has(m.detentore);
        if (isFirstDetentore) {
            // Replicates the INSERT path: regni=1, durata/difese=0
            seenAsDetentore.add(m.detentore);
            const s = getOrCreate(m.detentore);
            s.regni = 1;
            // durata and difese stay 0 (INSERT doesn't set them based on outcome)
        } else {
            const s = getOrCreate(m.detentore);
            const currentRegni = s.regni ?? 0;
            const currentDurata = s.durata ?? 0;
            const currentDifese = s.difese ?? 0;
            const newRegni = m.outcome === 's' ? currentRegni + 1 : currentRegni;
            const newDurata = m.outcome === 's' ? currentDurata : currentDurata + dayDiff;
            const newDifese = m.outcome === 's' ? currentDifese : currentDifese + 1;
            const defAvg = newRegni > 0 ? Math.round((newDifese / newRegni) * 100) / 100 : 0;
            s.regni = newRegni;
            s.durata = newDurata;
            s.media = newRegni > 0 ? Math.floor(newDurata / newRegni) : 0;
            s.difese = newDifese;
            s.media_difese = defAvg;
        }

        // ---- squadre: sfidante (only when outcome != 's') ----
        if (m.outcome !== 's') {
            const s = getOrCreate(m.sfidante);
            s.sfide = (s.sfide ?? 0) + 1;
        }

        const detState = squadreMap.get(m.detentore)!;

        // ---- Back to Back ----
        // Variant 1: won back quickly by date (< 30 days)
        // Variant 2: won back quickly by match count (<= 5 matches, >= 30 days)
        if (m.outcome === 's') {
            for (let j = i - 1; j >= 0; j--) {
                if (matches[j].outcome === 's' && matches[j].sfidante === m.detentore) {
                    const t1 = matches[j];
                    const days = daysBetween(t1.data, m.data);
                    if (days < 30) {
                        ins({ squadra: m.detentore, data: m.data, league, statistica: 'Back to Back', valore: Math.round(days), numero: m.numero });
                    } else if (m.numero - t1.numero <= 5) {
                        ins({ squadra: m.detentore, data: m.data, league, statistica: 'Back to Back', valore: m.numero - t1.numero, numero: m.numero });
                    }
                    break;
                }
            }
        }

        // ---- Decade Dominator ----
        const decade = Math.floor(new Date(m.data).getFullYear() / 10) * 10;
        const decadeWins = new Map<string, { count: number; lastData: string; lastNumero: number }>();
        for (let j = 0; j <= i; j++) {
            const dm = matches[j];
            if (dm.outcome === 's' && Math.floor(new Date(dm.data).getFullYear() / 10) * 10 === decade) {
                const ex = decadeWins.get(dm.detentore);
                decadeWins.set(dm.detentore, { count: (ex?.count ?? 0) + 1, lastData: dm.data, lastNumero: dm.numero });
            }
        }
        let ddBest = { team: '', count: 0, lastData: '', lastNumero: 0 };
        for (const [team, d] of decadeWins) {
            if (d.count > ddBest.count || (d.count === ddBest.count && d.lastData > ddBest.lastData)) {
                ddBest = { team, count: d.count, lastData: d.lastData, lastNumero: d.lastNumero };
            }
        }
        if (ddBest.team && ddBest.count > 1) {
            const decadeStat = `Decade Dominator ${decade}`;
            ups(decadeStat, { squadra: ddBest.team, data: ddBest.lastData, league, statistica: decadeStat, valore: ddBest.count, numero: ddBest.lastNumero });
        }

        // ---- Millenial (first ever title win, must be after year 2000) ----
        if (isFirstDetentore && new Date(m.data).getFullYear() >= 2000) {
            ins({ squadra: m.detentore, data: m.data, league, statistica: 'Millenial', valore: null, numero: m.numero });
        }

        // ---- Newbie (first ever appearance in this league) ----
        for (const name of [m.detentore, m.sfidante]) {
            const fa = firstAppearance.get(name);
            if (fa && fa.data === m.data) {
                ins({ squadra: name, data: m.data, league, statistica: 'Newbie', valore: null, numero: m.numero });
            }
        }

        // ---- Century Club ----
        if (detState.durata > 365) {
            let tier = 'Bronze';
            if (detState.durata > 3650) tier = 'Gold';
            else if (detState.durata > 1826) tier = 'Silver';
            ups(`Century Club:${m.detentore}`, { squadra: m.detentore, data: m.data, league, statistica: `Century Club ${tier}`, valore: detState.durata, numero: m.numero });
        }

        // ---- Legacy Run ----
        if (detState.regni > 10) {
            let tier = 'Iron';
            if (detState.regni > 100) tier = 'Platinum';
            else if (detState.regni > 50) tier = 'Gold';
            else if (detState.regni > 25) tier = 'Silver';
            else if (detState.regni > 15) tier = 'Bronze';
            ups(`Legacy Run:${m.detentore}`, { squadra: m.detentore, data: m.data, league, statistica: `Legacy Run ${tier}`, valore: detState.regni, numero: m.numero });
        }

        // ---- Title Avenger ----
        // Current: m.detentore just stole (outcome='s') from m.sfidante
        // Avenger: m.detentore previously had title stolen by m.sfidante, and hasn't won since
        if (m.outcome === 's') {
            for (let j = i - 1; j >= 0; j--) {
                const t1 = matches[j];
                if (t1.outcome === 's' && t1.detentore === m.sfidante && t1.sfidante === m.detentore) {
                    // Check no intermediate 's' for m.detentore between t1 and now
                    const hadWin = matches.slice(j + 1, i).some(x => x.outcome === 's' && x.detentore === m.detentore);
                    if (!hadWin) {
                        const recordCount = matches.slice(j + 1, i).filter(x => x.outcome === 's').length;
                        ins({ squadra: m.detentore, data: m.data, league, statistica: `Title Avenger vs ${m.sfidante}`, valore: recordCount, numero: m.numero });
                    }
                    break;
                }
            }
        }

        // ---- Sleeping Giant ----
        // m.detentore just won (outcome='s') after 3650+ days without holding title
        if (m.outcome === 's') {
            for (let j = i - 1; j >= 0; j--) {
                if (matches[j].detentore === m.detentore) {
                    const sleep = daysBetween(matches[j].data, m.data);
                    if (sleep > 3650) {
                        const hadInterim = matches.slice(j + 1, i).some(x => x.detentore === m.detentore);
                        if (!hadInterim) {
                            ins({ squadra: m.detentore, data: m.data, league, statistica: 'Sleeping Giant', valore: Math.round(sleep), numero: m.numero });
                        }
                    }
                    break;
                }
            }
        }

        // ---- All-Time Rivals ----
        if (m.outcome === 's') {
            const rivalCount = matches.slice(0, i + 1).filter(x => x.outcome === 's' && x.detentore === m.detentore && x.sfidante === m.sfidante).length;
            if (rivalCount >= 5) {
                ups(`All Time Rivals:${m.detentore}:${m.sfidante}`, {
                    squadra: m.detentore, data: m.data, league,
                    statistica: `All Time Rival vs ${m.sfidante}`,
                    valore: rivalCount, numero: m.numero,
                });
            }
        }

        if ((i + 1) % 200 === 0) process.stdout.write(`  ${i + 1}/${matches.length}\r`);
    }

    // ---- league-wide stats (computed once from full history) ----

    const reigns = computeReigns(matches);

    // Longest Reigning + Shortest Reign
    const allSquadre = [...squadreMap.values()];
    const longest = allSquadre.sort((a, b) => b.durata - a.durata)[0];
    if (longest) {
        const lm = [...matches].reverse().find(x => x.detentore === longest.squadra);
        if (lm) ups('Longest Reigning', { squadra: longest.squadra, data: lm.data, league, statistica: 'Longest Reigning', valore: longest.durata, numero: lm.numero });
    }
    const shortest = allSquadre.filter(s => s.durata > 0).sort((a, b) => a.durata - b.durata)[0];
    if (shortest) {
        const sm = [...matches].reverse().find(x => x.detentore === shortest.squadra);
        if (sm) ups('Shortest Reign', { squadra: shortest.squadra, data: sm.data, league, statistica: 'Shortest Reign', valore: shortest.durata, numero: sm.numero });
    }

    // Stronghold Record: top 10 single reigns by partite
    const topReigns = [...reigns].sort((a, b) => b.partite - a.partite).slice(0, 10);
    topReigns.forEach((r, idx) => {
        const lm = matches.find(x => x.detentore === r.detentore && x.data === r.fineRegno);
        if (lm) ups(`Stronghold ${idx + 1}`, { squadra: r.detentore, data: r.fineRegno, league, statistica: `Stronghold Record ${idx + 1}`, valore: r.partite, numero: lm.numero });
    });

    // Consolation Prize: top 9 teams with regni=0, sorted by sfide desc
    const noWinners = [...squadreMap.values()].filter(s => s.regni === 0 && (s.sfide ?? 0) > 0).sort((a, b) => (b.sfide ?? 0) - (a.sfide ?? 0)).slice(0, 9);
    noWinners.forEach((t, idx) => {
        const lm = [...matches].reverse().find(x => x.sfidante === t.squadra);
        if (lm) ups(`Consolation ${idx + 1}`, { squadra: t.squadra, data: lm.data, league, statistica: `Consolation Prize ${idx + 1}`, valore: t.sfide, numero: lm.numero });
    });

    // King Slayer: top 10 reigns by partite, with who beat them next
    topReigns.forEach(r => {
        const slayer = matches.find(x => x.data > r.fineRegno && x.sfidante === r.detentore && x.outcome === 's');
        if (slayer) ups(`King Slayer:${r.detentore}`, { squadra: slayer.detentore, data: slayer.data, league, statistica: `King Slayer vs ${r.detentore}`, valore: r.maxDurata, numero: slayer.numero });
    });

    // Boomer: teams whose last reign ended before 1940
    const teamLastReign = new Map<string, { lastDate: string; lastNumero: number }>();
    for (const r of reigns) {
        const ex = teamLastReign.get(r.detentore);
        if (!ex || r.fineRegno > ex.lastDate) {
            teamLastReign.set(r.detentore, { lastDate: r.fineRegno, lastNumero: r.fineNumero });
        }
    }
    for (const [team, { lastDate, lastNumero }] of teamLastReign) {
        if (new Date(lastDate).getFullYear() < 1940) {
            ups(`Boomer:${team}`, { squadra: team, data: lastDate, league, statistica: 'Boomer', valore: null, numero: lastNumero });
        }
    }

    // Dynasty Builder (Class of XXXX): per decade, team with most total durata
    const decadeMap = new Map<number, Map<string, { totalDurata: number; lastData: string; lastNumero: number }>>();
    for (const r of reigns) {
        const dec = Math.floor(new Date(r.inizioRegno).getFullYear() / 10) * 10;
        if (!decadeMap.has(dec)) decadeMap.set(dec, new Map());
        const dm = decadeMap.get(dec)!;
        const ex = dm.get(r.detentore);
        dm.set(r.detentore, {
            totalDurata: (ex?.totalDurata ?? 0) + r.maxDurata,
            lastData: r.fineRegno,
            lastNumero: r.fineNumero,
        });
    }
    for (const [dec, dm] of decadeMap) {
        let best = { team: '', totalDurata: 0, lastData: '', lastNumero: 0 };
        for (const [team, d] of dm) {
            if (d.totalDurata > best.totalDurata) best = { team, ...d };
        }
        if (best.team) {
            const lm = matches.find(x => x.detentore === best.team && x.data === best.lastData);
            if (lm) ups(`Class of ${dec}`, { squadra: best.team, data: best.lastData, league, statistica: `Class of ${dec}`, valore: best.totalDurata, numero: lm.numero });
        }
    }

    return {
        squadre: [...squadreMap.values()],
        stats: [...insertStats, ...upsertStats.values()],
    };
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
            data: new Date(r.data).toISOString().split('T')[0],
            detentore: normalizeTeamName(r.detentore),
            sfidante: normalizeTeamName(r.sfidante),
        })) as Match[];

        const sr = await client.sql`SELECT * FROM squadre WHERE league = ${league}`;
        existingSquadre = sr.rows as SquadraState[];
    } finally {
        client.release();
    }

    console.log(`Loaded ${matches.length} matches, ${existingSquadre.length} teams`);

    const colorsMap = new Map(existingSquadre.map(s => [s.squadra, { primary: s.colore_primario, secondary: s.colore_secondario }]));

    console.log('Computing stats in memory...');
    const { squadre, stats } = computeStats(matches, colorsMap);
    console.log(`\nDone.`);
    console.log(`  squadre: ${squadre.length} rows`);
    console.log(`  stats:   ${stats.length} rows`);

    const snapshot = { league, capturedAt: new Date().toISOString(), matchesProcessed: matches.length, squadre, stats };
    const outPath = resolve(__dirname, 'recalc-snapshot.json');
    writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
    console.log(`Snapshot → ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
