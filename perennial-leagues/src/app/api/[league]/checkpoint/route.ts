'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ league: string }> }) {

    const league = (await params).league || "serie_a";

    try {
        const client = await db.connect();

        try {
            const squadreResult = await client.sql`
                SELECT * FROM squadre WHERE league = ${league} ORDER BY regni DESC
            `;
            const statsResult = await client.sql`
                SELECT * FROM stats WHERE league = ${league} ORDER BY squadra, statistica, data
            `;

            return NextResponse.json({
                league,
                capturedAt: new Date().toISOString(),
                squadre: squadreResult.rows,
                stats: statsResult.rows,
            }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Errore durante il checkpoint:', error);
        return NextResponse.json({ error: 'Errore durante il checkpoint' }, { status: 500 });
    }
}
