'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
//import { Summary } from "@/app/lib/definitions";

export async function GET(request: Request, {params,}: {params: Promise<{league: string}>}) {

    const league = (await params).league || "serie_a";

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT detentore, MAX(DATA) AS data FROM matches WHERE league = ${league} GROUP BY detentore`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}