import { VercelPoolClient } from "@vercel/postgres";
import { ALL_STAT_MODULES, Match, SquadraState, StatContext } from "./stats";

const updateStats = async (
    client: VercelPoolClient, league: string, _home: string, _away: string,
    detentoreName: string, sfidanteName: string, _risultato: string, outcome: string,
    previousDuration: number, updatedPreviousDuration: number, _durata: number,
    data: string, numero: number
) => {
    if (outcome === "n") return;

    // ---- squadre: detentore ----
    const teamFromDB = await client.sql`SELECT * FROM squadre WHERE squadra = ${detentoreName} AND league = ${league}`;
    if (teamFromDB && teamFromDB.rowCount === 0) {
        await client.sql`INSERT INTO squadre (squadra, regni, durata, media, colore_primario, colore_secondario, league)
                         VALUES (${detentoreName}, 1, 0, 0, '#000000', '#FFFFFF', ${league})`;
    } else {
        const currentRegni = teamFromDB?.rows[0]?.regni ?? 0;
        const currentDurata = teamFromDB?.rows[0]?.durata ?? 0;
        const currentDifese = teamFromDB?.rows[0]?.difese ?? 0;
        const regni = outcome === "s" ? currentRegni + 1 : currentRegni;
        const reignDuration = outcome === "s" ? currentDurata + _durata : currentDurata + (updatedPreviousDuration - previousDuration);
        const reignDefences = outcome === "s" ? currentDifese : currentDifese + 1;
        const defAverage = regni > 0 ? Math.round((reignDefences / regni) * 100) / 100 : 0;
        await client.sql`UPDATE squadre SET regni = ${regni}, durata = ${reignDuration}, media = ${regni > 0 ? Math.floor(reignDuration / regni) : 0}, difese = ${reignDefences}, media_difese = ${defAverage}
                         WHERE squadra = ${detentoreName} AND league = ${league}`;
    }

    // ---- squadre: sfidante (only when outcome != 's') ----
    if (outcome !== "s") {
        const rivalFromDB = await client.sql`SELECT * FROM squadre WHERE squadra = ${sfidanteName} AND league = ${league}`;
        if (rivalFromDB && rivalFromDB.rowCount === 0) {
            await client.sql`INSERT INTO squadre (squadra, regni, durata, media, colore_primario, colore_secondario, league, sfide)
                             VALUES (${sfidanteName}, 0, 0, 0, '#000000', '#FFFFFF', ${league}, 1)`;
        } else {
            const sfide = (rivalFromDB?.rows[0]?.sfide ?? 0) + 1;
            await client.sql`UPDATE squadre SET sfide = ${sfide} WHERE squadra = ${sfidanteName} AND league = ${league}`;
        }
    }

    // ---- build StatContext ----
    const matchesResult = await client.sql`SELECT * FROM matches WHERE league = ${league} AND outcome != 'n' ORDER BY numero ASC`;
    const allMatches: Match[] = matchesResult.rows.map(r => ({
        ...r,
        data: new Date(r.data as string).toISOString().split("T")[0],
    })) as Match[];

    const squadreResult = await client.sql`SELECT * FROM squadre WHERE league = ${league}`;
    const squadreMap = new Map<string, SquadraState>(
        squadreResult.rows.map(r => [r.squadra as string, r as unknown as SquadraState])
    );

    const match = allMatches.find(m => m.numero === numero);
    if (!match) {
        console.warn("statsCalc: current match not found in allMatches, numero=", numero);
        return;
    }

    const ctx: StatContext = { league, match, allMatches, squadreMap };

    // ---- run all stat modules ----
    for (const mod of ALL_STAT_MODULES) {
        try {
            const result = mod.compute(ctx);
            if (result && result.rows.length > 0) {
                await mod.persist(client, league, result);
            }
        } catch (err) {
            console.error(`statsCalc: module ${mod.name} failed`, err);
        }
    }

    console.info("statsCalc done for match", numero, league);
};

export default updateStats;
