'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
//import { Summary } from "@/app/lib/definitions";

export async function GET(request: Request, {params,}: {params: Promise<{ detentore: string, sfidante: string, data: string, league: string}>}) {

    const { detentore, sfidante, data, league = "serie_a"} = await params;
  
    if (detentore === undefined || detentore === '' || sfidante === undefined || sfidante === '') {
      return NextResponse.json({ error: 'Parametri mancanti o non validi' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const parametricQuery = `SELECT 
                                    (SELECT COUNT(*) 
                                    FROM matches 
                                    WHERE (outcome = 's' OR outcome = 'v') 
                                    AND LOWER(detentore) = $1
                                    AND LOWER(sfidante) = $2
                                    AND league = $3
                                    ${data ? `AND data < $4` : ''}) AS wond,
                                    
                                    (SELECT COUNT(*) 
                                    FROM matches 
                                    WHERE outcome = 'd' 
                                    AND ((LOWER(detentore) = $1 AND LOWER(sfidante) = $2) OR (LOWER(detentore) = $2 AND LOWER(sfidante) = $1))
                                    AND league = $3 
                                    ${data ? `AND data < $4` : ''}) AS draw,
                                    
                                    (SELECT COUNT(*) 
                                    FROM matches 
                                    WHERE (outcome = 's' OR outcome = 'v') 
                                    AND LOWER(detentore) = $2
                                    AND LOWER(sfidante) = $1 
                                    AND league = $3 
                                    ${data ? `AND data < $4` : ''}) AS wons`;
        //const parametricQuery = `SELECT COUNT(*) as H2H FROM matches WHERE (outcome = 's' OR outcome = 'v') AND LOWER(detentore) = $1 AND LOWER(sfidante) = $2 AND league = $3 ${data ? `AND data < $4` : ''}`;
        const values = data ? [detentore.toLowerCase(), sfidante.toLowerCase(), league, data] : [detentore.toLowerCase(), sfidante.toLowerCase(), league];
        const rows = await client.query(parametricQuery, values);

        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}