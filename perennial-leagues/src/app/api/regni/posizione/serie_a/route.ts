'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function getPosizioneRegniSerieA(regni: number) {
    try {
        const client = await db.connect();
        const rows =  await client.sql`WITH ranked_squads AS (
            SELECT 
                squadra,
                regni,
                RANK() OVER (ORDER BY regni DESC) AS position
            FROM squadre
            )
            SELECT position
            FROM ranked_squads
            WHERE regni = ${regni}`;

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