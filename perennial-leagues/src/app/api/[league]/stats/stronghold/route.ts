'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ league: string }> }) {
    const league = (await params).league || "serie_a";

    try {
        const client = await db.connect();
        const rows = await client.sql`SELECT squadra, data, statistica, valore, numero
                                      FROM stats
                                      WHERE league = ${league} AND statistica LIKE 'Stronghold Record%'
                                      ORDER BY CAST(SPLIT_PART(statistica, ' ', 3) AS INTEGER) ASC`;
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}
