export const maxDuration = 300;

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import updateStats from "@/app/utils/statsCalc";
import { VercelPoolClient } from "@vercel/postgres";

const CHECKPOINT_STAT = '_recalc_checkpoint';

async function saveCheckpoint(client: VercelPoolClient, league: string, numero: number) {
    const existing = await client.sql`
        SELECT 1 FROM stats WHERE league = ${league} AND statistica = ${CHECKPOINT_STAT}
    `;
    if (existing.rowCount && existing.rowCount > 0) {
        await client.sql`
            UPDATE stats SET numero = ${numero}, data = NOW()
            WHERE league = ${league} AND statistica = ${CHECKPOINT_STAT}
        `;
    } else {
        await client.sql`
            INSERT INTO stats (squadra, data, league, statistica, numero)
            VALUES ('_system', NOW(), ${league}, ${CHECKPOINT_STAT}, ${numero})
        `;
    }
}

async function processMatches(
    client: VercelPoolClient,
    league: string,
    matches: Record<string, unknown>[],
    prevMatch: Record<string, unknown> | null
) {
    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const prev = i > 0 ? matches[i - 1] : prevMatch;
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
}

export async function POST(request: Request, { params }: { params: Promise<{ league: string }> }) {

    const league = (await params).league || "serie_a";

    const session = await getServerSession();
    const authHeader = request.headers.get('Authorization');
    const automationSecret = process.env.AUTOMATION_SECRET;
    const isAutomated = automationSecret && authHeader === `Bearer ${automationSecret}`;

    if (!session && !isAutomated) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const mode: 'hard' | 'soft' = body?.mode === 'soft' ? 'soft' : 'hard';

    try {
        const client = await db.connect();

        try {
            if (mode === 'soft') {
                // Read checkpoint
                const checkpointRow = await client.sql`
                    SELECT numero FROM stats
                    WHERE league = ${league} AND statistica = ${CHECKPOINT_STAT}
                `;

                if (!checkpointRow.rowCount || checkpointRow.rowCount === 0) {
                    return NextResponse.json(
                        { error: 'No checkpoint found — run a hard recalc first' },
                        { status: 400 }
                    );
                }

                const checkpointNumero: number = checkpointRow.rows[0].numero;

                // Fetch the match at the checkpoint to use as prev for the first new match
                const prevMatchResult = await client.sql`
                    SELECT * FROM matches
                    WHERE league = ${league} AND numero = ${checkpointNumero}
                `;
                const prevMatch = prevMatchResult.rows[0] ?? null;

                // Fetch only new matches after the checkpoint
                const newMatchesResult = await client.sql`
                    SELECT * FROM matches
                    WHERE league = ${league} AND outcome != 'n' AND numero > ${checkpointNumero}
                    ORDER BY numero ASC
                `;
                const newMatches = newMatchesResult.rows;

                if (newMatches.length === 0) {
                    return NextResponse.json(
                        { ok: true, league, mode, matchesProcessed: 0, checkpoint: checkpointNumero },
                        { status: 200 }
                    );
                }

                await processMatches(client, league, newMatches, prevMatch);

                const lastNumero = newMatches[newMatches.length - 1].numero as number;
                await saveCheckpoint(client, league, lastNumero);

                return NextResponse.json(
                    { ok: true, league, mode, matchesProcessed: newMatches.length, checkpoint: lastNumero },
                    { status: 200 }
                );

            } else {
                // Hard recalc: full reset and replay
                const matchesResult = await client.sql`
                    SELECT * FROM matches
                    WHERE league = ${league} AND outcome != 'n'
                    ORDER BY numero ASC
                `;
                const matches = matchesResult.rows;

                await client.sql`
                    UPDATE squadre
                    SET regni = 0, durata = 0, media = 0, difese = 0, media_difese = 0, sfide = 0
                    WHERE league = ${league}
                `;

                await client.sql`DELETE FROM stats WHERE league = ${league}`;

                await processMatches(client, league, matches, null);

                const lastNumero = matches.length > 0 ? matches[matches.length - 1].numero as number : 0;
                await saveCheckpoint(client, league, lastNumero);

                return NextResponse.json(
                    { ok: true, league, mode, matchesProcessed: matches.length, checkpoint: lastNumero },
                    { status: 200 }
                );
            }
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Errore durante il recalc:', error);
        return NextResponse.json({ error: 'Errore durante il recalc' }, { status: 500 });
    }
}
