import React from "react";
import Team from "../team";
import ErrorBoundary from "@/app/components/ErrorBoundary";

const TeamPage = async ({params,}: {params: Promise<{ name: string, league: string}>}) => {

    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base

    const squadra = (await params).name;
    const league = (await params).league;
    const response = await fetch(`${host}/api/${league}/squadre/${squadra}`);

    if (!response.ok) {
        throw new Error("Failed to fetch team data");
    }
    const teamData = (await response.json())[0];

    const regni = await fetch (`${host}/api/${league}/regni/${teamData.squadra}`).then(res => res.json());
    const startDate = await fetch (`${host}/api/${league}/start`).then(res => res.json()).then(data => data[0].data);

    const posizioneRegni = await fetch (`${host}/api/${league}/regni/posizione/${teamData.regni}`).then(res => res.json()).then(data => data[0].position);
    const posizioneDurata = await fetch (`${host}/api/${league}/durata/posizione/${teamData.durata}`).then(res => res.json()).then(data => data[0].position);
    const posizioneMedia = await fetch (`${host}/api/${league}/media/posizione/${teamData.media}`).then(res => res.json()).then(data => data[0].position);

    return (
        <ErrorBoundary>
            <Team
                squadra={teamData.squadra}
                stats={{
                    regni: teamData.regni,
                    durataCombinata: teamData.durata,
                    durataMedia: teamData.media,
                }}
                colors={{
                    primary: `#${teamData.colore_primario}`,
                    secondary: `#${teamData.colore_secondario}`,
                }}
                posizioni={{
                    regni: posizioneRegni,
                    durata: posizioneDurata,
                    media: posizioneMedia
                }}
                regni={regni}
                startDate={startDate}
                league={league}
            />
        </ErrorBoundary>
    );
};

export default TeamPage;