'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function PUT(request: Request, {params,}: {params: Promise<{ squadra: string, league: string, primario: string, secondario: string}>}) {

    const {squadra, league = "serie_a", primario = "000000", secondario = "FFFFFF"} = await params;
    console.info(`PUT /api/${league}/squadre/${squadra}/${primario}/${secondario}`);

    if (squadra == undefined || squadra == '') {
        return NextResponse.json({ error: 'Parametro squadra mancante o non valido' }, { status: 400 });
    }
    
    try {
        const client = await db.connect();
        const rows =  await client.sql`UPDATE squadre SET colore_primario = ${primario}, colore_secondario = ${secondario} WHERE LOWER(squadra) = ${squadra.toLowerCase()} AND league = ${league}`;

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