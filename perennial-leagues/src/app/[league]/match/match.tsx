'use client'

import Jersey from "@/app/components/Jersey";
import TeamLink from "@/app/components/TeamLink";
import TeamStats from "@/app/components/TeamStats";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const containerStat = (color: string, statname: string, statvalue: number | string, description: string) => {
  return (
    <div className="text-center" style={{ color }}>
      <p className="text-xl font-semibold">{statname}</p>
      <p className="text-3xl">{statvalue}</p>
      <p className="text-sm italic mt-2">{description}</p>
    </div>
  );
};

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
        <div className="container mx-auto mt-8 p-4 border-4 rounded-xl" style={{ borderColor: teamHome.colors.primary }}>
            {/* Intestazione con nomi delle squadre e maglie */}
            <div className="flex justify-between items-center mb-6">
                {/* Squadra A */}
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold" style={{ color: teamHome.colors.primary }}>
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
                        
                            <p className="text-2xl font-bold mt-2" style={{ color: teamHome.colors.primary }}>
                                {matchInfo.score}
                            </p>
                        
                    )}
                    <FontAwesomeIcon icon={fas[iconMatch]} className="text-4xl mt-2" />
                </div>

                {/* Squadra B */}
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold" style={{ color: teamAway.colors.primary }}>
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
            {containerStat(teamHome.colors.primary, `Titoli di ${teamHome.name}`, stats.teamHomeTitles, `Totale titoli vinti da ${teamHome.name}`)}
            {containerStat(teamHome.colors.primary, 'Testa a Testa', `${stats.headToHead.home} ${stats.headToHead.draw} ${stats.headToHead.away}`, 'Titoli giocati tra le squadre')}
            {containerStat(teamAway.colors.primary, `Titoli di ${teamAway.name}`, stats.teamAwayTitles, `Totale titoli vinti da ${teamAway.name}`)}
            </div>
        </div>
    );
};

export default Match;
