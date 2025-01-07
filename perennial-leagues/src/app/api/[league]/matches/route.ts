'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
//import { Summary } from "@/app/lib/definitions";
import { getServerSession } from "next-auth";
import updateStats from "@/app/utils/statsCalc";

export async function GET(request: Request, {params,}: {params: Promise<{league: string}>}) {

    const league = (await params).league || "serie_a";

    try {
        const client = await db.connect();
        const rows =  await client.sql`SELECT * FROM matches WHERE league = ${league} ORDER BY numero DESC`;
    
        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}

export async function POST(request: Request, {params,}: {params: Promise<{league: string}>}) {

    const league = (await params).league || "serie_a";

    // Verifica autenticazione
    const session = await getServerSession();
    console.info('session:', session);
    if (!session) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { home, away, detentore, risultato, note, data, outcome } = await request.json();

    const detentoreName = detentore == "home" ? home : away;
    const sfidanteName = detentore == "home" ? away : home;
    const noteValue = note || league.replace(/_/g, " ");

    try {
        const client = await db.connect();

        //per controllare se si tratta di update o insert, controlliamo se esiste già un match con le stesse squadre e outcome = n

        //salviamoci la durata del match precedente e il tipo di operazione da effettuare.
        const existingMatch = await client.sql`SELECT * FROM matches WHERE league = ${league} AND home = ${home} AND away = ${away} AND outcome = 'n' AND data = ${data}`;
        console.info('existingMatch', existingMatch?.rowCount);
        const operationType = existingMatch?.rowCount && existingMatch?.rowCount > 0 ? "update" : "insert";
        const previousMatch = await client.sql`SELECT * FROM matches WHERE league = ${league} AND outcome != 'n' AND data < ${data} ORDER BY data DESC LIMIT 1`;
        console.info(operationType, previousMatch?.rowCount)
        const previousDuration = previousMatch?.rowCount && previousMatch?.rowCount > 0 ? previousMatch.rows[0].durata : 0;
        const previousDate = previousMatch?.rowCount && previousMatch?.rowCount > 0 ? previousMatch.rows[0].data : null;
        const numero = existingMatch?.rowCount && existingMatch?.rowCount > 0 ? existingMatch.rows[0].numero : previousMatch?.rowCount && previousMatch?.rowCount > 0 ? previousMatch.rows[0].numero + 1 : 1;

        //la durata dell'ultimo match è uguale alla somma delle durate dei match precedenti, quando inseriamo una nuova riga va aggiornata aggiungendo la differenza tra la data della nuova riga e la data del match precedente
        const updatedPreviousDuration = previousDuration + (new Date(data).getDate() - (previousDate ? new Date(previousDate).getDate() : 0));

        //in caso di insert dobbiamo considerare tutti i 4 possibili outcome: v, n, d, s
        //se outcome è n, la partita non si è ancora giocata, quindi inseriamo tutti i dati passati, il risultato sarà null e la durata sarà 0
        //se outcome è v o d la partita ha visto il detentore mantenere il regno, quindi la durata del match precedente sarà uguale alla durata precedente + la differenza tra le date
        //del match attuale e del match precedente (la stessa durata sarà impostato al match attuale)
        //se outcome è s la partita ha visto il detentore perdere il regno, quindi la durata del match precedente sarà uguale alla durata precedente + la differenza tra le date
        //mentre quella del matcha attuale sarà 0

        let rows = null;
        let durata = 0;
        if (outcome !== "s") {
            durata += updatedPreviousDuration;
        }

        if (operationType === "update") {
            console.info('update');
            rows = await client.sql`UPDATE matches SET durata = ${durata}, outcome = ${outcome}, risultato = ${risultato}, note = ${noteValue} 
                                    WHERE league = ${league} AND home = ${home} AND away = ${away} AND data = ${data} AND numero = ${numero} AND outcome = 'n'`;
        } else {
            console.info('insert');
            if (outcome === "n") {
                durata = 0;
            }
            rows = await client.sql`INSERT INTO matches (detentore, sfidante, risultato, note, data, durata, league, home, away, outcome, numero) 
                                    VALUES (${detentoreName}, ${sfidanteName}, ${risultato}, ${noteValue}, ${data}, ${durata}, ${league}, ${home}, ${away}, ${outcome}, ${numero})`;
        }
        console.info(rows.rowCount);

        //update stats

        //aggiorna la durata del match precedente, aggiungendo la differenza tra la data del match attuale e la data del match precedente

        if (operationType === "update" && outcome !== "n") {
            console.info('update previous duration');
            await client.sql`UPDATE matches SET durata = ${updatedPreviousDuration} FROM (
	                            SELECT * FROM matches WHERE league = ${league} AND outcome != 'n' AND numero < ${numero} ORDER BY numero DESC LIMIT 1
                            ) p
                            WHERE matches.league = p.league AND matches.numero = p.numero`;
        }

        console.info(league, home, away, detentoreName, sfidanteName, risultato, outcome, previousDuration, updatedPreviousDuration, durata, data, numero);
        updateStats(client, league, home, away, detentoreName, sfidanteName, risultato, outcome, previousDuration, updatedPreviousDuration, durata, data, numero);

        client.release();
        return NextResponse.json(rows.rows, { status: 200 });
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
        return NextResponse.json({ error: 'Errore durante l\'esecuzione della query' }, { status: 500 });
    }
}