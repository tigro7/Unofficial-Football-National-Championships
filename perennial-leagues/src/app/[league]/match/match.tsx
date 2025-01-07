'use client'

import Jersey from "@/app/components/Jersey";
import StatContainer from "@/app/components/StatContainer";
import TeamLink from "@/app/components/TeamLink";
import TeamStats from "@/app/components/TeamStats";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const Match = ({ matchInfo, teamHome, teamAway, stats, adjacents, league = "serie_a"}: { 
  matchInfo: { date: string, location: string, score?: string, outcome: string, detentore: string, competizione: string, numero: number}, 
  teamHome: { name: string, colors: { primary: string, secondary: string } }, 
  teamAway: { name: string, colors: { primary: string, secondary: string } }, 
  stats: { headToHead: {home: number, away: number, draw: number}, teamHomeTitles: number, teamAwayTitles: number },
  adjacents: { previous: number, next: number },
  league: string
}) => {
    const iconHome = matchInfo.detentore === teamHome.name ? 'faCrown' : matchInfo.detentore === teamAway.name && matchInfo.outcome === 's' ? 'faFlag' : null;
    const iconAway = matchInfo.detentore === teamAway.name ? 'faCrown' : matchInfo.detentore === teamHome.name && matchInfo.outcome === 's' ? 'faFlag' : null;
    const iconMatch = matchInfo.outcome === 'd' ? 'faHandshake' : matchInfo.outcome === 's' ? 'faTrophy' : matchInfo.outcome === 'v' ? 'faShieldHalved' : 'faCalendar';

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
                    <TeamLink league={league} teamName={teamHome.name} />
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
                  {adjacents.previous && window.matchMedia("(min-width: 1024px)").matches && <a href={`/${league}/match/${adjacents.previous}`}>{'<-  '}</a>}
                  {new Date(matchInfo.date).toLocaleDateString()}
                  {adjacents.previous && !window.matchMedia("(min-width: 1024px)").matches && <><br /><a href={`/${league}/match/${adjacents.previous}`}>{'<-'}</a></>}
                  {adjacents.next && <a href={`/${league}/match/${adjacents.next}`}>{'  ->'}</a>}
                </p>
                <p className="text-md">{matchInfo.location}</p>
                {matchInfo.score && (
                  <p className="text-2xl font-bold mt-2">{matchInfo.score}</p>
                )}
                <FontAwesomeIcon
                  icon={fas[iconMatch]}
                  className="text-4xl mt-2"
                  color={iconMatch === 'faTrophy' ? 'gold' : ''}
                  title={
                    iconMatch === 'faTrophy'
                      ? `Won by ${matchInfo.detentore}`
                      : iconMatch === 'faCalendar'
                      ? 'Scheduled'
                      : iconMatch === 'faHandshake'
                      ? `Draw (${matchInfo.detentore} still reigns)`
                      : `Defended by ${matchInfo.detentore}`
                  }
                />
              </div>

              {/* Squadra B */}
              <div className="flex flex-col items-center w-1/3">
                <div className="h-12 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-center">
                    <TeamLink league={league} teamName={teamAway.name} />
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
              <StatContainer statName={`${teamHome.name} ${window.matchMedia("(min-width: 1024px)").matches ? "" : "\n"}titles`} 
                             statValue={stats.teamHomeTitles} 
                             position={`${teamHome.name} titles up to this match`}
              />
              <StatContainer statName={'Head to Head'} 
                             statValue={`${stats.headToHead.home} ${stats.headToHead.draw} ${stats.headToHead.away}`} 
                             position={'H2H leading up to this match'}
              />  
              <StatContainer statName={`${teamAway.name} ${window.matchMedia("(min-width: 1024px)").matches ? "" : "\n"}titles`} 
                             statValue={stats.teamAwayTitles} 
                             position={`${teamAway.name} titles up to this match`}
              />
            </div>
        </div>
    );
};

export default Match;
