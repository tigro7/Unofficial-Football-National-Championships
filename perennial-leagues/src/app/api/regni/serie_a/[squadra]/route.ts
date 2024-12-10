'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ squadra: string }>}) {

    const squadra = (await params).squadra.toLowerCase();
  
    if (squadra == undefined || squadra == '') {
        return NextResponse.json({ error: 'Parametro squadra mancante o non valido' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM serie_a ORDER BY data ASC`;

        const matches = rows.rows;
        client.release();

        const relevantMatches = matches.filter(match =>
            match.detentore.toLowerCase() === squadra || match.sfidante.toLowerCase() === squadra
        );

        const regni : {start: string, end: string }[] = [];
        let currentStart: string | null = null;

        for (const match of relevantMatches) {
            if (match.detentore.toLowerCase() == squadra && currentStart == null) {
                currentStart = match.data;
            }else if (currentStart && match.sfidante.toLowerCase() == squadra) {
                regni.push({start: currentStart, end: match.data });
                currentStart = null;
            }
        }

        if (currentStart) {
            regni.push({start: currentStart, end: new Date().toISOString() });
        }
    
        return NextResponse.json(regni, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}