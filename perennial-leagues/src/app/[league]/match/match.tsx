'use client'

import Jersey from "@/app/components/Jersey";
import StatContainer from "@/app/components/StatContainer";
import TeamLink from "@/app/components/TeamLink";
import TeamStats from "@/app/components/TeamStats";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const getDateForLink = (date: string) => {
    const localDate = new Date(date).toLocaleDateString();
    return localDate.split('/').reverse().join('-');
};

const Match = ({ matchInfo, teamHome, teamAway, stats, dates, league = "serie_a"}: { 
  matchInfo: { date: string, location: string, score?: string, outcome: string, detentore: string }, 
  teamHome: { name: string, colors: { primary: string, secondary: string } }, 
  teamAway: { name: string, colors: { primary: string, secondary: string } }, 
  stats: { headToHead: {home: number, away: number, draw: number}, teamHomeTitles: number, teamAwayTitles: number },
  dates: { previous: string, next: string },
  league: string
}) => {
    const iconHome = matchInfo.detentore === teamHome.name ? 'faCrown' : matchInfo.detentore === teamAway.name && matchInfo.outcome === 's' ? 'faFlag' : null;
    const iconAway = matchInfo.detentore === teamAway.name ? 'faCrown' : matchInfo.detentore === teamHome.name && matchInfo.outcome === 's' ? 'faFlag' : null;
    const iconMatch = matchInfo.outcome === 'd' ? 'faHandshake' : matchInfo.outcome === 's' ? 'faTrophy' : matchInfo.outcome === 'v' ? 'faShieldHalved' : 'faCalendar';

      const [iconStats, setStats] = useState([]);
    
        useEffect(() => {
          const fetchStats = async () => {
            try {
              const response = await fetch(`/api/${league}/stats/match/${getDateForLink(matchInfo.date)}`);
              const data = await response.json();
              setStats(data);
            } catch (error) {
              console.error("Errore nel caricamento delle statistiche", error);
            }
          };
      
          fetchStats();
      }, [league, matchInfo.date]);

    return (
        <div className="container mx-auto mt-8 p-4 border-4 rounded-xl bg-slate-50">
            {/* Intestazione con nomi delle squadre e maglie */}
            <div className="flex justify-between items-center mb-6">
                {/* Squadra A */}
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold">
                        <TeamLink league={league} teamName={teamHome.name} />
                    </h2>
                    <Jersey colors={teamHome.colors} icon={iconHome}/>
                </div>

                {/* Dettagli del Match */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Match</h1>
                    <p className="text-lg italic">
                        {dates.previous && <a href={`/${league}/match/${getDateForLink(dates.previous)}`}>{'<-  '}</a>}
                        {new Date(matchInfo.date).toLocaleDateString()}
                        {dates.next && <a href={`/${league}/match/${getDateForLink(dates.next)}`}>{'  ->'}</a>}
                    </p>
                    <p className="text-lg">{matchInfo.location}</p>
                    {matchInfo.score && (
                        
                            <p className="text-2xl font-bold mt-2">
                                {matchInfo.score}
                            </p>
                        
                    )}
                    <FontAwesomeIcon icon={fas[iconMatch]} className="text-4xl mt-2" color={iconMatch == 'faTrophy' ? 'gold' : ''}
                      title={iconMatch == 'faTrophy' ? `Won by ${matchInfo.detentore}` : 
                              iconMatch == 'faCalendar' ? 'Scheduled' : 
                                iconMatch == 'faHandshake' ? `Draw (${matchInfo.detentore} still reigns)` :
                                 `Defended by ${matchInfo.detentore}`}
                    />
                </div>

                {/* Squadra B */}
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold">
                        <TeamLink league={league} teamName={teamAway.name} />
                    </h2>
                    <Jersey colors={teamAway.colors} icon={iconAway}/>
                </div>
            </div>

            <div className="flex justify-around mb-6">
                <TeamStats stats={iconStats} match={true}/>
            </div>

            {/* Statistiche principali */}
            <div className="flex justify-around mb-6">
              <StatContainer statName={`${teamHome.name} titles`} statValue={stats.teamHomeTitles} color={"#000000"} position={`${teamHome.name} titles up to this match`}/>
              <StatContainer statName={'Head to Head'} statValue={`${stats.headToHead.home} ${stats.headToHead.draw} ${stats.headToHead.away}`} color={"#000000"} position={'H2H leading up to this match'}/>  
              <StatContainer statName={`${teamAway.name} titles`} statValue={stats.teamAwayTitles} color={"#000000"} position={`${teamAway.name} titles up to this match`}/>
            </div>
        </div>
    );
};

export default Match;
