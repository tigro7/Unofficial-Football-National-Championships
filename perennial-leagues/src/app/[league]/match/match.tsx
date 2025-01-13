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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

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

    return (
        <div className="container mx-auto mt-8 p-4 border-4 rounded-xl bg-system">
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
                  {adjacents.previous && <a className="portrait:hidden" href={`/${league}/match/${adjacents.previous}`}>{'<-  '}</a>}
                  {new Date(matchInfo.date).toLocaleDateString()}
                  {adjacents.previous && <a className="landscape:hidden" href={`/${league}/match/${adjacents.previous}`}>{'<-'}</a>}
                  {adjacents.next && <a href={`/${league}/match/${adjacents.next}`}>{'  ->'}</a>}
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
              <TrophyTable titles={stats.teamHomeTitles} match={true}/>
              <HeadToHead home={stats.headToHead.home} draw={stats.headToHead.draw} away={stats.headToHead.away} colorHome={teamHome.colors.primary} colorAway={teamAway.colors.primary} />
              <TrophyTable titles={stats.teamAwayTitles} match={true}/>
            </div>
        </div>
    );
};

export default Match;
