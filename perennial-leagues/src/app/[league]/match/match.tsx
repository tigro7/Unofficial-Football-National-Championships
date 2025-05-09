'use client'

import HeadToHead from "@/app/components/HeadToHead";
import Jersey from "@/app/components/Jersey";
import TrophyTable from "@/app/components/TrophyTable";
import TeamLink from "@/app/components/TeamLink";
import TeamStats from "@/app/components/TeamStats";
import {
  faCrown,
  faTrophy,
  faCalendar,
  faFlag,
  faHandshake,
  faShieldHalved,
  faCircleArrowLeft,
  faCircleArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import { InfoProvider } from "@/contexts/InfoContext/InfoContext";
import InfoWindow from "@/contexts/InfoContext/InfoWindow";
import Link from "next/link";

const Match = ({ matchInfo, teamHome, teamAway, stats, adjacents, league = "serie_a"}: { 
  matchInfo: { date: string, location: string, score?: string, outcome: string, detentore: string, sfidante: string, home: string, away: string, competizione: string, numero: number}, 
  teamHome: { name: string, colors: { primary: string, secondary: string }, abbr: string}, 
  teamAway: { name: string, colors: { primary: string, secondary: string }, abbr: string}, 
  stats: { headToHead: {home: number, away: number, draw: number}, teamHomeTitles: number, teamAwayTitles: number },
  adjacents: { previous: number, next: number },
  league: string
}) => {
  
    const iconHome = matchInfo.detentore === teamHome.name ? faCrown : matchInfo.detentore === teamAway.name && matchInfo.outcome === 's' ? faFlag : null;
    const iconAway = matchInfo.detentore === teamAway.name ? faCrown : matchInfo.detentore === teamHome.name && matchInfo.outcome === 's' ? faFlag : null;
    const iconMatch = matchInfo.outcome === 'd' ? faHandshake : matchInfo.outcome === 's' ? faTrophy : matchInfo.outcome === 'v' ? faShieldHalved : faCalendar;
    const iconTitle = matchInfo.outcome === 'd' ? `Draw (${matchInfo.detentore} still reigns)` : matchInfo.outcome === 's' ? `Won by ${matchInfo.detentore}` : matchInfo.outcome === 'v' ? `Defended by ${matchInfo.detentore}` : 'Scheduled';
    const iconColor = matchInfo.outcome === 's' ? 'gold' : '';

    const [iconStats, setStats] = useState([]);

    const [matchDate, setMatchDate] = useState<string | null>(null);

    const router = useRouter();
  
    useEffect(() => {
      const fetchStats = async () => {
        try {
          const response = await fetch(`/api/${league}/stats/match/${matchInfo.numero}`);
          const data = await response.json();
          setStats(data);
        } catch (error) {
          console.error("Errore nel caricamento delle statistiche", error);
        }
      };
  
      fetchStats();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setMatchDate(new Date(matchInfo.date).toLocaleDateString());
    }, [league, matchInfo.date, matchInfo.numero]);

    const [swipeProgress, setSwipeProgress] = useState<number | null>(null); // Valore progressivo per il feedback

    const handlers = useSwipeable({
      onSwiping: (eventData) => {
        // Calcola la percentuale di completamento dello swipe
        const maxSwipe = window.innerWidth / 2; // Distanza massima per lo swipe
        const progress = Math.min(Math.abs(eventData.deltaX) / maxSwipe, 1); // Limita al 100%
  
        if (eventData.dir === "Left" && adjacents.next) {
          setSwipeProgress(progress); // Aggiorna per lo swipe a sinistra
        } else if (eventData.dir === "Right" && adjacents.previous) {
          setSwipeProgress(-progress); // Aggiorna per lo swipe a destra
        } else {
          setSwipeProgress(null); // Nessun feedback
        }
      },
      onSwiped: (eventData) => {
        // Naviga alla pagina corrispondente se lo swipe è completo
        if (eventData.dir === "Left" && adjacents.next) {
          router.push(`/${league}/match/${adjacents.next}`);
        } else if (eventData.dir === "Right" && adjacents.previous) {
          router.push(`/${league}/match/${adjacents.previous}`);
        }
        setSwipeProgress(null); // Resetta il feedback
      },
      preventScrollOnSwipe: false,
      trackTouch: true,
    });

    return (
      <InfoProvider>
        <title>{league} - Match - UFNC</title>
        <div className="container mx-auto p-4 bg-system" {...handlers}>
          {/* Feedback visivo con progressivo */}
                {swipeProgress !== null && (
                <div
                  className="fixed top-0 h-full transition-transform duration-100 ease-out"
                  style={{
                  left: swipeProgress < 0 ? 0 : undefined,
                  right: swipeProgress > 0 ? 0 : undefined,
                  width: `${Math.min(Math.abs(swipeProgress) * 100, 15)}%`, // Limita al 10%
                  backgroundColor: "rgba(0, 0, 0, 0.2)", // Ombra trasparente
              }}
            />
          )}

          {adjacents.previous && (
            <Link
              className="landscape:hidden fixed left-0 top-1/2 transform -translate-y-1/2 p-4"
              href={`/${league}/match/${adjacents.previous}`}
              style={{ zIndex: 1000 }}
            >
              <FontAwesomeIcon icon={faCircleArrowLeft} size="2x" />
            </Link>
          )}
          {adjacents.next && (
            <Link
              className="landscape:hidden fixed right-0 top-1/2 transform -translate-y-1/2 p-4"
              href={`/${league}/match/${adjacents.next}`}
              style={{ zIndex: 1000 }}
            >
              <FontAwesomeIcon icon={faCircleArrowRight} size="2x" />
            </Link>
          )}

            {/* Intestazione con nomi delle squadre e maglie */}
            <div className="flex justify-between items-center mb-6">
              {/* Squadra A */}
              <div className="flex flex-col items-center w-1/3">
                <div className="h-12 flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-center">
                    <TeamLink
                      league={league}
                      teamName={teamHome.abbr?.length > 0 && window.innerWidth <= 768 ? teamHome.abbr : matchInfo.home}
                      teamLink={teamHome.name}
                    />
                    </h2>
                </div>
                <Link href={`/${league}/team/${teamHome.name}`} title={teamHome.name}>
                  <Jersey colors={teamHome.colors} icon={iconHome} />
                </Link>
              </div>

              {/* Dettagli del Match */}
              <div className="flex flex-col items-center text-center w-1/3">
                <h1 className="text-3xl font-bold mb-2">Match</h1>
                <p className="text-sm font-bold">
                  <Link href={`/${league}`} className="link-secondary">
                    {matchInfo.competizione}
                  </Link>
                </p>
                <p className="text-lg italic">
                  {adjacents.previous && <Link className="portrait:hidden mr-8" href={`/${league}/match/${adjacents.previous}`} title="previous match"><FontAwesomeIcon icon={faCircleArrowLeft}/></Link>}
                  {matchDate}
                  {adjacents.next && <Link className="portrait:hidden ml-8" href={`/${league}/match/${adjacents.next}`} title="next match"><FontAwesomeIcon icon={faCircleArrowRight}/></Link>}
                </p>
                <p className="text-md">{matchInfo.location}</p>
                {matchInfo.score && (
                  <p className="text-2xl font-bold mt-2">{matchInfo.score}</p>
                )}
                <p title={iconTitle}>
                  <FontAwesomeIcon
                    icon={iconMatch}
                    className="text-4xl mt-2"
                    color={iconColor}
                  />
                </p>
              </div>

              {/* Squadra B */}
              <div className="flex flex-col items-center w-1/3">
                <div className="h-12 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-center">
                    <TeamLink
                      league={league}
                      teamName={teamAway.abbr?.length > 0 && window.innerWidth <= 768 ? teamAway.abbr : matchInfo.away}
                      teamLink={teamAway.name}
                    />
                  </h2>
                </div>
                <Link href={`/${league}/team/${teamAway.name}`} title={teamAway.name}>
                  <Jersey colors={teamAway.colors} icon={iconAway} />
                </Link>
              </div>
            </div>

            <div className="flex justify-around mb-6">
                <TeamStats stats={iconStats} match={true}/>
            </div>

            {/* Statistiche principali */}
            <div className="flex justify-around mb-6 whitespace-pre-line">
              <TrophyTable titles={stats.teamHomeTitles} match={true} className={"portrait:hidden w-1/3"}/>
              <HeadToHead home={stats.headToHead.home} draw={stats.headToHead.draw} away={stats.headToHead.away} colorHome={teamHome.colors.primary == "#FFFFFF" ? teamHome.colors.secondary : teamHome.colors.primary} colorAway={teamAway.colors.primary == "#FFFFFF" ? teamAway.colors.secondary : teamAway.colors.primary} />
              <TrophyTable titles={stats.teamAwayTitles} match={true} className={"portrait:hidden w-1/3"}/>
            </div>
            <div className="flex justify-around mb-6 whitespace-pre-line landscape:hidden">
              <TrophyTable titles={stats.teamHomeTitles} match={true} className={"w-1/2"}/>
              <TrophyTable titles={stats.teamAwayTitles} match={true} className={"w-1/2"}/>
            </div>
        </div>
        <InfoWindow />
      </InfoProvider>
    );
};

export default Match;
