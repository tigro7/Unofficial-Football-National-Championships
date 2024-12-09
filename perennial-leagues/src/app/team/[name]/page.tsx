import React from "react";
import Team from "../team";
import { getSquadra } from "@/app/api/squadre/route";
import { getRegniSerieA } from "@/app/api/regni/serie_a/route";
import { getStartDateSerieA } from "@/app/api/start/serie_a/route";
import { getPosizioneRegniSerieA } from "@/app/api/regni/posizione/serie_a/route";
import { getPosizioneDurataSerieA } from "@/app/api/durata/posizione/serie_a/route";
import { getPosizioneMediaSerieA } from "@/app/api/media/posizione/serie_a/route";
import ErrorBoundary from "@/app/components/ErrorBoundary";

const TeamPage = async ({params,}: {params: Promise<{ name: string }>}) => {

    const squadra = (await params).name;
    const response = await getSquadra(squadra);

    if (!response.ok) {
        throw new Error("Failed to fetch team data");
    }
    const teamData = (await response.json())[0];

    const regni = await(await getRegniSerieA(squadra)).json();
    const startDate = (await(await getStartDateSerieA()).json())[0].data;

    const posizioneRegni = (await(await getPosizioneRegniSerieA(teamData.regni)).json())[0].position;
    const posizioneDurata = (await(await getPosizioneDurataSerieA(teamData.durata)).json())[0].position;
    const posizioneMedia = (await(await getPosizioneMediaSerieA(teamData.media)).json())[0].position;


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