'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ lega: string }>}) {

    const lega = (await params).lega.toLowerCase();
  
    if (lega == undefined || lega == '') {
        return NextResponse.json({ error: 'Parametro lega mancante o non valido' }, { status: 400 });
    }
    
    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM squadre WHERE LOWER(competizione) = ${lega}`;

        if (rows.rowCount === 0) {
            client.release();
            return NextResponse.json({ error: 'Squadre non trovate' }, { status: 404 });
        }
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}