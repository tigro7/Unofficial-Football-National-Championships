'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{league: string, squadra:string}>}) {

    const league = (await params).league || "serie_a";
    const squadra = (await params).squadra;

    if (!squadra || squadra === "undefined") {
        return NextResponse.json({ error: 'Squadra non specificata' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM matches WHERE league = ${league} AND (detentore = ${squadra} OR sfidante = ${squadra}) AND outcome <> 'n' ORDER BY numero DESC LIMIT 5`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}