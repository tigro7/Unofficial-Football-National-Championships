import { VercelPoolClient } from "@vercel/postgres";

const updateStats = async (
    client: VercelPoolClient, league: string, home: string, away: string, detentoreName: string, sfidanteName: string, risultato: string, outcome: string, 
    previousDuration: number, updatedPreviousDuration: number, durata: number, data: string, numero: number
) => {

    //in caso outcome sia uguale a 'n' non c'è bisogno di aggiornare le stats
    if (outcome === "n") {
        return;
    }

    //controllare se esiste la squadra, altrimenti inserirla, in questo caso impostare mb a m
    const teamFromDB = await client.sql`SELECT * FROM squadre WHERE squadra = ${detentoreName} AND league = ${league}`;

    if (teamFromDB && teamFromDB.rowCount === 0) {
        await client.sql`INSERT INTO squadre (squadra, regni, durata, media, colore_primario, colore_secondario, league, mb) 
                         VALUES (${detentoreName}, 1, 0, 0, '#000000', '#FFFFFF', ${league}, 'm')`;
    } else {
        const regni = outcome == 's' ? teamFromDB?.rows[0]?.regni + 1 : teamFromDB?.rows[0]?.regni;
        const reignDuration = outcome == 's' ? durata : teamFromDB?.rows[0]?.durata + (updatedPreviousDuration - previousDuration);
        await client.sql`UPDATE squadre SET regni = ${regni}, durata = ${reignDuration}, media = ${Math.floor(reignDuration / (regni))} 
                         WHERE squadra = ${detentoreName} AND league = ${league}`;
    }
    //aggiornare la tabella stats

    //1. back to back
    const backToBack = await client.sql`SELECT t2.detentore, t2.league, t2.numero, t2.data, t2.data - t1.data AS wait_time FROM 
                                        matches AS t1 JOIN matches AS t2 ON 
                                        t1.detentore = t2.detentore AND t2.data > t1.data AND t2.data - t1.data < 60
                                        WHERE t1.outcome = 's' AND t2.outcome = 's'
                                        AND t2.detentore = ${detentoreName} AND t2.league = ${league}
                                        AND t2.data = ${data}
                                        GROUP BY t2."data", t2.league, t2.data - t1.data
                                        ORDER BY t2.data ASC`;
    // se esiste un back to back, aggiornare la tabella stats
    if (backToBack?.rowCount && backToBack?.rowCount > 0) {
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                            VALUES (${detentoreName}, ${data}, ${league}, 'Back to Back', ${backToBack.rows[0].wait_time}, ${backToBack.rows[0].numero})`;
    }

    console.info('backToBack:', backToBack?.rowCount);

    //3. decade dominator
    const decade = Math.floor(new Date(data).getFullYear() / 10) * 10;
        const decadeDominator = await client.sql`SELECT DISTINCT ON (decade) 
                                                decade, d.detentore, regni, d.data, d.league, d.numero
                                                FROM (
                                                SELECT detentore, decade, regni, max(DATA) as data, max(numero) as numero, league FROM
                                                (SELECT t1.detentore, t1.decade, regni, matches.DATA, league, numero FROM matches JOIN 
                                                (SELECT COUNT(*) AS regni, detentore, concat(FLOOR(DATE_PART('year', DATA) / 10), '0') AS decade FROM matches WHERE outcome ='s' GROUP BY detentore, decade HAVING COUNT(*) > 1) t1
                                                ON matches.detentore = t1.detentore AND DATE_PART('year', matches.data) >= CAST(t1.decade AS INTEGER) AND DATE_PART('year', matches.data) < CAST(t1.decade AS INTEGER) + 10
                                                ) dinasties
                                                GROUP BY detentore, decade, regni, league
                                                ORDER BY decade ASC, regni DESC, detentore ASC, MAX(DATA) ASC
                                                ) d 
                                                WHERE decade = ${decade} AND league = ${league}
                                                ORDER BY decade ASC, regni DESC;`;
    //aggiornare sempre il valore, inserirlo se non esiste
    console.info('decadeDominator:', decadeDominator.rowCount);
    const decadeStat = `Decade Dominator ${decade.toString()}`;
    const decadeDominatorExist = await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica = ${decadeStat}`;
    const ddData = decadeDominator.rows[0].data;
    const ddDetentore = decadeDominator.rows[0].detentore;
    const ddValore = decadeDominator.rows[0].regni;
    const ddNumero = decadeDominator.rows[0].numero;
    console.info(ddData, ddDetentore, ddValore);
    if (decadeDominatorExist?.rowCount && decadeDominatorExist.rowCount > 0) {
        console.info('update decade dominator');
        await client.sql`UPDATE stats SET data = ${ddData}, squadra = ${ddDetentore}, valore = ${ddValore}, numero = ${ddNumero}
                            WHERE league = ${league} AND statistica = ${decadeStat}`;
    }else{
        console.info('insert decade dominator');
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                        VALUES (${ddDetentore}, ${ddData}, ${league}, ${decadeStat}, ${ddValore}, ${ddNumero})`;
    }


    //4. longest reign
    const longestReign = await client.sql`SELECT matches.detentore, matches.data, matches.league, matches.numero, long.durata FROM matches JOIN (
                                            SELECT squadra,league,durata, RANK() OVER (ORDER BY durata DESC) AS position FROM squadre
                                          ) long
                                          ON matches.detentore = long.squadra 
                                          WHERE matches.outcome <> 'n'
                                          ORDER BY long.durata DESC, DATA DESC LIMIT 1`;
    await client.sql`UPDATE stats SET 
                    data = ${longestReign.rows[0].data}, squadra = ${longestReign.rows[0].detentore}, league = ${league}, statistica = 'Longest Combined Reign', valore = ${longestReign.rows[0].durata}, numero = ${longestReign.rows[0].numero}
                    WHERE league = ${league} AND statistica = 'Longest Combined Reign'`;
    
    console.info('longestReign:', longestReign.rowCount);

    //5. shortest reign
    const shortestReign = await client.sql`SELECT matches.detentore, matches.data, matches.league, matches.numero, short.durata FROM matches JOIN (
                                            SELECT squadra,league,durata, RANK() OVER (ORDER BY durata DESC) AS position FROM squadre
                                            ) short
                                            ON matches.detentore = short.squadra 
                                            WHERE matches.outcome <> 'n'
                                            ORDER BY short.durata ASC, DATA DESC LIMIT 1`;
    await client.sql`UPDATE stats SET 
                    data = ${shortestReign.rows[0].data}, squadra = ${shortestReign.rows[0].detentore}, league = ${league}, statistica = 'Shortest Reign', valore = ${shortestReign.rows[0].durata}, numero = ${shortestReign.rows[0].numero}
                    WHERE league = ${league} AND statistica = 'Shortest Reign'`;

    console.info('shortestReign:', shortestReign.rowCount);
    
    //6. century club
    const centuryClub = await client.sql`SELECT matches.detentore, MAX(matches.data) as data, MAX(matches.numero) as numero, matches.league, cen_club.durata, cen_club.tier FROM matches 
                                            JOIN (
                                                SELECT squadra, league, durata,
                                                CASE WHEN durata > 3650 THEN 'Gold'
                                                    WHEN durata > 1826 THEN 'Silver'
                                                    ELSE 'Bronze' 
                                                END AS tier FROM squadre WHERE durata > 365) cen_club
                                            ON matches.detentore = cen_club.squadra 
                                            WHERE matches.detentore = ${detentoreName} AND matches.league = ${league}
                                            GROUP BY matches.detentore, matches.league, cen_club.durata, cen_club.tier`;
    console.info('centuryClub:', centuryClub?.rowCount);
    const centuryClubStat = `Century Club - ${centuryClub?.rows[0].tier}`;
    if (centuryClub?.rowCount && centuryClub?.rowCount > 0) {
        if (await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica LIKE 'Century Club%' AND squadra = ${detentoreName}`) {
            await client.sql`UPDATE stats SET data = ${centuryClub.rows[0].data}, statistica = ${centuryClubStat}, valore = ${centuryClub.rows[0].durata}, numero = ${centuryClub.rows[0].numero}
                            WHERE league = ${league} AND statistica LIKE 'Century Club%' AND squadra = ${detentoreName}`;
        }else{
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                            VALUES (${centuryClub.rows[0].detentore}, ${centuryClub.rows[0].data}, ${league}, ${centuryClubStat}, ${centuryClub.rows[0].durata}, ${centuryClub.rows[0].numero})`;
        }
    }

    //7. title avenger
    const titleAvenger = await client.sql`SELECT 
                                                t2.detentore,
                                                t2.data,
                                                t2.league,
                                                t2.sfidante,
                                                t2.numero,
                                                (
                                                    SELECT COUNT(*)
                                                    FROM matches AS t3
                                                    WHERE t3.data > t1.data
                                                    AND t3.data < t2.data
                                                    AND t3.outcome = 's'
                                                ) AS record_count
                                            FROM matches AS t1
                                            JOIN matches AS t2
                                            ON t1.sfidante = t2.detentore
                                            AND t2.data > t1.data
                                            AND t1.detentore = t2.sfidante
                                            WHERE t1.outcome = 's' 
                                            AND t2.outcome = 's'
                                            AND t2."data" = ${data} AND t2.detentore = ${detentoreName} AND t2.league = ${league}
                                            AND NOT EXISTS (
                                                SELECT 1
                                                FROM matches AS t3
                                                WHERE t3.detentore = t2.detentore
                                                    AND t3.outcome = 's'
                                                    AND t3.data > t1.data
                                                    AND t3.data < t2.data
                                            )
                                            ORDER BY t2.data ASC;`;
    if (titleAvenger?.rowCount && titleAvenger?.rowCount > 0) {
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                            VALUES (${detentoreName}, ${data}, ${league}, 'Title Avenger vs ${sfidanteName}', ${titleAvenger.rows[0].record_count}), ${titleAvenger.rows[0].numero})`;
    }

    console.info('titleAvenger:', titleAvenger?.rowCount);

    //8. title traveller

    //9. sleeping giant
    const sleepingGiant = await client.sql`SELECT t2.*, t2.data - t1.data as sleep_duration
                                            FROM matches AS t1
                                            JOIN matches AS t2
                                            ON t1.detentore = t2.detentore
                                            AND t2.data > t1.data
                                            AND t2.data - t1.data > 3650
                                            WHERE t1.outcome = 's' AND t2.outcome = 's'
                                            AND t2."data" = ${data} AND t2.detentore = ${detentoreName} AND t2.league = ${league}
                                            AND NOT EXISTS (
                                                SELECT 1 
                                                FROM matches AS t3
                                                WHERE t3.detentore = t1.detentore
                                                AND t3."data" > t1.data
                                                AND t3.data < t2.data
                                            )
                                            GROUP BY t2."data", t2.league, t2.data - t1.data
                                            ORDER BY t2.data ASC`;
    if (sleepingGiant?.rowCount && sleepingGiant?.rowCount > 0) {
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
        VALUES (${detentoreName}, ${data}, ${league}, 'Sleeping Giant', ${sleepingGiant.rows[0].sleep_duration}, ${sleepingGiant.rows[0].numero})`;
    }

    console.info('sleepingGiant:', sleepingGiant?.rowCount);

    //10. millenial/boomer
    //se boomer rimuovi stats, se non sono presenti regni aggiunti millenial, aggiungi anche Newbie, in quanto è il primo regno
    await client.sql`DELETE FROM stats WHERE league = ${league} AND squadra = ${detentoreName} AND statistica LIKE 'Boomer'`;
    if (teamFromDB?.rows[0]?.regni === 0) {
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, numero) VALUES (${detentoreName}, ${data}, ${league}, 'Millenial', ${numero})`;
    }

    //Newbie
    const newbie = await client.sql`SELECT m.squadra, m.data, m.league, 'Newbie', m.numero FROM
                                        (
                                        WITH all_matches AS (
                                            SELECT detentore AS squadra, data, league, numero
                                            FROM matches
                                            UNION
                                            SELECT sfidante AS squadra, data, league, numero
                                            FROM matches
                                        ),
                                        first_matches AS (
                                            SELECT squadra, MIN(data) AS first_date
                                            FROM all_matches
                                            GROUP BY squadra
                                        )
                                        SELECT am.squadra, am.data, am.league, am.numero
                                        FROM all_matches am
                                        JOIN first_matches fm
                                        ON am.squadra = fm.squadra AND am.data = fm.first_date
                                        ) m
                                        WHERE (m.squadra = ${detentoreName} OR m.squadta = ${sfidanteName}) AND m.league = ${league} AND m.data = ${data}`;
    if (newbie?.rowCount && newbie?.rowCount > 0) {
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, numero) VALUES (${newbie.rows[0].squadra}, ${newbie.rows[0].data}, ${newbie.rows[0].league}, 'Newbie', ${newbie.rows[0].numero})`;
    }

    //LIVELLO 3
    //1. Legacy Run
    const legacyRun = await client.sql`
                                        SELECT matches.detentore, MAX(matches.data) as data, matches.league, iron.regni, iron.tier, MAX(matches.numero) AS numero FROM matches JOIN (
                                            SELECT squadra, league, regni,
                                            CASE WHEN regni > 100 THEN 'Platinum'
                                                WHEN regni > 50 THEN 'Gold'
                                                WHEN regni > 25 THEN 'Silver'
                                                WHEN regni > 15 THEN 'Bronze'
                                                ELSE 'Iron' 
                                            END AS tier FROM squadre WHERE regni > 10) iron
                                            ON matches.detentore = iron.squadra 
                                            WHERE matches.detentore = ${detentoreName} AND matches.league = ${league}
                                            GROUP BY matches.detentore, matches.league, iron.regni, iron.tier`;
    console.info('legacyRun:', legacyRun?.rowCount);
    const legacyRunStat = `Legacy Run - ${legacyRun?.rows[0].tier}`;
    if (legacyRun?.rowCount && legacyRun?.rowCount > 0) {
        if (await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica LIKE 'Legacy Run%' AND squadra = ${detentoreName}`) {
            await client.sql`UPDATE stats SET data = ${legacyRun.rows[0].data}, statistica = ${legacyRunStat}, valore = ${legacyRun.rows[0].regni}, numero = ${legacyRun.rows[0].numero}
                            WHERE league = ${league} AND statistica LIKE 'Legacy Run%' AND squadra = ${detentoreName}`;
        }else{
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                            VALUES (${legacyRun.rows[0].detentore}, ${legacyRun.rows[0].data}, ${league}, ${legacyRunStat}, ${legacyRun.rows[0].regni}, ${legacyRun.rows[0].numero})`;
        }
    }

    //Stronghold Record
    //eliminare i record da stats con statistica like 'Stronghold%'
    await client.sql`DELETE FROM stats WHERE league = ${league} AND statistica LIKE 'Stronghold%'`;
    const strongholdRecord = await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                                                SELECT m.detentore, m.fine_regno, 'serie_a', CONCAT('Stronghold Record - ',m.rank) , m.partite,  m.numero FROM
                                                (
                                                WITH ranked_matches AS (
                                                SELECT
                                                    *,
                                                    ROW_NUMBER() OVER (ORDER BY data) 
                                                    - ROW_NUMBER() OVER (PARTITION BY detentore ORDER BY data) AS regno_id
                                                FROM
                                                    matches
                                                ),
                                                grouped_regni AS (
                                                SELECT
                                                    detentore,
                                                    regno_id,
                                                    MIN(data) AS inizio_regno,
                                                    MAX(data) AS fine_regno,
                                                    COUNT(*) AS partite
                                                FROM
                                                    ranked_matches
                                                GROUP BY
                                                    detentore, regno_id
                                                ),
                                                ordered_regni AS (
                                                SELECT
                                                    detentore,
                                                    inizio_regno,
                                                    fine_regno,
                                                    partite,
                                                    RANK() OVER (ORDER BY partite DESC) AS rank
                                                FROM
                                                    grouped_regni
                                                )
                                                SELECT
                                                re.detentore,
                                                inizio_regno,
                                                fine_regno,
                                                partite,
                                                rank,
                                                numero
                                                FROM
                                                ordered_regni re
                                                JOIN matches ma ON re.detentore = ma.detentore AND re.fine_regno = ma.data
                                                ORDER BY partite DESC
                                                LIMIT 10
                                                ) m`;

    console.info('strongholdRecord:', strongholdRecord.rowCount);

    //Consolation Prize
    //eliminare i record da stats con statistica like 'Consolation Prize%'
    await client.sql`DELETE FROM stats WHERE league = ${league} AND statistica LIKE 'Consolation Prize%'`;
    const consolationPrize = await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                                                SELECT c.squadra, c.ultima_sfida_data, c.league, CONCAT('Consolation Prize - ', c.rank) , c.sfide,  c.ultima_sfida_numero FROM
                                                (
                                                WITH ranked_squadre AS (
                                                SELECT 
                                                    *,
                                                    RANK() OVER (ORDER BY sfide DESC) AS rank
                                                FROM 
                                                    squadre
                                                WHERE 
                                                    regni = 0 AND NOT(sfide IS NULL)
                                                ),
                                                last_match AS (
                                                SELECT 
                                                    s.squadra,
                                                    m.*
                                                FROM 
                                                    ranked_squadre s
                                                LEFT JOIN 
                                                    matches m 
                                                ON 
                                                    s.squadra = m.sfidante
                                                WHERE 
                                                    m.data = (
                                                    SELECT MAX(data)
                                                    FROM matches
                                                    WHERE sfidante = s.squadra
                                                    )
                                                )
                                                SELECT 
                                                r.squadra,
                                                r.sfide,
                                                r.rank,
                                                r.league,
                                                l.data AS ultima_sfida_data,
                                                l.numero AS ultima_sfida_numero
                                                FROM 
                                                ranked_squadre r
                                                LEFT JOIN 
                                                last_match l 
                                                ON 
                                                r.squadra = l.squadra
                                                ORDER BY 
                                                r.rank
                                                LIMIT 10
                                                ) c`;

    console.info('consolationPrize:', consolationPrize.rowCount);

    //3. King Slayer
    //eliminare i record da stats con statistica like 'King Slayer%'
    await client.sql`DELETE FROM stats WHERE league = ${league} AND statistica LIKE 'King Slayer%'`;
    const kingSlayer = await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                                                SELECT m.ks, m.data_prossima_partita, 'serie_a', Concat('King Slayer vs ', m.detentore) , m.durata, m.numero FROM
                                                (
                                            WITH ranked_matches AS (
                                            SELECT
                                                *,
                                                ROW_NUMBER() OVER (ORDER BY data) 
                                                - ROW_NUMBER() OVER (PARTITION BY detentore ORDER BY data) AS regno_id
                                            FROM
                                                matches
                                            ),
                                            grouped_regni AS (
                                            SELECT
                                                detentore,
                                                regno_id,
                                                MIN(data) AS inizio_regno,
                                                MAX(data) AS fine_regno,
                                                MAX(durata) AS durata,
                                                COUNT(*) AS partite
                                            FROM
                                                ranked_matches
                                            GROUP BY
                                                detentore, regno_id
                                            ),
                                            ordered_regni AS (
                                            SELECT
                                                detentore,
                                                inizio_regno,
                                                fine_regno,
                                                durata,
                                                partite,
                                                RANK() OVER (ORDER BY partite DESC) AS rank
                                            FROM
                                                grouped_regni
                                            )
                                            SELECT
                                            regni.detentore,
                                            regni.inizio_regno,
                                            regni.fine_regno,
                                            regni.durata,
                                            regni.partite,
                                            next_match.data AS data_prossima_partita,
                                            next_match.detentore AS ks,
                                            next_match.numero
                                            FROM
                                            ordered_regni regni
                                            LEFT JOIN LATERAL (
                                            SELECT
                                                m.data,
                                                m.detentore,
                                                m.numero
                                            FROM
                                                matches m
                                            WHERE
                                                m.data > regni.fine_regno -- Solo partite successive alla fine del regno
                                                AND m.sfidante = regni.detentore -- Sfidante è il detentore
                                                AND m.outcome = 's' -- Risultato deve essere "s"
                                            ORDER BY
                                                m.data ASC -- Prendi la prima partita successiva
                                            LIMIT 1
                                            ) next_match ON TRUE
                                            ORDER BY
                                            regni.durata DESC
                                            LIMIT 10
                                            )m`;

    console.info('kingSlayer:', kingSlayer.rowCount);
    
    
    //4. Dinasty Builder
    const dinastyBuilder = await client.sql`SELECT matches.detentore, matches.data, decade, tot AS durata, matches.league, matches.numero FROM(
                                                    SELECT detentore, MAX(fine_regno), decade, SUM(durata) AS tot FROM 
                                                    (WITH ranked_matches AS (
                                                    SELECT
                                                        *,
                                                        ROW_NUMBER() OVER (ORDER BY data) 
                                                        - ROW_NUMBER() OVER (PARTITION BY detentore ORDER BY data) AS regno_id
                                                    FROM
                                                        matches
                                                    ),
                                                    grouped_regni AS (
                                                    SELECT
                                                        detentore,
                                                        regno_id,
                                                        MIN(data) AS inizio_regno,
                                                        MAX(data) AS fine_regno,
                                                        MAX(durata) AS durata,
                                                        COUNT(*) AS partite
                                                    FROM
                                                        ranked_matches
                                                    GROUP BY
                                                        detentore, regno_id
                                                    ),
                                                    ordered_regni AS (
                                                    SELECT
                                                        detentore,
                                                        inizio_regno,
                                                        fine_regno,
                                                        durata,
                                                        partite,
                                                        RANK() OVER (ORDER BY partite DESC) AS rank
                                                    FROM
                                                        grouped_regni
                                                    )
                                                    SELECT
                                                    detentore,
                                                    inizio_regno,
                                                    fine_regno,
                                                    CONCAT(FLOOR(DATE_PART('year', inizio_regno) / 10),0) AS decade,
                                                    durata,
                                                    partite
                                                    FROM
                                                    ordered_regni ) db
                                                    GROUP BY detentore, decade
                                                    HAVING SUM(durata) > 365
                                                    ORDER BY decade ASC, tot DESC, detentore ) db1
                                                    JOIN matches ON db1.detentore = matches.detentore AND db1.max = matches.data
                                                    WHERE decade = ${decade} AND db1.detentore = ${detentoreName} AND matches.league = ${league}`;
    console.info('dinastyBuilder:', dinastyBuilder.rowCount);
    //aggiornare sempre il valore, inserirlo se non esiste
    const dinastyStat = `Dinasty Builder ${decade.toString()}`;
    const dinastyBuilderExist = await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica = ${dinastyStat}`;
    if (dinastyBuilder.rowCount && dinastyBuilder.rowCount > 0) {
        if (dinastyBuilderExist?.rowCount && dinastyBuilderExist.rowCount > 0) {
            await client.sql`UPDATE stats SET data = ${dinastyBuilder.rows[0].MAX}, valore = ${dinastyBuilder.rows[0].durata}, squadra = ${dinastyBuilder.rows[0].detentore}, numero = ${dinastyBuilder.rows[0].numero}
                                WHERE league = ${league} AND statistica = ${dinastyStat}`;
        }else{
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
            VALUES (${dinastyBuilder.rows[0].detentore}, ${dinastyBuilder.rows[0].MAX}, ${league}, ${dinastyStat}, ${dinastyBuilder.rows[0].durata}, ${dinastyBuilder.rows[0].numero})`;
        }
    }

    //5. All-time rivals
    const allTimeRivals = await client.sql`SELECT matches.detentore, all_time.sfidante, MAX(matches.data) as data, MAX(matches.numero) AS numero, matches.league, all_time.tot FROM matches 
                                            JOIN (
                                                SELECT * FROM (SELECT COUNT(*) AS tot, detentore, sfidante FROM matches WHERE outcome = 's' GROUP BY detentore, sfidante) t
                                                WHERE t.tot >= 5) all_time
                                            ON matches.detentore = all_time.detentore AND matches.sfidante = all_time.sfidante
                                            WHERE matches.detentore = ${detentoreName} AND matches.league = ${league} AND matches.data = ${data} AND matches.sfidante = ${sfidanteName}
                                            GROUP BY matches.detentore, matches.league, all_time.sfidante, all_time.tot`;
    console.info('allTimeRivals:', allTimeRivals?.rowCount);
    const allTimeRivalsStat = `All Time Rival vs ${sfidanteName}`;
    if (allTimeRivals?.rowCount && allTimeRivals?.rowCount > 0) {
        if (await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica = ${allTimeRivalsStat} AND squadra = ${detentoreName}`) {
            await client.sql`UPDATE stats SET data = ${allTimeRivals.rows[0].data}, valore = ${allTimeRivals.rows[0].tot}, numero = ${allTimeRivals.rows[0].numero}
                                WHERE league = ${league} AND statistica = ${allTimeRivalsStat} AND squadra = ${detentoreName}`;
        }else{
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore, numero) 
                                VALUES (${allTimeRivals.rows[0].detentore}, ${allTimeRivals.rows[0].data}, ${league}, ${allTimeRivalsStat}, ${allTimeRivals.rows[0].tot}, ${allTimeRivals.rows[0].numero})`;
        }
    }

}

export default updateStats;