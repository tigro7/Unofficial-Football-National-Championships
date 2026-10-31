'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ league: string }> }) {
    const league = (await params).league || "serie_a";

    try {
        const client = await db.connect();
        const rows = await client.sql`SELECT squadra, data, statistica, valore, numero
                                      FROM stats
                                      WHERE league = ${league} AND statistica LIKE 'Decade Dominator%'
                                      ORDER BY statistica DESC`;
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching decade dominator stats:', error);
        return NextResponse.json({ error: 'Error fetching decade dominator stats' }, { status: 500 });
    }
}
