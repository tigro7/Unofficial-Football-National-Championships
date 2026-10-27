/**
 * Apply a recalc snapshot to the DB.
 * Reads scripts/recalc-snapshot.json and bulk-upserts squadre + stats.
 * Colors in squadre are preserved (never overwritten).
 *
 * Usage: npm run recalc:apply
 */

import { db } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
    const snapshotPath = resolve(__dirname, 'recalc-snapshot.json');
    const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));
    const { league, squadre, stats, matchesProcessed } = snapshot;

    console.log(`Applying snapshot for league: ${league}`);
    console.log(`  matches processed: ${matchesProcessed}`);
    console.log(`  squadre rows: ${squadre.length}`);
    console.log(`  stats rows:   ${stats.length}`);
    console.log('');

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        for (const s of squadre) {
            await client.sql`
                UPDATE squadre
                SET regni        = ${s.regni},
                    durata       = ${s.durata},
                    media        = ${s.media},
                    difese       = ${s.difese},
                    media_difese = ${s.media_difese},
                    sfide        = ${s.sfide}
                WHERE squadra = ${s.squadra} AND league = ${league}
            `;
        }
        console.log(`squadre updated`);

        await client.sql`DELETE FROM stats WHERE league = ${league}`;

        for (const st of stats) {
            await client.sql`
                INSERT INTO stats (squadra, data, league, statistica, valore, numero)
                VALUES (${st.squadra}, ${st.data}, ${st.league}, ${st.statistica}, ${st.valore}, ${st.numero})
            `;
        }
        console.log(`stats re-inserted`);

        await client.query('COMMIT');
        console.log('Done — changes committed.');
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('Error — rolled back:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

main();
