'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{league: string}>}) {

    const league = (await params).league || "serie_a";

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM matches WHERE league = ${league} ORDER BY data ASC`;

        const matches = rows.rows;
        client.release();

        const regni : {squadra: string, start: string, end: string }[] = [];
        let currentStart: string | null = null;

        for (const match of matches) {
            if (currentStart == null) {
                currentStart = match.data;
            }else if (currentStart) {
                regni.push({squadra: match.sfidante.toLowerCase(), start: currentStart, end: match.data });
                currentStart = null;
            }
        }

        if (currentStart) {
            regni.push({squadra: matches[matches.length - 1].detentore.toLowerCase(), start: currentStart, end: new Date().toISOString() });
        }
    
        return NextResponse.json(regni, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}