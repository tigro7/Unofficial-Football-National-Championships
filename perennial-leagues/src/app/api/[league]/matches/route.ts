'use server'

import { db } from "@vercel/postgres";
import { NextResponse } from 'next/server';
//import { Summary } from "@/app/lib/definitions";
import { getServerSession } from "next-auth";
import updateStats from "@/app/utils/statsCalc";
import { resolveTeamName } from "@/app/utils/resolveTeamName";

// ---- validation ----

const VALID_OUTCOMES = new Set(['n', 'v', 's', 'd']);
const SCORE_RE = /^\d+-\d+$/;

function validateMatchPayload(body: Record<string, unknown>): { field: string; error: string } | null {
    const { home, away, detentore, risultato, data, outcome } = body;

    if (!home || typeof home !== 'string' || !home.trim())
        return { field: 'home', error: 'home team name is required' };
    if (!away || typeof away !== 'string' || !away.trim())
        return { field: 'away', error: 'away team name is required' };
    if (detentore !== 'home' && detentore !== 'away')
        return { field: 'detentore', error: 'detentore must be "home" or "away"' };
    if (!outcome || !VALID_OUTCOMES.has(outcome as string))
        return { field: 'outcome', error: 'outcome must be one of: n, v, s, d' };

    if (!data || typeof data !== 'string')
        return { field: 'data', error: 'data is required' };
    const parsed = new Date(data);
    if (isNaN(parsed.getTime()))
        return { field: 'data', error: 'data is not a valid date' };
    if (parsed > new Date())
        return { field: 'data', error: 'data must not be in the future' };

    if (outcome !== 'n') {
        if (!risultato || typeof risultato !== 'string' || !SCORE_RE.test(risultato))
            return { field: 'risultato', error: 'risultato must be in "X-Y" format with non-negative integers' };
        const [a, b] = risultato.split('-').map(Number);
        if (a < 0 || b < 0)
            return { field: 'risultato', error: 'score values must be non-negative' };
    }

    return null;
}

function getClientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        request.headers.get('x-real-ip') ??
        'unknown'
    );
}

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

    // Accept NextAuth session OR a pre-shared bearer token for CI automation
    const session = await getServerSession();
    const authHeader = request.headers.get('Authorization');
    const automationSecret = process.env.AUTOMATION_SECRET;
    const isAutomated = automationSecret && authHeader === `Bearer ${automationSecret}`;

    console.info('session:', session, 'isAutomated:', isAutomated);
    if (!session && !isAutomated) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const ip = getClientIp(request);

    const validationError = validateMatchPayload(body);
    if (validationError) {
        console.warn('[match-validation] rejected', { ip, field: validationError.field, home: body.home, away: body.away, data: body.data });
        return NextResponse.json({ error: validationError.error, field: validationError.field }, { status: 400 });
    }

    const { home, away, detentore, risultato, note, data, outcome } = body as Record<string, string>;
    const rawDetentoreName = detentore === "home" ? home : away;
    const rawSfidanteName = detentore === "home" ? away : home;
    const noteValue = note || league.replace(/_/g, " ");

    try {
        const client = await db.connect();

        // Normalize team names: namesMap first, then DB aliases fallback
        const detentoreName = await resolveTeamName(rawDetentoreName, league, client);
        const sfidanteName = await resolveTeamName(rawSfidanteName, league, client);

        // Warn if a resolved name is not yet in squadre (new team first appearance)
        const knownTeams = await client.sql`SELECT squadra FROM squadre WHERE league = ${league}`;
        const knownSet = new Set(knownTeams.rows.map((r) => r.squadra as string));
        for (const name of [detentoreName, sfidanteName]) {
            if (!knownSet.has(name)) {
                console.warn('[match-validation] unknown team (new or unresolved)', { ip, team: name, raw: rawDetentoreName === name ? rawDetentoreName : rawSfidanteName, league });
            }
        }

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
            rows = await client.sql`UPDATE matches SET durata = ${durata}, outcome = ${outcome}, risultato = ${risultato}, note = ${noteValue}, detentore = ${detentoreName}, sfidante = ${sfidanteName}
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