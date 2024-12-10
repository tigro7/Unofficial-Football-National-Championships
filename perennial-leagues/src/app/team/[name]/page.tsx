import React from "react";
import Team from "../team";
import ErrorBoundary from "@/app/components/ErrorBoundary";

const TeamPage = async ({params,}: {params: Promise<{ name: string }>}) => {

    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base

    const squadra = (await params).name;
    const response = await fetch(`${host}/api/squadre/squadra/${squadra}`);

    if (!response.ok) {
        throw new Error("Failed to fetch team data");
    }
    const teamData = (await response.json())[0];

    const regni = await fetch (`${host}/api/regni/serie_a/${teamData.squadra}`).then(res => res.json());
    const startDate = await fetch (`${host}/api/start/serie_a`).then(res => res.json()).then(data => data[0].data);

    const posizioneRegni = await fetch (`${host}/api/regni/posizione/serie_a/${teamData.regni}`).then(res => res.json()).then(data => data[0].position);
    const posizioneDurata = await fetch (`${host}/api/durata/posizione/serie_a/${teamData.durata}`).then(res => res.json()).then(data => data[0].position);
    const posizioneMedia = await fetch (`${host}/api/media/posizione/serie_a/${teamData.media}`).then(res => res.json()).then(data => data[0].position);

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
            />
        </ErrorBoundary>
    );
};

export default TeamPage;