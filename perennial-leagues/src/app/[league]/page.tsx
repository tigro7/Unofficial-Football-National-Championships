'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import normalizeLeagueName from '../utils/leaguesMap';

const LeaguePage = ({league = 'serie_a'} : { league: string}) => {
    const [nextMatchNumber, setNextMatchNumber] = useState<string | null>(null);
    const [lastMatchNumber, setLastMatchNumber] = useState<string | null>(null);
    const [randomMatchNumber, setRandomMatchNumber] = useState<string | null>(null);
    const [reigningChampion, setReigningChampion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchNextMatch = async () => {
        try {
            const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
            const response = await fetch(`${host}/api/${league}/matches/last`);
            const data = (await response.json())[0];
            setNextMatchNumber(data.numero);
            const lastMatch = Number(data.numero) - 1;
            setLastMatchNumber(String(lastMatch));
            const randMatch = Math.floor(Math.random() * Number(data.numero));
            setRandomMatchNumber(String(randMatch));
            setReigningChampion(data.detentore);
        } catch (error) {
          console.error("Error fetching next match:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchNextMatch();
    }, [league]);

    return (
        <div className="container mx-auto mt-8 p-4 border-4 rounded-xl shadow-md bg-tertiary bg-[center_top_4rem] bg-no-repeat min-h-screen flex flex-col items-center p-6" style={{ backgroundImage: "url('/homepageback.png')" }}>
          <h1 className="text-4xl md:text-6xl font-bold text-highlights mb-8 text-center">{normalizeLeagueName(league)}</h1>
          <div className="grid grid-cols-1 gap-6 w-full max-w-6xl mt-auto">
            {/* Sezione History & Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Timeline Regni */}
              <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
                <Link href={`/${league}/timeline`}>
                  <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-xl font-bold text-gray-800">📜</p>
                  </div>
                  <h3 className="text-lg font-semibold text-center">Titles Timeline</h3>
                </Link>
              </div>
              {/* Card Campione Attuale */}
              <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system transition cursor-pointer">
                <Link href={reigningChampion ? `/${league}/team/${reigningChampion}` : "#"}>
                  <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-xl font-bold text-gray-800">🏆</p>
                  </div>
                  {isLoading ? (
                    <h3 className="text-lg font-semibold text-center">Reigning Champion</h3>
                  ) : reigningChampion ? (
                    <h3 className="text-lg font-semibold text-center">Reigning Champion: {reigningChampion.charAt(0).toUpperCase() + reigningChampion.slice(1)}</h3>
                  ) : (
                    <p className="text-lg font-semibold text-center">No available Champion</p>
                  )}
                </Link>
              </div>
              {/* Card Ranks */}
              <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
                <Link href={`/${league}/ranks`}>
                  <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-xl font-bold text-gray-800">📊</p>
                  </div>
                  <h3 className="text-lg font-semibold text-center">Ranks</h3>
                </Link>
              </div>
            </div>
            {/* Sezione Title Matches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Random Match */}
              <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
                <Link href={randomMatchNumber ? `/${league}/match/${randomMatchNumber}` : "#"}>
                  <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-xl font-bold text-gray-800">🎲</p>
                  </div>
                  <h3 className="text-lg font-semibold text-center">Random Match</h3>
                </Link>
              </div>
              {/* Card Last Match */}
              <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
                <Link href={lastMatchNumber ? `/${league}/match/${lastMatchNumber}` : "#"}>
                  <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-xl font-bold text-gray-800">⚽</p>
                  </div>
                  <h3 className="text-lg font-semibold text-center">Last Match</h3>
                </Link>
              </div>
              {/* Card Prossimo Match */}
              <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
                <Link href={nextMatchNumber ? `/${league}/match/${nextMatchNumber}` : "#"}>
                  <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-xl font-bold text-gray-800">📅</p>
                  </div>
                  <h3 className="text-lg font-semibold text-center">Next Match</h3>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
};

export default LeaguePage;