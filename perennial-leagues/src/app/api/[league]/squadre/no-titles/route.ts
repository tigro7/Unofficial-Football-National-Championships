'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ league: string }> }) {
    const league = (await params).league || "serie_a";

    try {
        const client = await db.connect();
        const rows = await client.sql`SELECT squadra, sfide, colore_primario, colore_secondario
                                      FROM squadre
                                      WHERE league = ${league} AND regni = 0 AND sfide > 0
                                      ORDER BY sfide DESC`;
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}
