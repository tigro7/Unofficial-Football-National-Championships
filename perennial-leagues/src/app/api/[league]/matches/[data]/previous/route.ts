'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
//import { Summary } from "@/app/lib/definitions";

export async function GET(request: Request, {params,}: {params: Promise<{ data: string, league: string }>}) {

    const {data, league = "serie_a"} = (await params);

    if (data === undefined || data === '') {
      return NextResponse.json({ error: 'Parametro data mancante o non valido' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT data FROM matches WHERE data < ${data} AND league = ${league} ORDER BY data DESC LIMIT 1`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}