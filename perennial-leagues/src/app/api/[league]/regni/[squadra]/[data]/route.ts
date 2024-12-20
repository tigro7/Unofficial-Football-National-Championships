'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ squadra: string, league: string, data: string}>}) {

    const { squadra, league = "serie_a", data} = await params
  
    if (squadra == undefined || squadra == '' || data == undefined || data == '') {
        return NextResponse.json({ error: 'Parametro squadra o data mancante o non valido' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT COUNT(*) as regni FROM matches WHERE outcome='s' AND league = ${league} AND detentore = ${squadra} AND data < ${data}`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}