'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET() {

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM blog ORDER BY id DESC`;

        if (rows.rowCount === 0) {
            client.release();
            return NextResponse.json({ error: 'Post non trovati' }, { status: 404 });
        }
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}