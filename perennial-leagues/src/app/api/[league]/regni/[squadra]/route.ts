'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ squadra: string, league: string}>}) {

    const { squadra, league = "serie_a"} = await params
  
    if (squadra == undefined || squadra == '') {
        return NextResponse.json({ error: 'Parametro squadra mancante o non valido' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM matches WHERE league = ${league} ORDER BY data ASC`;

        const matches = rows.rows;
        client.release();

        const relevantMatches = matches.filter(match =>
            match.detentore.toLowerCase() === squadra.toLowerCase() || match.sfidante.toLowerCase() === squadra.toLowerCase()
        );

        const regni : {start: string, end: string, matchStart: number, matchEnd: number}[] = [];
        let currentStart: string | null = null;
        let currentMatchStart: number = 0;

        for (const match of relevantMatches) {
            if (match.detentore.toLowerCase() == squadra.toLowerCase() && currentStart == null) {
                currentStart = match.data;
                currentMatchStart = match.numero;
            }else if (currentStart && match.sfidante.toLowerCase() == squadra.toLowerCase()) {
                regni.push({start: currentStart, end: match.data, matchStart: currentMatchStart, matchEnd: match.numero});
                currentStart = null;
            }
        }

        if (currentStart) {
            regni.push({start: currentStart, end: new Date().toISOString(), matchStart: currentMatchStart, matchEnd: matches[matches.length - 1].numero});
        }
    
        return NextResponse.json(regni, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}