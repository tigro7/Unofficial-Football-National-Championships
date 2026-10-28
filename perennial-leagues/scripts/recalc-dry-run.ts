/**
 * Recalc: replays all matches through updateStats in batches of BATCH_SIZE,
 * committing after each batch to avoid connection timeouts.
 * Snapshots the final squadre + stats to scripts/recalc-snapshot.json.
 *
 * Usage: npm run recalc:dry-run [league]
 */

import { db } from '@vercel/postgres';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import updateStats from '../src/app/utils/statsCalc';

const league = process.argv[2] || 'serie_a';
const BATCH_SIZE = 100;

async function main() {
    console.log(`Recalc for league: ${league} (batch size: ${BATCH_SIZE})`);

    // Fetch all matches upfront with a fresh connection
    const fetchClient = await db.connect();
    let matches: Record<string, unknown>[];
    try {
        const result = await fetchClient.sql`
            SELECT * FROM matches
            WHERE league = ${league} AND outcome != 'n'
            ORDER BY numero ASC
        `;
        matches = result.rows;
    } finally {
        fetchClient.release();
    }
    console.log(`Matches to replay: ${matches.length}`);

    // Wipe computed state
    const wipeClient = await db.connect();
    try {
        await wipeClient.sql`
            UPDATE squadre
            SET regni = 0, durata = 0, media = 0, difese = 0, media_difese = 0, sfide = 0
            WHERE league = ${league}
        `;
        await wipeClient.sql`DELETE FROM stats WHERE league = ${league}`;
        console.log('Slate wiped');
    } finally {
        wipeClient.release();
    }

    // Replay in batches, reconnecting each batch
    for (let batchStart = 0; batchStart < matches.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, matches.length);
        const client = await db.connect();
        try {
            for (let i = batchStart; i < batchEnd; i++) {
                const m = matches[i];
                const prev = i > 0 ? matches[i - 1] : null;
                const previousDuration = (prev?.durata as number) ?? 0;
                const previousDate = prev?.data ? new Date(prev.data as string).toISOString().split('T')[0] : null;
                const dataStr = new Date(m.data as string).toISOString().split('T')[0];
                const updatedPreviousDuration = previousDuration + (
                    new Date(dataStr).getDate() - (previousDate ? new Date(previousDate).getDate() : 0)
                );
                const durata = m.outcome !== 's' ? updatedPreviousDuration : 0;

                await updateStats(
                    client, league,
                    m.home as string, m.away as string,
                    m.detentore as string, m.sfidante as string,
                    m.risultato as string, m.outcome as string,
                    previousDuration, updatedPreviousDuration, durata,
                    dataStr, m.numero as number
                );
            }
            console.log(`  ${batchEnd}/${matches.length} matches processed`);
        } finally {
            client.release();
        }
    }

    // Snapshot final state
    const snapClient = await db.connect();
    try {
        const squadreResult = await snapClient.sql`SELECT * FROM squadre WHERE league = ${league} ORDER BY regni DESC`;
        const statsResult = await snapClient.sql`SELECT * FROM stats WHERE league = ${league} ORDER BY squadra, statistica, data`;

        const snapshot = {
            league,
            capturedAt: new Date().toISOString(),
            matchesProcessed: matches.length,
            squadre: squadreResult.rows,
            stats: statsResult.rows,
        };

        const outPath = resolve(__dirname, 'recalc-snapshot.json');
        writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
        console.log(`\nSnapshot written to ${outPath}`);
        console.log(`  squadre rows: ${snapshot.squadre.length}`);
        console.log(`  stats rows:   ${snapshot.stats.length}`);
    } finally {
        snapClient.release();
    }
}

main().catch(err => { console.error(err); process.exit(1); });
