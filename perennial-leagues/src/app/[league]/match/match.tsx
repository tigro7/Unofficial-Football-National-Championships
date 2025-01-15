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
import { useEffect, useRef, useState } from "react";

const Match = ({ matchInfo, teamHome, teamAway, stats, adjacents, league = "serie_a"}: { 
  matchInfo: { date: string, location: string, score?: string, outcome: string, detentore: string, sfidante: string, home: string, away: string, competizione: string, numero: number}, 
  teamHome: { name: string, colors: { primary: string, secondary: string } }, 
  teamAway: { name: string, colors: { primary: string, secondary: string } }, 
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
    }, [league, matchInfo.numero]);

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
  
    const handleTouchStart = (event: React.TouchEvent) => {
      touchStartX.current = event.touches[0].clientX;
    };
  
    const handleTouchMove = (event: React.TouchEvent) => {
      touchEndX.current = event.touches[0].clientX;
    };
  
    const handleTouchEnd = () => {
      if (touchStartX.current !== null && touchEndX.current !== null) {
        const deltaX = touchStartX.current - touchEndX.current;
  
        // Swipe verso sinistra (vai alla pagina successiva)
        if (deltaX > 50 && adjacents.next) {
          window.location.href = `/${league}/match/${adjacents.next}`;
        }
  
        // Swipe verso destra (vai alla pagina precedente)
        if (deltaX < -50 && adjacents.previous) {
          window.location.href = `/${league}/match/${adjacents.previous}`;
        }
      }
  
      // Resetta i valori dopo il completamento dello swipe
      touchStartX.current = null;
      touchEndX.current = null;
    };

    return (
        <div className="container mx-auto mt-8 p-4 border-4 rounded-xl bg-system"       
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {adjacents.previous && (
            <a
              className="landscape:hidden fixed left-0 top-1/2 transform -translate-y-1/2 p-4"
              href={`/${league}/match/${adjacents.previous}`}
              style={{ zIndex: 1000 }}
            >
              <FontAwesomeIcon icon={faCircleArrowLeft} size="2x" />
            </a>
          )}
          {adjacents.next && (
            <a
              className="landscape:hidden fixed right-0 top-1/2 transform -translate-y-1/2 p-4"
              href={`/${league}/match/${adjacents.next}`}
              style={{ zIndex: 1000 }}
            >
              <FontAwesomeIcon icon={faCircleArrowRight} size="2x" />
            </a>
          )}

            {/* Intestazione con nomi delle squadre e maglie */}
            <div className="flex justify-between items-center mb-6">
              {/* Squadra A */}
              <div className="flex flex-col items-center w-1/3">
                <div className="h-12 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-center">
                    <TeamLink league={league} teamName={matchInfo.home} teamLink={teamHome.name} />
                  </h2>
                </div>
                <Jersey colors={teamHome.colors} icon={iconHome} />
              </div>

              {/* Dettagli del Match */}
              <div className="flex flex-col items-center text-center w-1/3">
                <h1 className="text-3xl font-bold mb-2">Match</h1>
                <p className="text-sm font-bold">
                  {matchInfo.competizione}
                </p>
                <p className="text-lg italic">
                  {adjacents.previous && <a className="portrait:hidden mr-8" href={`/${league}/match/${adjacents.previous}`}><FontAwesomeIcon icon={faCircleArrowLeft}/></a>}
                  {new Date(matchInfo.date).toLocaleDateString()}
                  {adjacents.next && <a className="portrait:hidden ml-8" href={`/${league}/match/${adjacents.next}`}><FontAwesomeIcon icon={faCircleArrowRight}/></a>}
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
                    <TeamLink league={league} teamName={matchInfo.away} teamLink={teamAway.name}/>
                  </h2>
                </div>
                <Jersey colors={teamAway.colors} icon={iconAway} />
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
    );
};

export default Match;
