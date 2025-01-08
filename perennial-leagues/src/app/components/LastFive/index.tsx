'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faShieldHalved, faHandshake, faFlag } from '@fortawesome/free-solid-svg-icons';
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
    return outcome === 's' ? faFlag : null;
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
  return (
    <div className="shadow-md rounded-md p-4 bg-background">
      <h2 className="text-left text-xl font-bold mb-4">Last 5 Title Matches</h2>
      <div className="flex justify-end gap-2">
        {[...matches].reverse().map((match, index) => {
          const isLastMatch = index === 0;
          const outcomeIcon = outcomeIcons(team, match.outcome, match.detentore);

          return (
            <div
              key={match.numero}
              className={ `relative text-center p-2 rounded-md cursor-pointer ${outcomeColors(team, match.outcome, match.detentore)} hover:bg-gray-200 transition-all`}
              onClick={() => {window.location.href = `/${match.league}/match/${match.numero}`}}
              title={`${match.data} - ${match.note}`}
            >
              {isLastMatch && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  Latest
                </span>
              )}
              {outcomeIcon && (
                <FontAwesomeIcon
                    icon={outcomeIcon}
                    className="text-2xl mb-2"
                />
              )}
              {/*recuperare i colori avversari
                <Jersey colors={{ primary: 'white', secondary: 'black' }} icon={null}/>
                */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LastFiveMatches;
