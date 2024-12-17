'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ league: string }>}) {

    const league = (await params).league || "serie_a";
    
    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM squadre WHERE league = ${league}`;

        if (rows.rowCount === 0) {
            client.release();
            return NextResponse.json({ error: 'Squadre non trovate' }, { status: 404 });
        }
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}

export async function POST(request: Request, {params,}: {params: Promise<{ league: string }>}) {

    const league = (await params).league || "serie_a";
    const body = await request.json();
    
    try {
        const client = await db.connect();
        const rows =  await client.sql`INSERT INTO squadre (squadra, regni, durata, media, colore_primario, colore_secondario, league, mb) 
                                        VALUES ('${body.squadra}', 1, ${body.durata}, ${body.durata}, '#000000', '#FFFFFF', ${league}, 'm')`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}

export async function PUT(request: Request, {params,}: {params: Promise<{ league: string }>}) {

    const league = (await params).league || "serie_a";
    const body = await request.json();
    
    try {
        const client = await db.connect();
        const rows =  await client.sql`UPDATE squadre SET regni = regni + 1, durata = durata + ${body.durata}, media = (durata + ${body.durata}) / regni, 
                                        mb = ${body.mb} WHERE league = ${league} AND squadra = ${body.squadra}`;

        if (rows.rowCount === 0) {
            client.release();
            return NextResponse.json({ error: 'Squadra non trovate' }, { status: 404 });
        }
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}