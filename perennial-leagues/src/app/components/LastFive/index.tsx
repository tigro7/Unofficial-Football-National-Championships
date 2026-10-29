'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faShieldHalved, faHandshake, faFlag, faBan, faCrown} from '@fortawesome/free-solid-svg-icons';
import Jersey from '../Jersey';
import { useState, useEffect } from 'react';
import Link from 'next/link';
//import Jersey from '../Jersey';

const outcomeColors = (team: string, outcome: 'v' | 's' | 'd', detentore: string) => {
    if (team === detentore){
        return outcome === 'd' ? 'matchDraw' : 'matchWon';
    }
    return outcome === 'd' ? 'matchDraw' : 'matchLost';
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
    <div className="grid grid-cols-5 gap-[var(--margin-sm)]">
      {[...matches].reverse().map((match) => {
        const opponent = team === match.detentore ? match.sfidante : match.detentore;
        const outcomeIcon = outcomeIcons(team, match.outcome, match.detentore);
        const opponentColors = colors?.[opponent] ?? { primary: '#000000', secondary: '#ffffff' };

        return (
          <Link
            href={`/${match.league}/match/${match.numero}`}
            key={match.numero}
            className={`card p-[var(--margin-md)] flex flex-col items-center gap-[var(--margin-xs)] hover:hover-match transition-all ${outcomeColors(team, match.outcome, match.detentore)}`}
          >
            <div className="flex items-center gap-[var(--margin-xs)]">
              {team === match.detentore && <FontAwesomeIcon icon={faCrown} className="text-sm" color="gold" />}
              {outcomeIcon && <FontAwesomeIcon icon={outcomeIcon} className="text-lg" />}
            </div>
            <p className="sub font-black">{match.risultato || '—'}</p>
            <Jersey
              colors={opponentColors}
              icon={team === match.detentore ? null : 'faCrown'}
              dimensions="medium"
              ariaLabel={opponent}
            />
            <p className="text-xs font-semibold text-center capitalize leading-tight">{opponent}</p>
            <p className="text-xs text-center opacity-70">{new Date(match.data).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
          </Link>
        );
      })}
    </div>
  );
};

export default LastFiveMatches;
