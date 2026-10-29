'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";

export async function GET(request: Request, {params,}: {params: Promise<{ squadra: string, league: string}>}) {

    const {squadra, league = "serie_a"} = await params;

    if (squadra == undefined || squadra == '') {
        return NextResponse.json({ error: 'Parametro squadra mancante o non valido' }, { status: 400 });
    }
    
    try {
        const client = await db.connect();
        //const rows =  await client.sql`SELECT * FROM squadre WHERE LOWER(squadra) = ${squadra.toLowerCase()} AND league = ${league}`;
        const rows = await client.sql`SELECT s.* FROM 
                                        (SELECT *, 
                                            RANK() OVER (ORDER BY regni DESC) AS position_regni, 
                                            RANK() OVER (ORDER BY durata DESC) AS position_durata, 
                                            RANK() OVER (ORDER BY media DESC) AS position_media,
                                            RANK() OVER (ORDER BY difese DESC) AS position_difese,
                                            RANK() OVER (ORDER BY media_difese DESC) AS position_media_difese,
                                            RANK() OVER (ORDER BY sfide DESC) AS position_sfide
                                        FROM squadre
                                        WHERE league = ${league}) s 
                                      WHERE LOWER(squadra) = ${squadra.toLowerCase()} AND league = ${league}`;

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

export async function PUT(request: Request, {params,}: {params: Promise<{ squadra: string, league: string}>}) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const {squadra, league = "serie_a"} = await params;
    const { aliases } = await request.json() as { aliases: string[] };

    if (!Array.isArray(aliases)) {
        return NextResponse.json({ error: 'aliases must be an array of strings' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const aliasesJson = JSON.stringify(aliases);
        await client.sql`UPDATE squadre SET aliases = ${aliasesJson} WHERE LOWER(squadra) = ${squadra.toLowerCase()} AND league = ${league}`;
        client.release();
        return NextResponse.json({ squadra, aliases }, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}