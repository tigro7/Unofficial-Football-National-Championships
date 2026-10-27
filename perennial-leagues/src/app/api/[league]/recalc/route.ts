'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import updateStats from "@/app/utils/statsCalc";

export async function POST(request: Request, { params }: { params: Promise<{ league: string }> }) {

    const league = (await params).league || "serie_a";

    const session = await getServerSession();
    const authHeader = request.headers.get('Authorization');
    const automationSecret = process.env.AUTOMATION_SECRET;
    const isAutomated = automationSecret && authHeader === `Bearer ${automationSecret}`;

    if (!session && !isAutomated) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    try {
        const client = await db.connect();

        try {
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

            for (let i = 0; i < matches.length; i++) {
                const m = matches[i];
                const prev = i > 0 ? matches[i - 1] : null;
                const previousDuration = prev?.durata ?? 0;
                const previousDate = prev?.data ?? null;
                const updatedPreviousDuration = previousDuration + (
                    new Date(m.data).getDate() - (previousDate ? new Date(previousDate).getDate() : 0)
                );
                const durata = m.outcome !== 's' ? updatedPreviousDuration : 0;

                await updateStats(
                    client, league,
                    m.home, m.away,
                    m.detentore, m.sfidante,
                    m.risultato, m.outcome,
                    previousDuration, updatedPreviousDuration, durata,
                    m.data, m.numero
                );
            }

            return NextResponse.json({ ok: true, league, matchesProcessed: matches.length }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Errore durante il recalc:', error);
        return NextResponse.json({ error: 'Errore durante il recalc' }, { status: 500 });
    }
}
