'use client'

import Jersey from "../components/Jersey";
import TeamLink from "../components/TeamLink";

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

const Match = ({ matchInfo, teamHome, teamAway, stats, dates}: { 
  matchInfo: { date: string, location: string, score?: string }, 
  teamHome: { name: string, colors: { primary: string, secondary: string } }, 
  teamAway: { name: string, colors: { primary: string, secondary: string } }, 
  stats: { headToHead: {home: number, away: number, draw: number}, teamHomeTitles: number, teamAwayTitles: number },
  dates: { previous: string, next: string }
}) => {

    return (
        <div className="container mx-auto mt-8 p-4 border-4 rounded-xl" style={{ borderColor: teamHome.colors.primary }}>
            {/* Intestazione con nomi delle squadre e maglie */}
            <div className="flex justify-between items-center mb-6">
            {/* Squadra A */}
            <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold" style={{ color: teamHome.colors.primary }}>
                    <TeamLink teamName={teamHome.name} />
                </h2>
                <Jersey colors={teamHome.colors} />
            </div>

            {/* Dettagli del Match */}
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Match</h1>
                <p className="text-lg italic">
                    <a href={`/match/${getDateForLink(dates.previous)}/serie_a`}>{'<'}</a>
                    {new Date(matchInfo.date).toLocaleDateString()}
                    <a href={`/match/${getDateForLink(dates.next)}/serie_a`}>{'>'}</a>
                </p>
                <p className="text-lg">{matchInfo.location}</p>
                {matchInfo.score && (
                <p className="text-2xl font-bold mt-2" style={{ color: teamHome.colors.primary }}>
                    {matchInfo.score}
                </p>
                )}
            </div>

            {/* Squadra B */}
            <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold" style={{ color: teamAway.colors.primary }}>
                    <TeamLink teamName={teamAway.name} />
                </h2>
                <Jersey colors={teamAway.colors} />
            </div>
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
