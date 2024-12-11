'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
//import { Summary } from "@/app/lib/definitions";

export async function GET() {
    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT data FROM serie_a ORDER BY data DESC LIMIT 1`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}