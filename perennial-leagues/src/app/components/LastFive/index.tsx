'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faShieldHalved, faHandshake, faFlag, faBan, faCrown} from '@fortawesome/free-solid-svg-icons';
import Jersey from '../Jersey';
import { useState, useEffect } from 'react';
//import Jersey from '../Jersey';

const outcomeColors = (team: string, outcome: 'v' | 's' | 'd', detentore: string) => {
    if (team === detentore){
        return outcome === 'd' ? 'bg-grey-500' : 'bg-green-500';
    }
    return outcome === 'd' ? 'bg-grey-500' : 'bg-red-500';
}

const outcomeIcons = (team: string, outcome: 'v' | 's' | 'd', detentore: string) => {
    if (team === detentore){
        return outcome === 'd' ? faHandshake : outcome === 's' ? faTrophy : faShieldHalved;
    }
    return outcome === 's' ? faFlag : faBan;
}

const LastFiveMatches = ({
    team,
    matches
}: {
    team: string;
    matches: {
        numero: number, detentore: string, sfidante: string, risultato: string, note: string, data: string, durata: number, outcome: 'v' | 's' | 'd', home: string, away: string, league: string
    }[];
    
}) => {

  const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
  // Per ogni matches, aggiungi quello che non è team a una lista di sfidanti, insieme alla league
  const sfidanti = matches.map(match => team === match.detentore ? match.sfidante : match.detentore);
  
  // Elimina i duplicati
  const uniqueSfidanti = Array.from(new Set(sfidanti));
  
  // Richiedi i colori per ogni sfidante all'api /api/league/squadre/sfidante/colori
  const [colors, setColors] = useState<{ [key: string]: { primary: string, secondary: string } }>({});
  
  useEffect(() => {
    const fetchColors = async () => {
      const colorsData: { [key: string]: { primary: string, secondary: string } } = {};
      for (const sfidante of uniqueSfidanti) {
        const response = await fetch(`${host}/api/${matches[0].league}/squadre/${sfidante}/colori`).then(res => res.json());
        const { squadra, colore_primario, colore_secondario } = response[0];
        colorsData[squadra] = { primary: `#${colore_primario}`, secondary: `#${colore_secondario}` };
      }
      setColors(colorsData);
    };
    
    fetchColors();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host]);

  return (
    <div className="shadow-md rounded-md p-4 bg-background">
      <h2 className="text-left text-xl font-bold mb-4">Last 5 Title Matches</h2>
      <div className="flex justify-end gap-2">
        {[...matches].reverse().map((match, index) => {
          const isLastMatch = index === 4;
          const outcomeIcon = outcomeIcons(team, match.outcome, match.detentore);
          const matchSuffix = `vs. ${team === match.detentore ? match.sfidante : match.detentore}`;
          const matchTitle = match.outcome === 'd' ? `Draw (${match.detentore} extends reign)` : match.outcome === 's' ? `${team === match.detentore ? 'Won by' : 'Lost to'} ${match.detentore}` : `Defended by ${match.detentore}`;

          return (
            <div
              key={match.numero}
              className={ `relative text-center p-2 rounded-md cursor-pointer ${outcomeColors(team, match.outcome, match.detentore)} hover:bg-gray-200 transition-all flex flex-col items-center`}
              onClick={() => {window.location.href = `/${match.league}/match/${match.numero}`}}
              title={`${new Date(match.data).toLocaleDateString()} - ${match.note} ${matchTitle} ${team === match.detentore ? matchSuffix : ''}`}
            >
              {isLastMatch && (
                <span className="absolute w-full -bottom-2 left-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full" />
              )}
              {outcomeIcon && (
                <FontAwesomeIcon
                    icon={outcomeIcon}
                    className="text-2xl mb-2"
                />
              )}
              {team !== match.detentore && (<div className='mb-8' />)}
              {team === match.detentore && (
                <FontAwesomeIcon
                    icon={faCrown}
                    className="text-2xl mb-2"
                    color='gold'
                />
              )}
              <p className='text-md font-black'>{match.risultato}</p>
              <Jersey colors={colors ? colors[team === match.detentore ? match.sfidante : match.detentore] : {primary: "#000000", secondary: "#FFFFFF"}} icon={team === match.detentore ? null : "faCrown"} dimensions={"medium"}/>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LastFiveMatches;
