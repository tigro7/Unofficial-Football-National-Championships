import { VercelPoolClient } from "@vercel/postgres";

const updateStats = async (
    client: VercelPoolClient, league: string, home: string, away: string, detentoreName: string, sfidanteName: string, risultato: string, outcome: string, 
    previousDuration: number, updatedPreviousDuration: number, durata: number, data: string
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
    const backToBack = await client.sql`SELECT t2.*, t2.data - t1.data AS wait_time FROM 
                                        matches AS t1 JOIN matches AS t2 ON 
                                        t1.detentore = t2.detentore AND t2.data > t1.data AND t2.data - t1.data < 60
                                        WHERE t1.outcome = 's' AND t2.outcome = 's'
                                        AND t2.detentore = ${detentoreName} AND t2.league = ${league}
                                        AND t2.data = ${data}
                                        GROUP BY t2."data", t2.league, t2.data - t1.data
                                        ORDER BY t2.data ASC`;
    // se esiste un back to back, aggiornare la tabella stats
    if (backToBack?.rowCount && backToBack?.rowCount > 0) {
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore) 
                            VALUES (${detentoreName}, ${data}, ${league}, 'Back to Back', ${backToBack.rows[0].wait_time})`;
    }

    console.info('backToBack:', backToBack?.rowCount);

    //2. iron defense

    //3. decade dominator
    const decade = Math.floor(new Date(data).getFullYear() / 10) * 10;
    const decadeDominator = await client.sql`SELECT DISTINCT ON (decade) 
                                            decade, detentore, regni, data, league
                                            FROM (
                                            SELECT detentore, decade, regni, max(DATA) as data, league FROM
                                            (SELECT t1.detentore, t1.decade, regni, matches.DATA, league FROM matches JOIN 
                                            (SELECT COUNT(*) AS regni, detentore, concat(FLOOR(DATE_PART('year', DATA) / 10), '0') AS decade FROM matches WHERE outcome ='s' GROUP BY detentore, decade HAVING COUNT(*) > 1) t1
                                            ON matches.detentore = t1.detentore AND DATE_PART('year', matches.data) >= CAST(t1.decade AS INTEGER) AND DATE_PART('year', matches.data) < CAST(t1.decade AS INTEGER) + 10
                                            ) dinasties
                                            GROUP BY detentore, decade, regni, league
                                            ORDER BY decade ASC, regni DESC, detentore ASC, MAX(DATA) ASC
                                            )
                                            WHERE decade = ${decade} AND league = ${league}
                                            ORDER BY decade ASC, regni DESC;`;
    //aggiornare sempre il valore, inserirlo se non esiste
    console.info('decadeDominator:', decadeDominator.rowCount);
    const decadeStat = `Decade Dominator ${decade.toString()}`;
    const decadeDominatorExist = await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica = ${decadeStat}`;
    const ddData = decadeDominator.rows[0].data;
    const ddDetentore = decadeDominator.rows[0].detentore;
    const ddValore = decadeDominator.rows[0].regni;
    console.info(ddData, ddDetentore, ddValore);
    if (decadeDominatorExist?.rowCount && decadeDominatorExist.rowCount > 0) {
        console.info('update decade dominator');
        await client.sql`UPDATE stats SET data = ${ddData}, squadra = ${ddDetentore}, valore = ${ddValore}
                            WHERE league = ${league} AND statistica = ${decadeStat}`;
    }else{
        console.info('insert decade dominator');
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore) 
                        VALUES (${ddDetentore}, ${ddData}, ${league}, ${decadeStat}, ${ddValore})`;
    }


    //4. longest reign
    const longestReign = await client.sql`SELECT matches.detentore, matches.data, matches.league, long.durata FROM matches JOIN (
                                            SELECT squadra,league,durata, RANK() OVER (ORDER BY durata DESC) AS position FROM squadre
                                          ) long
                                          ON matches.detentore = long.squadra 
                                          ORDER BY long.durata DESC, DATA DESC LIMIT 1`;
    await client.sql`UPDATE stats SET 
                    data = ${longestReign.rows[0].data}, squadra = ${longestReign.rows[0].detentore}, league = ${league}, statistica = 'Longest Reign', valore = ${longestReign.rows[0].durata}
                    WHERE league = ${league} AND statistica = 'Longest Reign'`;
    
    console.info('longestReign:', longestReign.rowCount);

    //5. shortest reign
    const shortestReign = await client.sql`SELECT matches.detentore, matches.data, matches.league, short.durata FROM matches JOIN (
                                            SELECT squadra,league,durata, RANK() OVER (ORDER BY durata DESC) AS position FROM squadre
                                            ) short
                                            ON matches.detentore = short.squadra 
                                            ORDER BY short.durata ASC, DATA DESC LIMIT 1`;
    await client.sql`UPDATE stats SET 
                    data = ${shortestReign.rows[0].data}, squadra = ${shortestReign.rows[0].detentore}, league = ${league}, statistica = 'Shortest Reign', valore = ${shortestReign.rows[0].durata}
                    WHERE league = ${league} AND statistica = 'Shortest Reign'`;

    console.info('shortestReign:', shortestReign.rowCount);
    
    //6. century club
    const centuryClub = await client.sql`SELECT matches.detentore, MAX(matches.data) as data, matches.league, cen_club.durata, cen_club.tier FROM matches 
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
            await client.sql`UPDATE stats SET data = ${centuryClub.rows[0].data}, statistica = ${centuryClubStat}, valore = ${centuryClub.rows[0].durata}
                            WHERE league = ${league} AND statistica LIKE 'Century Club%' AND squadra = ${detentoreName}`;
        }else{
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore) 
                            VALUES (${centuryClub.rows[0].detentore}, ${centuryClub.rows[0].data}, ${league}, ${centuryClubStat}, ${centuryClub.rows[0].durata})`;
        }
    }

    //7. title avenger
    const titleAvenger = await client.sql`SELECT 
                                                t2.detentore,
                                                t2.data,
                                                t2.league,
                                                t2.sfidante,
                                                (
                                                    SELECT COUNT(*)
                                                    FROM matches AS t3
                                                    WHERE t3.data > t1.data
                                                    AND t3.data < t2.data
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
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore) 
                            VALUES (${detentoreName}, ${data}, ${league}, 'Title Avenger vs ${sfidanteName}', ${titleAvenger.rows[0].record_count})`;
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
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore) 
        VALUES (${detentoreName}, ${data}, ${league}, 'Sleeping Giant', ${sleepingGiant.rows[0].sleep_duration})`;
    }

    console.info('sleepingGiant:', sleepingGiant?.rowCount);

    //10. millenial/boomer
    //se boomer rimuovi stats, se non sono presenti regni aggiunti millenial
    await client.sql`DELETE FROM stats WHERE league = ${league} AND squadra = ${detentoreName} AND statistica LIKE 'Boomer'`;
    if (teamFromDB?.rows[0]?.regni === 0) {
        await client.sql`INSERT INTO stats (squadra, DATA, league, statistica) VALUES (${detentoreName}, ${data}, ${league}, 'Millenial')`;
    }

    //LIVELLO 3
    //1. Iron legacy
    const ironLegacy = await client.sql`SELECT matches.detentore, MAX(matches.data) as data, matches.league, iron.regni, iron.tier FROM matches JOIN (
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
    console.info('ironLegacy:', ironLegacy?.rowCount);
    const ironLegacyStat = `Iron Legacy ${ironLegacy?.rows[0].tier}`;
    if (ironLegacy?.rowCount && ironLegacy?.rowCount > 0) {
        if (await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica LIKE 'Iron Legacy%' AND squadra = ${detentoreName}`) {
            await client.sql`UPDATE stats SET data = ${ironLegacy.rows[0].data}, statistica = ${ironLegacyStat}, valore = ${ironLegacy.rows[0].durata}
                            WHERE league = ${league} AND statistica LIKE 'Iron Legacy%' AND squadra = ${detentoreName}`;
        }else{
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore) 
                            VALUES (${ironLegacy.rows[0].detentore}, ${ironLegacy.rows[0].data}, ${league}, ${ironLegacyStat}, ${ironLegacy.rows[0].durata})`;
        }
    }

    //2. Clean Sheet

    //3. King Slayer
    //eliminare i record da stats con statistica like 'King Slayer%'
    await client.sql`DELETE FROM stats WHERE league = ${league} AND statistica LIKE 'King Slayer%'`;
    const kingSlayer = await client.sql`WITH ks AS (
                                            SELECT t2.*, t1.durata AS durata_regno
                                            FROM (
                                            SELECT * 
                                            FROM matches 
                                            ORDER BY durata DESC 
                                            LIMIT 10
                                            ) AS t1
                                            LEFT JOIN LATERAL (
                                            SELECT * 
                                            FROM matches AS t2
                                            WHERE t2.data > t1.data
                                            AND t2.outcome = 's'
                                            AND t2.sfidante = t1.detentore
                                            ORDER BY t2.data ASC
                                            LIMIT 1
                                            ) AS t2 ON TRUE
                                        ) INSERT INTO stats (squadra, DATA, league, statistica, valore) 
                                        SELECT 
                                        ks.detentore, ks.data, ks.league, Concat('King Slayer vs ', ks.sfidante), ks.durata_regno FROM ks`;

    console.info('kingSlayer:', kingSlayer.rowCount);

    //4. Dinasty Builder
    const dinastyBuilder = await client.sql`SELECT matches.detentore, MAX(matches.data), matches.league, long.durata, decade FROM matches JOIN (
                                            SELECT SUM AS durata, detentore, CONCAT(decade, '0') AS decade FROM (SELECT SUM(durata) AS sum, detentore, FLOOR(DATE_PART('year', DATA) / 10) AS decade FROM matches WHERE outcome ='s' GROUP BY detentore, decade) s 
                                            WHERE sum > 365 AND decade = ${decade} AND detentore = ${detentoreName} ORDER BY decade ASC, SUM, detentore ASC) long
                                            ON matches.detentore = long.detentore AND DATE_PART('year', matches.data) >= CAST(long.decade AS INTEGER) AND DATE_PART('year', matches.data) < CAST(long.decade AS INTEGER) + 10
                                            GROUP BY matches.detentore, matches.league, long.durata, long.decade
                                            ORDER BY decade`;
    console.info('dinastyBuilder:', dinastyBuilder.rowCount);
    //aggiornare sempre il valore, inserirlo se non esiste
    const dinastyStat = `Dinasty Builder ${decade.toString()}`;
    const dinastyBuilderExist = await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica = ${dinastyStat}`;
    if (dinastyBuilder.rowCount && dinastyBuilder.rowCount > 0) {
        if (dinastyBuilderExist?.rowCount && dinastyBuilderExist.rowCount > 0) {
            await client.sql`UPDATE stats SET data = ${dinastyBuilder.rows[0].MAX}, valore = ${dinastyBuilder.rows[0].durata}, squadra = ${dinastyBuilder.rows[0].detentore} 
                                WHERE league = ${league} AND statistica = ${dinastyStat}`;
        }else{
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore) 
            VALUES (${dinastyBuilder.rows[0].detentore}, ${dinastyBuilder.rows[0].MAX}, ${league}, ${dinastyStat}, ${dinastyBuilder.rows[0].durata})`;
        }
    }

    //5. All-time rivals
    const allTimeRivals = await client.sql`SELECT matches.detentore, all_time.sfidante, MAX(matches.data) as data, matches.league, all_time.tot FROM matches 
                                            JOIN (
                                                SELECT * FROM (SELECT COUNT(*) AS tot, detentore, sfidante FROM matches WHERE outcome = 's' GROUP BY detentore, sfidante) t
                                                WHERE t.tot >= 5) all_time
                                            ON matches.detentore = all_time.detentore AND matches.sfidante = all_time.sfidante
                                            WHERE matches.detentore = ${detentoreName} AND matches.league = ${league} AND matches.data = ${data} AND matches.sfidante = ${sfidanteName}
                                            GROUP BY matches.detentore, matches.league, all_time.sfidante, all_time.tot`;
    console.info('allTimeRivals:', allTimeRivals?.rowCount);
    const allTimeRivalsStat = `All-time Rivals vs ${sfidanteName}`;
    if (allTimeRivals?.rowCount && allTimeRivals?.rowCount > 0) {
        if (await client.sql`SELECT * FROM stats WHERE league = ${league} AND statistica = ${allTimeRivalsStat} AND squadra = ${detentoreName}`) {
            await client.sql`UPDATE stats SET data = ${allTimeRivals.rows[0].data}, valore = ${allTimeRivals.rows[0].tot}
                                WHERE league = ${league} AND statistica = ${allTimeRivalsStat} AND squadra = ${detentoreName}`;
        }else{
            await client.sql`INSERT INTO stats (squadra, DATA, league, statistica, valore) 
                                VALUES (${allTimeRivals.rows[0].detentore}, ${allTimeRivals.rows[0].data}, ${league}, ${allTimeRivalsStat}, ${allTimeRivals.rows[0].tot})`;
        }
    }

}

export default updateStats;