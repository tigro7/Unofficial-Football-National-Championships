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
        let currentDetentore: string | null = null;

        for (const match of matches) {
            // Inizializzazione del primo regno
            if (currentDetentore == null && currentStart == null) {
                currentDetentore = match.detentore;
                currentStart = match.data;
            }else if (currentDetentore != null && match.outcome === "s") {
                if (currentStart) {
                    regni.push({
                        squadra: currentDetentore.toLowerCase(),
                        start: currentStart,
                        end: match.data,
                    });
                }
                // Aggiorna il detentore e il nuovo inizio del regno
                currentDetentore = match.detentore;
                currentStart = match.data;
            }
        }
        
        // Aggiungi l'ultimo regno se esiste
        if (currentStart && currentDetentore) {
            regni.push({
                squadra: currentDetentore.toLowerCase(),
                start: currentStart,
                end: new Date().toISOString(),
            });
        }
    
        return NextResponse.json(regni, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}