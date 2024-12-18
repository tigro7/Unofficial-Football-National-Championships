'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ squadra: string, league: string}>}) {

    const {squadra, league = "serie_a"} = await params;

    if (squadra == undefined || squadra == '') {
        return NextResponse.json({ error: 'Parametro squadra mancante o non valido' }, { status: 400 });
    }
    
    try {
        const client = await db.connect();
        //const rows =  await client.sql`SELECT * FROM squadre WHERE LOWER(squadra) = ${squadra.toLowerCase()} AND league = ${league}`;
        const rows = await client.sql`SELECT s.* FROM 
                                        (SELECT *, RANK() OVER (ORDER BY regni DESC) AS position_regni, RANK() OVER (ORDER BY durata DESC) AS position_durata, RANK() OVER (ORDER BY media DESC) AS position_media FROM squadre) s 
                                      WHERE LOWER(squadra) = ${squadra.toLowerCase()} AND league = ${league}`;

        if (rows.rowCount === 0) {
            client.release();
            return NextResponse.json({ error: 'Squadra non trovata' }, { status: 404 });
        }
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}