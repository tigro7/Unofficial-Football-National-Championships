import React from "react";
import Match from "../../match";
import ErrorBoundary from "@/app/components/ErrorBoundary";

const SerieAMatchPage = async ({params,}: {params: Promise<{ data: string }>}) => {

    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base

    const data = (await params).data;
    const response = await fetch(`${host}/api/matches/${data}/serie_a`);

    if (!response.ok) {
        throw new Error("Failed to fetch team data");
    }
    const matchData = (await response.json())[0];

    console.info(matchData);

    /* per la logica del db attuale vince sempre lo sfidante quindi per determinare home e away bisogna vedere chi ha segnato più goal */
    const teamHomeNome = matchData.risultato.charAt(0) < matchData.risultato.charAt(2) ? matchData.detentore : matchData.sfidante;
    const teamAwayNome = matchData.sfidante === teamHomeNome ? matchData.detentore : matchData.sfidante;

    const teamHome = (await (await fetch(`${host}/api/squadre/squadra/${teamHomeNome}`)).json())[0];
    const teamAway = (await (await fetch(`${host}/api/squadre/squadra/${teamAwayNome}`)).json())[0];

    const homeH2H = (await (await fetch(`${host}/api/matches/h2h/${teamAway.squadra}/${teamHome.squadra}/serie_a/${data}`)).json())[0];
    const awayH2H = (await (await fetch(`${host}/api/matches/h2h/${teamHome.squadra}/${teamAway.squadra}/serie_a/${data}`)).json())[0];
    const drawH2H = 0; /*quando saranno implementate le difese del titolo recuperare il numero di pareggi*/

    const nextDate = (await (await fetch(`${host}/api/matches/${data}/serie_a/next`)).json())[0];
    const previousDate = (await (await fetch(`${host}/api/matches/${data}/serie_a/previous`)).json())[0];

    return (
        <ErrorBoundary>
            <Match 
                matchInfo={{
                    date: matchData.data, 
                    location: matchData.luogo || 'Non specificato', 
                    score: matchData.risultato || 'Non disputato'
                }} 
                teamHome={{ 
                    name: teamHome.squadra, 
                    colors: { 
                        primary: teamHome.colore_primario ? `#${teamHome.colore_primario}` : '#000000', 
                        secondary: teamHome.colore_secondario ? `#${teamHome.colore_secondario}` : '#FFFFFF'
                    }
                }} 
                teamAway={{ 
                    name: teamAway.squadra, 
                    colors: { 
                        primary: teamAway.colore_primario ? `#${teamAway.colore_primario}` : '#000000', 
                        secondary: teamAway.colore_secondario ? `#${teamAway.colore_secondario}` : '#FFFFFF'
                    } 
                }} 
                stats={{
                    headToHead: {home: homeH2H.h2h, away: awayH2H.h2h, draw: drawH2H}, 
                    teamHomeTitles: teamHome.regni,
                    teamAwayTitles: teamAway.regni
                }}
                dates={{
                    previous: previousDate?.data || '',
                    next: nextDate?.data || ''
                }}
            />
        </ErrorBoundary>
    );
};

export default SerieAMatchPage;