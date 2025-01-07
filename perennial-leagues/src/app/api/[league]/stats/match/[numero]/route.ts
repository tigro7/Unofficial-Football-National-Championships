'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ league: string, numero: number }>}) {


    const {numero, league = "serie_a"} = await params;
  
    if (numero === undefined || isNaN(numero)) {
      return NextResponse.json({ error: 'Parametro numero mancante o non valido' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM stats WHERE numero = ${numero} AND league = ${league}`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
    
}