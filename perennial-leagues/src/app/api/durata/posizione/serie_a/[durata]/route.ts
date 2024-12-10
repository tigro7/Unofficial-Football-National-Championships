'use server';

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: {params: Promise<{ durata: number }>}) {

  const durata = (await params).durata;

  if (isNaN(durata)) {
    return NextResponse.json({ error: 'Parametro durata mancante o non valido' }, { status: 400 });
  }

  try {
    const client = await db.connect();
    const rows = await client.sql`
      WITH ranked_squads AS (
        SELECT 
          squadra,
          durata,
          RANK() OVER (ORDER BY durata DESC) AS position
        FROM squadre
      )
      SELECT position
      FROM ranked_squads
      WHERE durata = ${durata}`;

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