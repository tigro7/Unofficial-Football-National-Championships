'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ squadra: string, league: string, numero: number}>}) {

    const { squadra, league = "serie_a", numero} = await params
  
    if (squadra == undefined || squadra == '' || numero == undefined || isNaN(numero)) {
        return NextResponse.json({ error: 'Parametro squadra o numero mancante o non valido' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT COUNT(*) as regni FROM matches WHERE outcome='s' AND league = ${league} AND detentore = ${squadra} AND numero < ${numero}`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}