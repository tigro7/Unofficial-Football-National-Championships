'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ league: string }> }) {
    const league = (await params).league || "serie_a";

    try {
        const client = await db.connect();
        const rows = await client.sql`SELECT squadra, data, statistica, valore, numero
                                      FROM stats
                                      WHERE league = ${league} AND statistica LIKE 'Consolation Prize%'
                                      ORDER BY CAST(SPLIT_PART(statistica, ' ', 3) AS INTEGER) ASC`;
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching consolation prize stats:', error);
        return NextResponse.json({ error: 'Error fetching consolation prize stats' }, { status: 500 });
    }
}
