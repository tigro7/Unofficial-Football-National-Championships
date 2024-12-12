'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ media: number, league: string}>}) {

    const {media, league = "serie_a"} = await params;
  
    if (isNaN(media)) {
      return NextResponse.json({ error: 'Parametro media mancante o non valido' }, { status: 400 });
    }
    
    try {
        const client = await db.connect();
        const rows =  await client.sql`WITH ranked_squads AS (
            SELECT 
                squadra,
                league,
                media,
                RANK() OVER (ORDER BY media DESC) AS position
            FROM squadre
            )
            SELECT position
            FROM ranked_squads
            WHERE media = ${media}
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