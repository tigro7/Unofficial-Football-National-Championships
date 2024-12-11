'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
//import { Summary } from "@/app/lib/definitions";

export async function GET(request: Request, {params,}: {params: Promise<{ detentore: string, sfidante: string, data: string}>}) {

    const { detentore, sfidante, data } = await params;
  
    if (detentore === undefined || detentore === '' || sfidante === undefined || sfidante === '') {
      return NextResponse.json({ error: 'Parametri mancanti o non validi' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const parametricQuery = `SELECT COUNT(*) as H2H FROM serie_a WHERE LOWER(detentore) = $1 AND LOWER(sfidante) = $2 ${data ? `AND data < $3` : ''}`;
        const values = data ? [detentore.toLowerCase(), sfidante.toLowerCase(), data] : [detentore.toLowerCase(), sfidante.toLowerCase()];
        const rows = await client.query(parametricQuery, values);

        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}