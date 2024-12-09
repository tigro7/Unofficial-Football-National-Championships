'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function getStartDateSerieA() {

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT data FROM serie_a ORDER BY data ASC LIMIT 1`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}