'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
//import { Summary } from "@/app/lib/definitions";

export async function GET(request: Request, {params,}: {params: Promise<{ numero: number, league: string }>}) {

    const {numero, league = "serie_a"} = await params;
  
    if (numero === undefined || isNaN(numero)) {
      return NextResponse.json({ error: 'Parametro numero mancante o non valido' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT 
                                            m.*, 
                                            COALESCE(
                                                (SELECT numero 
                                                FROM matches 
                                                WHERE league = ${league} AND numero < m.numero
                                                ORDER BY numero DESC LIMIT 1), NULL
                                            ) AS prev,
                                            COALESCE(
                                                (SELECT numero 
                                                FROM matches 
                                                WHERE league = ${league} AND numero > m.numero
                                                ORDER BY numero ASC LIMIT 1), NULL
                                            ) AS next
                                        FROM matches m
                                        WHERE m.numero = ${numero} AND m.league = ${league}`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}