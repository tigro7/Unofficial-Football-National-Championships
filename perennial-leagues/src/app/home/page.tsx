'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home(){
    const [nextMatchDate, setNextMatchDate] = useState<string | null>(null);
    const [reigningChampion, setReigningChampion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchNextMatch = async () => {
        try {
          const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
          const response = await fetch(`${host}/api/serie_a/matches/last`);
          const data = (await response.json())[0];

          console.info(data);
  
          // Format the date
          const nextMatchDate = new Date(data.data)
            .toLocaleDateString()
            .split('/')
            .reverse()
            .join('-');
          setNextMatchDate(nextMatchDate);
          setReigningChampion(data.detentore);
        } catch (error) {
          console.error("Error fetching next match:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchNextMatch();
    }, []);

    return(
        <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/homepageback.png')" }}>
            <div className="bg-black bg-opacity-50 min-h-screen flex flex-col items-center p-6">
                <h1 className="text-4xl md:text-6xl font-bold text-highlights mb-10 text-center">Unofficial Football National Championships</h1>
                <div className="grid grid-cols-1 gap-6 w-full max-w-6xl">
                    {/* Container per ogni lega */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Serie A</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Card Campione Attuale */}
                        <div className="card bg-gray-200 rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-gray-300 transition cursor-pointer">
                            <div className="h-32 w-full bg-gray-400 rounded-lg mb-4 flex items-center justify-center">
                            {/* Immagine o icona */}
                            <p className="text-xl font-bold text-gray-800">🏆</p>
                            </div>
                            {isLoading ?
                                (<h3 className="text-lg font-semibold text-center">Reigning Champion</h3>)
                                : reigningChampion ?
                                (<Link href={`/serie_a/team/${reigningChampion}`}>
                                    <h3 className="text-lg font-semibold text-center">Reigning Champion: {reigningChampion.charAt(0).toUpperCase() + reigningChampion.slice(1)}</h3>
                                </Link>)
                                : (<p className="text-lg font-semibold text-center">No available Champion</p>)
                            }
                        </div>
                        {/* Card Timeline Regni */}
                        <div className="card bg-gray-200 rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-gray-300 transition cursor-pointer">
                            <div className="h-32 w-full bg-gray-400 rounded-lg mb-4 flex items-center justify-center">
                            {/* Immagine o icona */}
                            <p className="text-xl font-bold text-gray-800">📜</p>
                            </div>
                            <Link href="/serie_a/timeline">
                                <h3 className="text-lg font-semibold text-center">Titles Timeline</h3>
                            </Link>
                        </div>
                        {/* Card Prossimo Match */}
                        <div className="card bg-gray-200 rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-gray-300 transition cursor-pointer">
                            <div className="h-32 w-full bg-gray-400 rounded-lg mb-4 flex items-center justify-center">
                            {/* Immagine o icona */}
                            <p className="text-xl font-bold text-gray-800">⚽</p>
                            </div>
                            {isLoading ? 
                                (<h3 className="text-lg font-semibold text-center">Next Match</h3>)
                                : nextMatchDate ? 
                                (<Link href={`/serie_a/match/${nextMatchDate}`}>
                                    <h3 className="text-lg font-semibold text-center">Next Match</h3>
                                </Link>)
                                : (<p className="text-lg font-semibold text-center">No match available</p>)
                            }
                        </div>
                    </div>
                </div>
                {/* Ripetere per altre leghe */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Premier League</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Stesse card qui */}
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
