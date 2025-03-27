import React from "react";
import Match from "../match";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import normalizeTeamName from "@/app/utils/namesMap";

const Page = async ({params,}: {params: Promise<{ numero: number, league: string}>}) => {

    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base

    const {league, numero} = await params;
    const response = await fetch(`${host}/api/${league}/matches/${numero}`);

    if (!response.ok) {
        throw new Error("Failed to fetch team data");
    }
    const matchData = (await response.json())[0];

    const teamHome = (await (await fetch(`${host}/api/${league}/squadre/${normalizeTeamName(matchData.home)}`)).json())[0];
    const teamAway = (await (await fetch(`${host}/api/${league}/squadre/${normalizeTeamName(matchData.away)}`)).json())[0];
    const homeReigns = (await (await fetch(`${host}/api/${league}/regni/${normalizeTeamName(matchData.home)}/${numero}`)).json())[0].regni;
    const awayReigns = (await (await fetch(`${host}/api/${league}/regni/${normalizeTeamName(matchData.away)}/${numero}`)).json())[0].regni;

    const h2h = (await (await fetch(`${host}/api/${league}/matches/h2h/${teamHome.squadra}/${teamAway.squadra}/${numero}`)).json())[0];
    //const awayH2H = (await (await fetch(`${host}/api/${league}/matches/h2h/${teamAway.squadra}/${teamHome.squadra}/${data}`)).json())[0];
    //const drawH2H = (await (await fetch(`${host}/api/${league}/matches/draw/${teamHome.squadra}/${teamAway.squadra}/${data}`)).json())[0];

    const previousMatch = matchData.prev;
    const nextMatch = matchData.next;

    return (
        <ErrorBoundary>
            <Match 
                matchInfo={{
                    date: matchData.data, 
                    location: matchData.luogo || '', 
                    score: matchData.risultato || 'To be played',
                    outcome: matchData.outcome,
                    detentore: matchData.detentore,
                    sfidante: matchData.sfidante,
                    competizione: matchData.note || league,
                    numero: matchData.numero,
                    home: matchData.home,
                    away: matchData.away
                }} 
                teamHome={{ 
                    name: teamHome.squadra, 
                    abbr: teamHome.abbr,
                    colors: { 
                        primary: teamHome.colore_primario ? `#${teamHome.colore_primario}` : '#000000', 
                        secondary: teamHome.colore_secondario ? `#${teamHome.colore_secondario}` : '#FFFFFF'
                    }
                }} 
                teamAway={{ 
                    name: teamAway.squadra, 
                    abbr: teamAway.abbr,
                    colors: { 
                        primary: teamAway.colore_primario ? `#${teamAway.colore_primario}` : '#000000', 
                        secondary: teamAway.colore_secondario ? `#${teamAway.colore_secondario}` : '#FFFFFF'
                    } 
                }} 
                stats={{
                    headToHead: {home: h2h.wond, away: h2h.wons, draw: h2h.draw}, 
                    teamHomeTitles: homeReigns,
                    teamAwayTitles: awayReigns
                }}
                adjacents={{
                    previous: previousMatch || '',
                    next: nextMatch || ''
                }}
                league={league}
            />
        </ErrorBoundary>
    );
};

export default Page;