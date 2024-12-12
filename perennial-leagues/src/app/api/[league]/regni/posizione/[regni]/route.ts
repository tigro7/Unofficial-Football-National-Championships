'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ regni: number, league: string}>}) {

    const { regni, league = "serie_a" } = await params;
  
    if (isNaN(regni)) {
      return NextResponse.json({ error: 'Parametro regni mancante o non valido' }, { status: 400 });
    }
    
    try {
        const client = await db.connect();
        const rows =  await client.sql`WITH ranked_squads AS (
            SELECT 
                squadra,
                league,
                regni,
                RANK() OVER (ORDER BY regni DESC) AS position
            FROM squadre
            )
            SELECT position
            FROM ranked_squads
            WHERE regni = ${regni}
            AND league = ${league}`;

        if (rows.rowCount === 0) {
            client.release();
            return NextResponse.json({ error: 'Posizione non trovata' }, { status: 404 });
        }
        
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });

    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}