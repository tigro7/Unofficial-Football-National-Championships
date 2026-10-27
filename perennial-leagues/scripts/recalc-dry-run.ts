/**
 * Dry-run recalc: replays all matches through updateStats inside a transaction,
 * snapshots the resulting squadre + stats, then ROLLS BACK.
 * DB is never modified. Output: scripts/recalc-snapshot.json
 *
 * Usage: npm run recalc:dry-run
 */

import { db } from '@vercel/postgres';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import updateStats from '../src/app/utils/statsCalc';

const league = process.argv[2] || 'serie_a';

async function main() {
    console.log(`Dry-run recalc for league: ${league}`);

    const client = await db.connect();

    try {
        await client.query('BEGIN');
        console.log('Transaction started');

        const matchesResult = await client.sql`
            SELECT * FROM matches
            WHERE league = ${league} AND outcome != 'n'
            ORDER BY numero ASC
        `;
        const matches = matchesResult.rows;
        console.log(`Matches to replay: ${matches.length}`);

        await client.sql`
            UPDATE squadre
            SET regni = 0, durata = 0, media = 0, difese = 0, media_difese = 0, sfide = 0
            WHERE league = ${league}
        `;
        await client.sql`DELETE FROM stats WHERE league = ${league}`;
        console.log('Slate wiped');

        for (let i = 0; i < matches.length; i++) {
            const m = matches[i];
            const prev = i > 0 ? matches[i - 1] : null;
            const previousDuration = prev?.durata ?? 0;
            const previousDate = prev?.data ? new Date(prev.data).toISOString().split('T')[0] : null;
            const dataStr = new Date(m.data).toISOString().split('T')[0];
            const updatedPreviousDuration = previousDuration + (
                new Date(dataStr).getDate() - (previousDate ? new Date(previousDate).getDate() : 0)
            );
            const durata = m.outcome !== 's' ? updatedPreviousDuration : 0;

            await updateStats(
                client, league,
                m.home, m.away,
                m.detentore, m.sfidante,
                m.risultato, m.outcome,
                previousDuration, updatedPreviousDuration, durata,
                dataStr, m.numero
            );

            if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${matches.length} matches processed`);
        }

        console.log('All matches replayed — snapshotting...');

        const squadreResult = await client.sql`SELECT * FROM squadre WHERE league = ${league} ORDER BY regni DESC`;
        const statsResult = await client.sql`SELECT * FROM stats WHERE league = ${league} ORDER BY squadra, statistica, data`;

        const snapshot = {
            league,
            capturedAt: new Date().toISOString(),
            matchesProcessed: matches.length,
            squadre: squadreResult.rows,
            stats: statsResult.rows,
        };

        await client.query('ROLLBACK');
        console.log('Transaction rolled back — DB unchanged');

        const outPath = resolve(__dirname, 'recalc-snapshot.json');
        writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
        console.log(`Snapshot written to ${outPath}`);
        console.log(`  squadre rows: ${snapshot.squadre.length}`);
        console.log(`  stats rows:   ${snapshot.stats.length}`);
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('Error — rolled back:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

main();
